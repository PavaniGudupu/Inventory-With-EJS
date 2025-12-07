
-- Create Table Query

CREATE TABLE Products (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(20) NOT NULL,
    mrp INT NOT NULL,
    sp INT NOT NULL,
    cp INT NOT NULL,
    classification VARCHAR(100),
    size VARCHAR(20)
);


ALTER TABLE Products
  ALTER COLUMN mrp TYPE NUMERIC(10,2),
  ALTER COLUMN sp TYPE NUMERIC(10,2),
  ALTER COLUMN cp TYPE NUMERIC(10,2);



INSERT INTO products (id, product_name, category_id, mrp, sp, cp, classification, size) 
VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",


