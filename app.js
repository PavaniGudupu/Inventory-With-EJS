import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;
const API_URL = "http://localhost:4000";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


//HOME list of products

app.get("/", async (req, res) => {
  try {
    const response = await axios.get(API_URL + "/products");
    const request = response.data;
    res.json(request);
  } catch (error) {
    console.log(error.message);
  }
});


//random

app.get("/random", async (req, res) => {
  try {
    const response = await axios.get(API_URL + "/products/random");
    const request = response.data;
    res.json(request);
  } catch (error) {
    console.log(error.message);
  }
});

//specific id

app.get("/product/:id", async(req, res) => {
    try {
    const id = req.params.id;
    const response = await axios.get(API_URL + `/products/${id}`);
    const request = response.data;
    res.json(request);
  } catch (error) {
    console.log(error.message);
  }
});


//filter product

app.get("/product/filter", async (req, res) => {
  try {
    const name = req.query.name; // forward the color
    const response = await axios.get(`${API_URL}/filter?color=${name}`);
    res.json(response.data); // return the result
  } catch (error) {
    console.log(error.message);
  }
});



// add product

app.post("/product/add-product", async (req, res) => {
  try {
    const response = await axios.post(API_URL + "/addProduct", req.body);
    const request = response.data;
    res.json(request);
  } catch (error) {
    console.log(error.message);
  }
});


// Update product

app.put("/product/update-product/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const response = await axios.put(API_URL + `/editProduct/${id}`);
    const request = response.data;
    res.json(request);
  } catch (error) {
    console.log(error.message);
  }
});


// Patch product

app.patch("/product/patch-product/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const response = await axios.patch(API_URL + `/patchProduct/${id}`, req.body); // sent body. with id
    const request = response.data;
    res.json(request);
  } catch (error) {
    console.log(error.message);
  }
});

// Delete product

app.delete("/product/delete-product/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const response = await axios.delete(API_URL + `/deleteProduct/${id}`); 
    const request = response.data;
    res.json(request);
  } catch (error) {
    console.log(error.message);
  }
});



app.listen(port, (req, res) => {
  console.log(`Server running on port: http://localhost:${port}`);
});
