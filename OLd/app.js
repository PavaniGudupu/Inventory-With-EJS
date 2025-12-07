// frontend/app.js
import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000; // frontend runs separately
const API_URL = "http://localhost:4000"

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());


app.get("/", (req, res) => {
    res.render("home.ejs");
});
app.get("/createInventory", (req, res) => {
    res.redirect("/products/add");
});
app.get("/openInventory", async (req, res) => {
    res.redirect("/products");
});



// Show product list
app.get("/products", async (req, res) => {
  try {
    const response = await axios.get(API_URL + "/product/product-list");
    const products = response.data;
    res.render("productList", { products }); // returns array
  } catch (error) {
    res.send("Error fetching products: " + error.message);
  }
});

// Show add product form
app.get("/products/add", async (req, res) => {
  const categories = await axios.get(API_URL + "/categories");
  res.render("product", { categories: categories.data });
});


// Handle product creation
app.post("/products/add", async (req, res) => {
  try {
    console.log("Frontend form body:", req.body);

    const config = {
      id: req.body.id,
      name: req.body.name,
      category_id: req.body.category_id,
      mrp: req.body.mrp,
      sp: req.body.sp,
      cp: req.body.cp,
      classification: req.body.classification,
      size: req.body.size
    };

    await axios.post(API_URL + "/product/add-product", config);
    res.redirect("/products");

  } catch (error) {
    const errMsg = error.response?.data || error.message;
    res.status(400).send("Error adding product: " + errMsg);
  }
});


app.get("/products/edit/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const response = await axios.get(`${API_URL}/products/product-id/${id}`);
    const categoriesRes = await axios.get(`${API_URL}/categories`);
    const product = response.data[0]; // ✅ correct
    const categories = categoriesRes.data;
    res.render("update.ejs", { product, categories });
  } catch (error) {
    res.send("Error fetching product: " + (error.message));
  }
});


app.post("/products/edit/:id", async (req, res) => {
  const config = {
    id: req.body.id,
    name: req.body.name,
    category_id: req.body.category_id,
    mrp: req.body.mrp,
    sp: req.body.sp,
    cp: req.body.cp,
    classification: req.body.classification,
    size: req.body.size
  };

  try {
    const response = await axios.put(API_URL + "/product/update-product", config);
    console.log(response.data);
    res.redirect("/products");

  } catch (error) {
    const errMsg = error.response?.data || error.message;
    res.status(400).send("Error while updating the product: " + errMsg);
  }
});




app.post("/products/delete/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await axios.delete(API_URL + "/product/delete-product", {
      data: { id } // Axios sends body with DELETE like this
    });
    res.redirect("/products");
  } catch (error) {
    res.send("Error deleting product: " + (error.message));
  }
});





app.listen(port, () => {
  console.log(`Frontend running at http://localhost:${port}`);
});
