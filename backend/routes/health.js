// backend/routes/health.js
import express from "express";
import { pool } from "../db.js";
const router = express.Router();

router.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } catch {
    res.json({
      status: "healthy",
      database: "disconnected",
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
