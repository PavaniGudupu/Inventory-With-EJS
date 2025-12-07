import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";
import { field_Validation, id_Validation } from "./middleware/validation.js";

const app = express();
const port = 4000;

env.config();

const db = new pg.Client({
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
db.connect();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());



app.get("/", (req, res) => {
    res.render("home.ejs");
});

app.get("/createInventory", (req, res) => {
  res.redirect("/products/add");
})

app.get("/openInventory", (req, res) => {
  res.render("openInventory.ejs");
});

// Products list with pagination
app.post("/products", async (req, res) => {
  try {
    // categories for dropdown
    const filterColumns = await db.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'products'
      ORDER BY ordinal_position;
      `);
    
      //console.log(categoriesRes.rows);
      const searchValue = req.body.searchValue;
      const filterCategory = req.body.filterCategory;  

      if(searchValue && filterCategory) {
        const filterData = await db.query(`
            SELECT P.*, C.* FROM products AS P
            LEFT JOIN category AS C ON P.category_id = C.category_id
            WHERE CAST(${filterCategory} AS TEXT) ILIKE $1
            ORDER BY P.id ASC;
          `,
          [`%${searchValue}%`]);

      return res.render("filter.ejs", {
      products: filterData.rows,   // JSON DATA
      }); 
        }

    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 5;
    const offset = (page - 1) * limit;
    const totalResult = await db.query("SELECT COUNT(*) FROM products"); // returns { count: '30' }
    const total = Number(totalResult.rows[0].count);
    
    const data = await db.query(`
        SELECT P.*, C.* FROM products AS P LEFT JOIN category AS c
        ON P.category_id = C.category_id 
        ORDER BY P.id ASC OFFSET $1 LIMIT $2
      `, [offset, limit]);
    const dataResult = data.rows;

    //Pagination Object
    const result = {
      current: { page, limit },
      totalPages: Math.ceil(total / limit),
      results: dataResult //products, category data after JOINING TABLES
    };

    if(offset + limit < total) { // 1+5=6=> current page(6) < total(30) => next
      result.next = {
        page: page + 1,
        limit: limit
      }
    }
    if(offset > 0) { // index > 0
      result.previous = {
        page: page - 1,
        limit: limit
      }
    }

    //console.log(result)

    // use paginated results from middleware
    res.render("productList.ejs", {
      products: result.results,   // JSON DATA
      categories: filterColumns.rows,
      pagination: result ,    
    });

  } catch (error) {
    res.status(500).send("Error fetching products: " + error.message);
  }
});



//To show category dropdown values, we render from db and show here.
app.get("/products/add", async(req, res) => {
    const categoriesRes = await db.query("SELECT * FROM category ORDER BY category_id ASC");
    res.render("product.ejs", { categories: categoriesRes.rows });
})


// Insert product (API JSON)
app.post("/products/add", id_Validation, field_Validation, async (req, res) => {
  try {
    const { id, name, category_id, mrp, sp, cp, classification, size } = req.body;

    // Duplicate checks
    const codeCheck = await db.query("SELECT * FROM products WHERE id=$1", [id]);
    if (codeCheck.rows.length > 0) return res.status(400).send("Code already exists.");
    const nameCheck = await db.query("SELECT * FROM products WHERE product_name=$1", [name]);
    if (nameCheck.rows.length > 0) return res.status(400).send("Product name already exists.");

    // Insert
    const result = await db.query(
      `INSERT INTO products (id, product_name, category_id, mrp, sp, cp, classification, size) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [id, name, category_id, mrp, sp, cp, classification, size]
    );
      
   // Fetch all products, category again for rendering
   //Why again? - we are inserting, so it is updated. so need to send updated data
   // returns all rows
    // const allProducts = await db.query(`
    //   SELECT p.*, c.category 
    //   FROM products p
    //   LEFT JOIN category c ON p.category_id = c.category_id ORDER BY p.id ASC
    // `);

    //showing prd, category data(that is inserterd) into product list.
    // shows all rows from join query
    //const categoriesRes = await db.query("SELECT * FROM category ORDER BY category_id ASC");
    res.redirect("/openInventory");
    console.log({ message: "✅ Product added successfully", product: result.rows[0] })

  } catch (error) {
    res.status(500).send("▲ Server error: " + error.message);
  }
});

// Get UPdate data
// GET the page with feilds auto filled
app.get("/products/edit/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const productRes = await db.query("SELECT * FROM products WHERE id=$1", [id]);
    const categoriesRes = await db.query("SELECT * FROM category ORDER BY category_id ASC");
    res.render("update.ejs", { product: productRes.rows[0], categories: categoriesRes.rows });
  } catch (error) {
    res.status(500).send("Error fetching product: " + error.message);
  }
});

// Update product (API JSON)
app.post("/products/edit/:id", id_Validation, field_Validation, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, category_id, mrp, sp, cp, classification, size } = req.body;

    const idCheck = await db.query("SELECT * FROM products WHERE id=$1", [id]);
    if (idCheck.rows.length === 0) return res.status(400).send("ID not exists");

    const result = await db.query(
      `UPDATE products SET product_name=$2, category_id=$3, mrp=$4, sp=$5, cp=$6, classification=$7, size=$8 
       WHERE id=$1 RETURNING *`,
      [id, name, category_id, mrp, sp, cp, classification, size]
    );

        // Fetch all products again for rendering
    // const allProducts = await db.query(`
    //   SELECT p.*, c.category 
    //   FROM products p
    //   LEFT JOIN category c ON p.category_id = c.category_id
    //   ORDER BY p.id ASC
    // `);

    // const categoriesRes = await db.query("SELECT * FROM category ORDER BY category_id ASC");
    res.redirect("/openInventory")

    console.log({ message: "✅ Product updated successfully", product: result.rows[0] });

  } catch (error) {
    res.status(500).send("▲ Server error: " + error.message);
  }
});


// API: Delete product by ID (JSON response)



// Delete product (API JSON)
app.post("/products/delete/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).send("Invalid ID");
  }
  
  try {
    const result = await db.query("DELETE FROM products WHERE id=$1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).send("Product not found");
    }

    res.redirect("/openInventory");
    console.log("Product deleted:", result.rows[0]);

  } catch (error) {
    res.status(500).send("Server error: " + error.message);
  }
});


app.listen(port, (req, res) => {
  console.log(`Server running on port: http://localhost:${port}`);
});
