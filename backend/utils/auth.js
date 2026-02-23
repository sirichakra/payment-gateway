import { pool } from "../db.js";

export async function auth(req, res, next) {
  try {
    const key = req.header("X-Api-Key");
    const secret = req.header("X-Api-Secret");

    if (!key || !secret) {
      return res.status(401).json({
        error: {
          code: "AUTHENTICATION_ERROR",
          description: "Invalid API credentials"
        }
      });
    }

    const q = `
      SELECT * FROM merchants
      WHERE api_key=$1 AND api_secret=$2 AND is_active=true
    `;

    const { rows } = await pool.query(q, [key, secret]);

    if (!rows.length) {
      return res.status(401).json({
        error: {
          code: "AUTHENTICATION_ERROR",
          description: "Invalid API credentials"
        }
      });
    }

    req.merchant = rows[0];
    next();
  } catch (err) {
    return res.status(500).json({
      error: {
        code: "SERVER_ERROR",
        description: "Authentication service unavailable"
      }
    });
  }
}