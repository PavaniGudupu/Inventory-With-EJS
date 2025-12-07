// db.js
import pg from "pg";
import env from "dotenv";

env.config();

const db = new pg.Client({
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
db.connect();

const productPagination = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5; // show 5 products per page
  const offset = (page - 1) * limit;

  try {
    // Count total products
    const countResult = await db.query("SELECT COUNT(*) FROM products");
    const total = parseInt(countResult.rows[0].count);

    // Fetch paginated products with category join
    const dataResult = await db.query(
      `SELECT p.*, c.category 
       FROM products p
       LEFT JOIN category c ON p.category_id = c.category_id
       ORDER BY p.id ASC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    // Build pagination object
    const result = {
      current: { page, limit },
      totalPages: Math.ceil(total / limit),
      results: dataResult.rows
    };
    //console.log(result)

    if (offset + limit < total) { // 1+5=6 current page < total => next
      result.next = { page: page + 1, limit };
    }
    if (offset > 0) { // if offset 0, then add prev btn
      result.previous = { page: page - 1, limit };
    }

    res.paginatedResults = result;
    next();
  } catch (error) {
    console.error(error.message);
    res.status(500).send("▲ Server error: " + error.message);
  }
};


export default productPagination;