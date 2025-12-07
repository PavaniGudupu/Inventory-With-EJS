import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";
import { field_Validation, id_Validation } from "../middleware/validation.js";
import axios from "axios";

const app = express();
const port = 4000;

env.config();

//DB connection
const db = new pg.Client({
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());


//all product list
// all product list
app.get("/product/product-list", async (req, res) => {
  try {
    const data = await db.query(`
      SELECT p.*, c.category 
      FROM products p
      LEFT JOIN category c 
      ON p.category_id = c.category_id
    `);

    res.json(data.rows);

  } catch (error) {
    console.log(error.message);
    res.send(error.message);
  }
});

app.get("/categories", async(req, res) => {
  try{
    const result = await db.query("SELECT * FROM public.category ORDER BY category_id ASC ");
    res.json(result.rows);
  } catch(err) {
    res.status(500).send("Error fetching categories");
  }
});

//  Specific Product by Code
app.get("/products/product-id/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = await db.query("SELECT * FROM products WHERE id = $1", [id]);
    const result = data.rows;

    if (result.length === 0) {
      // if no product exists with this ID
      return res.status(404).send("▲ Product ID not found.");
    }

    res.json(result);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("▲ Server error: " + error.message);
  }
});


// Post Data
// Insert product
app.post("/product/add-product", id_Validation, field_Validation, async (req, res) => {
  try {
    const { id, name, category_id, mrp, sp, cp, classification, size } = req.body;

    // Duplicate Product Code
    if (id !== undefined && id !== "") {
      const codeCheck = await db.query("SELECT * FROM products WHERE id=$1", [id]);
      if (codeCheck.rows.length > 0) {
        return res.status(400).send("Code already exists. Enter a unique code.");
      }
    }
    // Duplicate Product Name
    const nameCheck = await db.query("SELECT * FROM products WHERE product_name=$1", [name]);
    if (nameCheck.rows.length > 0) {
      return res.status(400).send("Product name already exists.");
    }

    // Insert Product
    const result = await db.query(
      `INSERT INTO products (id, product_name, category_id, mrp, sp, cp, classification, size) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [id, name, category_id, mrp, sp, cp, classification, size]
    );
    console.log("Saved:", result.rows[0]);
    res.status(201).json({
      message: "✅ Product added successfully",
      product: result.rows[0],
    });
} catch (error) {
  console.error("Insert error:", error);
  res.status(500).send("▲ Server error: " + error.message);
}

});




// // PUT Data
// PRICES ARE MANDATORY. CANT CHANGE ID NUMBER.

app.put("/product/update-product", id_Validation, field_Validation, async (req, res) => {
  try {
    const { id, name, category_id, mrp, sp, cp, classification, size } = req.body;

    // ID not exists
    if (id !== undefined && id != "") {
      const idCheck = await db.query("SELECT * FROM products WHERE id=$1", [id]);
      if (idCheck.rows.length === 0) {
        return res.status(400).send("ID not exists");
      }
    }

    const result = await db.query(
      `UPDATE products SET product_name = $2, category_id = $3, mrp = $4, sp = $5, cp = $6, classification = $7, size = $8 WHERE id = $1 RETURNING *`,
      [id, name, category_id, mrp, sp, cp, classification, size]
    )
    console.log(result.rows);
    res.status(200).send({
      message: "✅ Product updated successfully",
      product: result.rows[0],
    });
  } catch (error) {
    console.log(error.message);
    res.send(error.message);
  }
});

// delete DAta

app.delete("/product/delete-product", id_Validation, async (req, res) => {
  try {
    const id = parseInt(req.body.id);
    // Delete product
    const result = await db.query(
      "DELETE FROM products WHERE id = $1 RETURNING *",[id]
    );
    res.status(200).send({
        message: "✅ Product deleted successfully",
        product: result.rows[0],
      });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("▲ Server error: " + error.message);
  }
});

app.listen(port, (req, res) => {
  console.log(`Server running on port: http://localhost:${port}`);
});
