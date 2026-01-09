import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.get("/api/v1/test/merchant", async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id, email, api_key FROM merchants WHERE email='test@example.com'"
  );

  if (!rows.length) {
    return res.status(404).json({
      error: {
        code: "NOT_FOUND_ERROR",
        description: "Test merchant not found"
      }
    });
  }

  res.json({
    id: rows[0].id,
    email: rows[0].email,
    api_key: rows[0].api_key,
    seeded: true
  });
});

export default router;
