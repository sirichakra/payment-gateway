import express from "express";
import { pool } from "../db.js";
import { auth } from "../utils/auth.js";
import { genId } from "../utils/ids.js";

const router = express.Router();

router.post("/api/v1/orders", auth, async (req, res) => {
  const { amount, currency = "INR", receipt, notes } = req.body;

  // Validation
  if (!Number.isInteger(amount) || amount < 100) {
    return res.status(400).json({
      error: {
        code: "BAD_REQUEST_ERROR",
        description: "amount must be at least 100"
      }
    });
  }

  // Generate unique order ID
  let orderId;
  while (true) {
    orderId = genId("order");
    const check = await pool.query(
      "SELECT id FROM orders WHERE id=$1",
      [orderId]
    );
    if (check.rowCount === 0) break;
  }

  const { rows } = await pool.query(
    `
    INSERT INTO orders
    (id, merchant_id, amount, currency, receipt, notes, status)
    VALUES ($1,$2,$3,$4,$5,$6,'created')
    RETURNING *
    `,
    [
      orderId,
      req.merchant.id,
      amount,
      currency,
      receipt || null,
      notes || {}
    ]
  );

  const order = rows[0];

  res.status(201).json({
    id: order.id,
    merchant_id: order.merchant_id,
    amount: order.amount,
    currency: order.currency,
    receipt: order.receipt,
    notes: order.notes,
    status: order.status,
    created_at: order.created_at
  });
});

// PUBLIC order fetch for checkout
router.get("/api/v1/orders/:id", async (req, res) => {
  const { id } = req.params;

  const { rows } = await pool.query(
    "SELECT id, amount, currency, status FROM orders WHERE id=$1",
    [id]
  );

  if (!rows.length) {
    return res.status(404).json({
      error: {
        code: "NOT_FOUND_ERROR",
        description: "Order not found"
      }
    });
  }

  res.json(rows[0]);
});

export default router;
