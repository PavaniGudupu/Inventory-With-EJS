import express from "express";
import bodyParser from "body-parser";


const app = express();
const port = 4000;


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());


//all product list

app.get("/products", (req, res) => {
    try {
        res.send(productItems);
    } catch (error) {
        console.log(error.message);
        res.send(error.message);
    }
});

//  Random Product
app.get("/products/random", (req, res) => {
    try {
        const randomIndex = Math.floor(Math.random() * productItems.length);
        const randomProduct = productItems[randomIndex];
        console.log(randomProduct);
        res.send(randomProduct);
    } catch (error) {
        console.log(error.message);
        res.send(error.message);
    }
});

//  Specific Product by Code
app.get("/products/:code", (req, res) => {
    try {
        const code = parseInt(req.params.code);

        const specificProduct = productItems.find(
            (product) => product.Code === code
        );

        if (!specificProduct) {
            return res.status(404).send("Product Not Found");
        }

        console.log(specificProduct);
        res.send(specificProduct);

    } catch (error) {
        console.log(error.message);
        res.send(error.message);
    }
});


// Filter the data - query parameter
app.get("/filter", (req, res) => {
    try{
    
    const name = req.query.name;    // Example: ?color=Blue
    const data = productItems.filter((item) => item.Name === name);

    if (data) {
        res.send(data);
    } else {
        res.send("DATA NOT FOUND. TRY AGAIN!");
    }

       } catch (error) {
        console.log(error.message);
        res.send(error.message);
    }
});



// Post Data
app.post("/addProduct", (req, res) => {
    try {
        const newProduct = {
            Code: productItems.length + 1,
            Name: req.body.name,
            MRP: req.body.mrp,
            SP: req.body.sp,
            CP: req.body.cp,
            TAX: req.body.tax,
            Classification: req.body.classification,
            SIZE: req.body.size,
            COLOR: req.body.color,
            BRAND: req.body.brand,
            MATERIAL: req.body.material
        };

        productItems.push(newProduct);

        res.send({
            message: "Product created successfully",
            newProduct
        });

    } catch (error) {
        console.log(error.message);
        res.send(error.message);
    }
});



// PUT Data
app.put("/editProduct/:id", (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const productIndex = productItems.findIndex(
            (product) => product.Code === id
        );

        if (productIndex === -1) {
            return res.send("Product not found");
        }

        const replacementProduct = {
            Code: id,
            Name: req.body.name,
            MRP: req.body.mrp,
            SP: req.body.sp,
            CP: req.body.cp,
            TAX: req.body.tax,
            Classification: req.body.classification,
            SIZE: req.body.size,
            COLOR: req.body.color,
            BRAND: req.body.brand,
            MATERIAL: req.body.material
        };

        productItems[productIndex] = replacementProduct;

        res.send({
            message: "Product updated successfully",
            updatedProduct: replacementProduct
        });

    } catch (error) {
        console.log(error.message);
        res.send(error.message);
    }
});


// patch DAta
app.patch("/patchProduct/:id", (req, res) => {
    try {
        const id = parseInt(req.params.id);

        const productIndex = productItems.findIndex(
            (product) => product.Code === id
        );

        if (productIndex === -1) {
            return res.send("Product not found");
        }

        const existingProduct = productItems[productIndex];

        const updatedProduct = {
            Code: existingProduct.Code,
            Name: req.body.name || existingProduct.Name,
            MRP: req.body.mrp || existingProduct.MRP,
            SP: req.body.sp || existingProduct.SP,
            CP: req.body.cp || existingProduct.CP,
            TAX: req.body.tax || existingProduct.TAX,
            Classification: req.body.classification || existingProduct.Classification,
            SIZE: req.body.size || existingProduct.SIZE,
            COLOR: req.body.color || existingProduct.COLOR,
            BRAND: req.body.brand || existingProduct.BRAND,
            MATERIAL: req.body.material || existingProduct.MATERIAL
        };

        productItems[productIndex] = updatedProduct;

        res.send({
            message: "Product patched successfully",
            updatedProduct: updatedProduct
        });

    } catch (error) {
        console.log(error.message);
        res.send(error.message);
    }
});


// delete DAta

app.delete("/deleteProduct/:id", (req, res) => {
    const id = parseInt(req.params.id);

    const productIndex = productItems.findIndex(
        (product) => product.Code === id
    );

    if (productIndex > -1) {
        productItems.splice(productIndex, 1);

        return res.send("Product deleted successfully.");
    } else {
        return res.status(404).send("PRODUCT NOT FOUND.");
    }
});


app.listen(port, (req, res) => {
    console.log(`Server running on port: http://localhost:${port}`);
});


// When you send data from a form (POST request), Express cannot read it directly.
// So we use body-parser to convert that data into a JavaScript object.

const productItems = [
  {
    "Code": 1,
    "Name": "Shirt",
    "MRP": 799,
    "SP": 599,
    "CP": 400,
    "TAX": 5,
    "Classification": "Clothes",
    "SIZE": "L",
    "COLOR": "Blue",
    "BRAND": "FashionHub",
    "MATERIAL": "Cotton"
  },
  {
    "Code": 2,
    "Name": "Laptop",
    "MRP": 55000,
    "SP": 48999,
    "CP": 42000,
    "TAX": 18,
    "Classification": "Electronics",
    "SIZE": "15 inch",
    "COLOR": "Silver",
    "BRAND": "Dell",
    "MATERIAL": "Metal"
  },
  {
    "Code": 3,
    "Name": "Mobile",
    "MRP": 20000,
    "SP": 17499,
    "CP": 15000,
    "TAX": 12,
    "Classification": "Electronics",
    "SIZE": "6.5 inch",
    "COLOR": "Black",
    "BRAND": "Samsung",
    "MATERIAL": "Glass/Metal"
  },
  {
    "Code": 4,
    "Name": "Notebook",
    "MRP": 60,
    "SP": 50,
    "CP": 30,
    "TAX": 5,
    "Classification": "Stationery",
    "SIZE": "A4",
    "COLOR": "White",
    "BRAND": "Classmate",
    "MATERIAL": "Paper"
  },
  {
    "Code": 5,
    "Name": "Bottle",
    "MRP": 299,
    "SP": 229,
    "CP": 150,
    "TAX": 5,
    "Classification": "Kitchen",
    "SIZE": "1L",
    "COLOR": "Green",
    "BRAND": "Milton",
    "MATERIAL": "Plastic"
  },
  {
    "Code": 6,
    "Name": "Sneakers",
    "MRP": 1999,
    "SP": 1599,
    "CP": 1200,
    "TAX": 12,
    "Classification": "Footwear",
    "SIZE": "9",
    "COLOR": "White",
    "BRAND": "Puma",
    "MATERIAL": "Mesh"
  },
  {
    "Code": 7,
    "Name": "Headphones",
    "MRP": 1499,
    "SP": 1199,
    "CP": 800,
    "TAX": 18,
    "Classification": "Electronics",
    "SIZE": "Standard",
    "COLOR": "Black",
    "BRAND": "Boat",
    "MATERIAL": "Plastic"
  },
  {
    "Code": 8,
    "Name": "Curtains",
    "MRP": 899,
    "SP": 699,
    "CP": 450,
    "TAX": 5,
    "Classification": "Home Decor",
    "SIZE": "7ft",
    "COLOR": "Brown",
    "BRAND": "HomeChoice",
    "MATERIAL": "Polyester"
  },
  {
    "Code": 9,
    "Name": "Watch",
    "MRP": 2500,
    "SP": 1999,
    "CP": 1500,
    "TAX": 18,
    "Classification": "Accessories",
    "SIZE": "Standard",
    "COLOR": "Black",
    "BRAND": "Fastrack",
    "MATERIAL": "Metal"
  },
  {
    "Code": 10,
    "Name": "Handbag",
    "MRP": 1800,
    "SP": 1499,
    "CP": 1000,
    "TAX": 12,
    "Classification": "Fashion",
    "SIZE": "Medium",
    "COLOR": "Red",
    "BRAND": "Lavie",
    "MATERIAL": "Leather"
  }
]



