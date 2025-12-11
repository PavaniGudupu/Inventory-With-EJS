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

// Default page load

// Products list with pagination
app.post("/products", async (req, res) => {
  try {
    // Search Inputs
      const searchValue = req.body.searchValue;
      const filterCategory = req.body.filterCategory;  
      //let products;
      
      if(searchValue && filterCategory) {
        
        //search Pagination Variables. 
        const page = parseInt(req.body.page) || 1;
        const limit = parseInt(req.body.limit) || 10;
        const offset = (page - 1) * limit;
     
          // Count total filtered results
          const countQuery = `
            SELECT COUNT(*) FROM products AS P
            LEFT JOIN category AS C ON P.category_id = C.category_id
            WHERE ${filterCategory}::text ILIKE $1
          `;
          const totalResult = await db.query(countQuery, [`%${searchValue}%`]);
          const total = Number(totalResult.rows[0].count);

        // Fetch paginated filtered results
        const filterData = await db.query(`
          SELECT P.*, C.* FROM products AS P
          LEFT JOIN category AS C ON P.category_id = C.category_id
          WHERE ${filterCategory}::text ILIKE $1
          ORDER BY P.id ASC
          OFFSET $2 LIMIT $3
        `, [`%${searchValue}%`, offset, limit]);
        
        const result = {
          current: { page, limit },
          totalPages: Math.ceil(total / limit),
          results: filterData.rows
        };

        if (offset + limit < total) {
          result.next = { page: page + 1, limit };
        }
        if (offset > 0) {
          result.previous = { page: page - 1, limit };
        }
                
        return res.render("productList.ejs", {
    products: result.results,
    pagination: result,
    searchValue,
    filterCategory, 
    limitValue: result.current.limit
  });
} else {

    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 10;
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

   // console.log(result)

// {
//   current: { page: 1, limit: 10 },
//   totalPages: 4,
//   results: [
//     {
//       id: 1,
//       product_name: 'Shampoo',
//       category_id: 2,
//       mrp: '978.00',
//       sp: '789.00',
//       cp: '465.00',
//       classification: 'Cosmetic',
//       size: '20Lts',
//       category: 'Cosmetics',
//       description: 'Beauty and personal care products'
//     },
//    }
//   ],
//   next: { page: 2, limit: 10 }
//   previous: {page: 1, limit: 10 }
// }
    res.render("productList.ejs", {
      products: result.results,   // JSON DATA
      pagination: result ,   
      searchValue,
      filterCategory 
    });

        }
  } catch (error) {
    res.status(500).send("Error fetching products: " + error.message);
  }
});



//To show category dropdown values, we render from db and show here.
// Add Product page
// get has no req.body
app.get("/products/add", async (req, res) => {
  try {
    const categoriesRes = await db.query("SELECT * FROM category ORDER BY category_id ASC");

    res.render("product.ejs", {
      categories: categoriesRes.rows,

      searchValue: req.query.search || "",
      filterCategory: req.query.filter || "",
      pagination: {
        current: {
          page: parseInt(req.query.page) || 1,
          limit: parseInt(req.query.limit) || 10
        }
      }
    });

  } catch (error) {
    res.status(500).send("▲ Server error: " + error.message);
  }
});

// Insert product (API JSON)
app.post("/products/add", id_Validation, field_Validation, async (req, res) => {
  try {
    const { name, category_id, mrp, sp, cp, classification, size } = req.body;

    const searchValue = req.body.searchValue;
    const filterCategory = req.body.filterCategory;
    const page = parseInt(req.body.page) || 1;
    const limit = req.body.limit !== undefined ? parseInt(req.body.limit) : 10;


    // Duplicate checks

    const nameCheck = await db.query("SELECT * FROM products WHERE product_name=$1", [name]);
    if (nameCheck.rows.length > 0) return res.status(400).send("Product name already exists.");

    // Insert
    const result = await db.query(
      `INSERT INTO products (product_name, category_id, mrp, sp, cp, classification, size) 
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name, category_id, mrp, sp, cp, classification, size]
    );
      
    const countRes = await db.query("SELECT COUNT(*) FROM products");
    const totalProducts = parseInt(countRes.rows[0].count);
    const lastPage = Math.ceil(totalProducts / limit);


    // Browsers cannot auto-redirect to another URL with POST data.
    // AND send these values using POST, not GET
    // Return the user back to the products list page

    res.send(`
      <form id="redirectForm" action="/products" method="POST">
        <input type="hidden" name="searchValue" value="${searchValue}">
        <input type="hidden" name="filterCategory" value="${filterCategory}">
        <input type="hidden" name="page" value="${lastPage}">
        <input type="hidden" name="limit" value="${limit}">
      </form>
      <script>
      alert("✔ Product added successfully!");
      document.getElementById("redirectForm").submit();
      </script>
    `);
    console.log({ message: "✅ Product added successfully", product: result.rows[0] })

  } catch (error) {
    res.status(500).send("▲ Server error: " + error.message);
  }
});

// Get UPdate data
// GET the page with feilds auto filled
// app.get("/products/edit", async (req, res) => {
//   const id = parseInt(req.params.id);
//   try {
//     //show rows that as id 
//     const productRes = await db.query("SELECT * FROM products WHERE id=$1", [id]);
//     const categoriesRes = await db.query("SELECT * FROM category ORDER BY category_id ASC");

//     res.render("update.ejs", { 
//       product: productRes.rows[0],
//       categories: categoriesRes.rows,
//       searchValue: req.query.search || "",
//       filterCategory: req.query.filter || "",
//       pagination: {
//         current: {
//           page: parseInt(req.query.page) || 1,
//           limit: parseInt(req.query.limit) || 10
//         }
//       }
//     });
//   } catch (error) {
//     res.status(500).send("▲ Server error: " + error.message);
//   }
// });



// Update product (API JSON)
// app.post("/products/edit", id_Validation, field_Validation, async (req, res) => {
//   try {

//     const id = parseInt(req.body.id);
//     const { name, category_id, mrp, sp, cp, classification, size } = req.body;

//     const searchValue = req.body.searchValue;
//     const filterCategory = req.body.filterCategory;
//     const page = parseInt(req.body.page) || 1;
//     const limit = parseInt(req.body.limit) || 10;

//     const idCheck = await db.query("SELECT * FROM products WHERE id=$1", [id]);
//     if (idCheck.rows.length === 0) return res.status(400).send("ID not exists");

//     const result = await db.query(
//       `UPDATE products SET product_name=$2, category_id=$3, mrp=$4, sp=$5, cp=$6, classification=$7, size=$8 
//        WHERE id=$1 RETURNING *`,
//       [id, name, category_id, mrp, sp, cp, classification, size]
//     );
   
//     // Auto-submit POST form to restore page + filters
//     res.send(`
//       <form id="redirectForm" action="/products" method="POST">
//         <input type="hidden" name="searchValue" value="${searchValue}">
//         <input type="hidden" name="filterCategory" value="${filterCategory}">
//         <input type="hidden" name="page" value="${page}">
//         <input type="hidden" name="limit" value="${limit}">
//       </form>
//       <script>
//       alert("✔ Product Updated successfully!");
//         document.getElementById('redirectForm').submit();
//       </script>
//     `);

//     console.log({ message: "✅ Product updated successfully", product: result.rows[0] });

//   } catch (error) {
//     res.status(500).send("▲ Server error: " + error.message);
//   }
// });
// Show edit page (POST only)


app.post("/products/edit/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const productRes = await db.query("SELECT * FROM products WHERE id=$1", [id]);
    const categoriesRes = await db.query("SELECT * FROM category ORDER BY category_id ASC");

    // because GET request has NO body
    const searchValue = req.body.searchValue || "";
    const filterCategory = req.body.filterCategory || "";
    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 10;

    res.render("update.ejs", {
      product: productRes.rows[0],
      categories: categoriesRes.rows,
      searchValue,
      filterCategory,
      pagination: {
        current: { page, limit }
      }
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send(error.message);
  }
});




app.post("/products/update", id_Validation, field_Validation, async (req, res) => {
  try {
    const id = parseInt(req.body.id);
    const { name, category_id, mrp, sp, cp, classification, size } = req.body;

    const result = await db.query(
      `UPDATE products SET product_name=$2, category_id=$3, mrp=$4, sp=$5, cp=$6, classification=$7, size=$8 
       WHERE id=$1 RETURNING *`,
      [id, name, category_id, mrp, sp, cp, classification, size]
    );

    res.send(`
      <form id="redirectForm" action="/products" method="POST">
        <input type="hidden" name="searchValue" value="${req.body.searchValue}">
        <input type="hidden" name="filterCategory" value="${req.body.filterCategory}">
        <input type="hidden" name="page" value="${req.body.page}">
        <input type="hidden" name="limit" value="${req.body.limit}">
      </form>
      <script>
        alert("✔ Product Updated successfully!");
        document.getElementById('redirectForm').submit();
      </script>
    `);

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
    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 10;
    const searchValue = req.body.searchValue || "";
    const filterCategory = req.body.filterCategory || "";
    const result = await db.query("DELETE FROM products WHERE id=$1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).send("Product not found");
    }

      res.send(`
      <form id="redirectForm" action="/products" method="POST">
        <input type="hidden" name="page" value="${page}">
        <input type="hidden" name="limit" value="${limit}">
        <input type="hidden" name="searchValue" value="${searchValue}">
        <input type="hidden" name="filterCategory" value="${filterCategory}">
      </form>
      <script>document.getElementById("redirectForm").submit()</script>
    `);
    console.log("Product deleted:", result.rows[0]);

  } catch (error) {
    res.status(500).send("Server error: " + error.message);
  }
});


app.listen(port, (req, res) => {
  console.log(`Server running on port: http://localhost:${port}`);
});
