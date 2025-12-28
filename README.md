# 📦 Inventory Management System (EJS + PostgreSQL)

A full-stack **Inventory Management Web Application** built using **Node.js, Express, EJS, and PostgreSQL**.  
This project focuses on **real-world inventory handling** with **search, filter, pagination, CRUD operations**, and a **clean UI** using EJS templates.

---


https://github.com/user-attachments/assets/d7c442b2-0c97-44bb-b4ad-0490584e24b4


## 🚀 Features

### 🧾 Product Management
- Add new products
- View product list
- Edit existing products
- Delete products

### 🔍 Search & Filter
- Search products dynamically
- Filter by:
  - Product Name
  - Category
  - MRP
  - SP
  - CP
  - Classification
  - Size
- Auto-search with debounce (typing-based search)

### 📄 Pagination
- Dynamic pagination
- First / Previous / Next / Last buttons
- Adjustable **limit per page**
- Pagination state preserved during:
  - Search
  - Filter
  - Edit
  - Delete

### 🔐 Validations
- Mandatory field validation
- ID validation (must be integer > 0)
- Price rules:
  - MRP > SP
  - MRP > CP
  - SP ≥ CP
- Duplicate product name prevention

### 🔗 Relational Database
- Products table
- Category table
- Foreign key relationship
- Data fetched using `LEFT JOIN`

---

## 🧠 Tech Stack

| Layer        | Technology |
|--------------|------------|
| Backend      | Node.js, Express.js |
| Frontend     | EJS, HTML, CSS, Bootstrap |
| Database     | PostgreSQL |
| ORM / Driver | pg |
| Validation   | Custom Middleware |
| Environment  | dotenv |

---

## 📂 Project Structure

    Inventory_with_EJS
    │
    ├── middleware
    │ └── validation.js
    │
    ├── views
    │ ├── partials
    │ │ ├── header.ejs
    │ │ └── footer.ejs
    │ ├── home.ejs
    │ ├── product.ejs
    │ ├── productList.ejs
    │ ├── update.ejs
    │ └── openInventory.ejs
    │
    ├── public
    │ └── styles.css
    │
    ├── index.js
    ├── .env
    └── README.md


---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/PavaniGudupu/InventoryAPI.git
cd Inventory_with_EJS
```
2️⃣ Install Dependencies
```bash
npm install
```
3️⃣ Setup PostgreSQL Database

    CREATE TABLE category (
        category_id SERIAL PRIMARY KEY,
        category VARCHAR(50) UNIQUE NOT NULL
    );
    
    CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        product_name VARCHAR(100) UNIQUE NOT NULL,
        category_id INT,
        mrp NUMERIC(10,2) NOT NULL,
        sp NUMERIC(10,2) NOT NULL,
        cp NUMERIC(10,2) NOT NULL,
        classification VARCHAR(100),
        size VARCHAR(20),
        CONSTRAINT fk_category
            FOREIGN KEY (category_id)
            REFERENCES category(category_id)
            ON DELETE SET NULL
    );
4️⃣ Environment Variables (.env)
5️⃣ Run the Application
node index.js
Server will start at:

http://localhost:4000


🌐 Routes Overview

| Route                  | Method | Description                           |
| ---------------------- | ------ | ------------------------------------- |
| `/`                    | GET    | Home page                             |
| `/products`            | POST   | Product list with pagination & search |
| `/products/add`        | GET    | Add product page                      |
| `/products/add`        | POST   | Insert product                        |
| `/products/edit/:id`   | POST   | Edit product page                     |
| `/products/update`     | POST   | Update product                        |
| `/products/delete/:id` | POST   | Delete product                        |


🧪 Key Learning Outcomes

     . PostgreSQL relationships & joins 
     . Pagination logic with POST (no query params)
     . State preservation across CRUD
     . Middleware-based validation
     . EJS form-based navigation
     . Real-world inventory workflows

## 👩‍💻 Author

**G. Pavani**  
🎓 B.Tech – CSE (Data Science), 2025  
📍 Visakhapatnam, Andhra Pradesh  

📧 **Email:** pavani9419@gmail.com  
💼 **LinkedIn:** https://linkedin.com/in/pavani-gudupu-3b795528b  
🐙 **GitHub:** https://github.com/PavaniGudupu  


⭐ Support

If you like this project,
give it a ⭐ on GitHub — it motivates me to build more 🚀
