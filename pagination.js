import express from "express";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
    user: "postgres",
    database: "Products",
    host: "localhost",
    password: "123456",
    port: 5432
});
db.connect();

const pagination = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const countResult = await db.query("SELECT COUNT(*) FROM pagination");
    const total = parseInt(countResult.rows[0].count);

    const dataResult = await db.query(
      "SELECT * FROM pagination ORDER BY id LIMIT $1 OFFSET $2",
      [limit, offset]
    );

    const result = {};

    if (offset + limit < total) {
      result.next = { page: page + 1, limit: limit };
    }
    if (offset > 0) {
      result.previous = { page: page - 1, limit: limit };
    }

    result.results = dataResult.rows;
    res.paginatedResults = result;
    next();
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server error" });
  }
};

app.get("/users", pagination, (req, res) => {
  res.json(res.paginatedResults);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
