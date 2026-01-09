import express from "express";
import { pool } from "../db.js";
import { auth } from "../utils/auth.js";
import { genId } from "../utils/ids.js";
import {
  isValidVPA,
  isValidCardNumber,
  detectNetwork,
  isValidExpiry
} from "../utils/validation.js";

const router = express.Router();

router.post("/api/v1/payments", auth, async (req, res) => {
  const { order_id, method, vpa, card } = req.body;

  // Order check
  const orderRes = await pool.query(
    "SELECT * FROM orders WHERE id=$1 AND merchant_id=$2",
    [order_id, req.merchant.id]
  );
  if (!orderRes.rowCount) {
    return res.status(404).json({
      error: { code: "NOT_FOUND_ERROR", description: "Order not found" }
    });
  }

  const order = orderRes.rows[0];

  // Method-specific validation
  let paymentData = {};
  if (method === "upi") {
    if (!isValidVPA(vpa)) {
      return res.status(400).json({
        error: { code: "INVALID_VPA", description: "VPA format invalid" }
      });
    }
    paymentData.vpa = vpa;
  }

  if (method === "card") {
    const { number, expiry_month, expiry_year } = card || {};
    if (!isValidCardNumber(number)) {
      return res.status(400).json({
        error: { code: "INVALID_CARD", description: "Card validation failed" }
      });
    }
    if (!isValidExpiry(expiry_month, expiry_year)) {
      return res.status(400).json({
        error: { code: "EXPIRED_CARD", description: "Card expiry date invalid" }
      });
    }
    paymentData.card_network = detectNetwork(number);
    paymentData.card_last4 = number.slice(-4);
  }

  // Generate payment ID
  let payId;
  while (true) {
    payId = genId("pay");
    const check = await pool.query("SELECT id FROM payments WHERE id=$1", [payId]);
    if (!check.rowCount) break;
  }

  // Insert payment (processing)
  await pool.query(
    `
    INSERT INTO payments
    (id, order_id, merchant_id, amount, currency, method, status, vpa, card_network, card_last4)
    VALUES ($1,$2,$3,$4,$5,$6,'processing',$7,$8,$9)
    `,
    [
      payId,
      order.id,
      req.merchant.id,
      order.amount,
      order.currency,
      method,
      paymentData.vpa || null,
      paymentData.card_network || null,
      paymentData.card_last4 || null
    ]
  );

  // Processing delay
  const delay = process.env.TEST_MODE === "true"
    ? Number(process.env.TEST_PROCESSING_DELAY || 1000)
    : Math.floor(Math.random() * 5000) + 5000;

  await new Promise(r => setTimeout(r, delay));

  // Success / failure
  let success;
  if (process.env.TEST_MODE === "true") {
    success = process.env.TEST_PAYMENT_SUCCESS !== "false";
  } else {
    success = method === "upi"
      ? Math.random() < 0.9
      : Math.random() < 0.95;
  }

  if (success) {
    await pool.query(
      "UPDATE payments SET status='success', updated_at=NOW() WHERE id=$1",
      [payId]
    );
  } else {
    await pool.query(
      `
      UPDATE payments
      SET status='failed',
          error_code='PAYMENT_FAILED',
          error_description='Payment processing failed',
          updated_at=NOW()
      WHERE id=$1
      `,
      [payId]
    );
  }

  const { rows } = await pool.query("SELECT * FROM payments WHERE id=$1", [payId]);
  res.status(201).json(rows[0]);
});

// PUBLIC payment endpoint for checkout
router.post("/api/v1/payments/public", async (req, res) => {
  const { order_id, method, vpa, card } = req.body;

  // Find order
  const orderRes = await pool.query(
    "SELECT * FROM orders WHERE id=$1",
    [order_id]
  );

  if (!orderRes.rowCount) {
    return res.status(404).json({
      error: { code: "NOT_FOUND_ERROR", description: "Order not found" }
    });
  }

  const order = orderRes.rows[0];

  // ---- SAME LOGIC AS AUTH PAYMENT ----
  let paymentData = {};
  if (method === "upi") {
    if (!isValidVPA(vpa)) {
      return res.status(400).json({
        error: { code: "INVALID_VPA", description: "VPA format invalid" }
      });
    }
    paymentData.vpa = vpa;
  }

  if (method === "card") {
    const { number, expiry_month, expiry_year } = card || {};
    if (!isValidCardNumber(number)) {
      return res.status(400).json({
        error: { code: "INVALID_CARD", description: "Card validation failed" }
      });
    }
    if (!isValidExpiry(expiry_month, expiry_year)) {
      return res.status(400).json({
        error: { code: "EXPIRED_CARD", description: "Card expiry date invalid" }
      });
    }
    paymentData.card_network = detectNetwork(number);
    paymentData.card_last4 = number.slice(-4);
  }

  // Generate payment ID
  let payId;
  while (true) {
    payId = genId("pay");
    const check = await pool.query(
      "SELECT id FROM payments WHERE id=$1",
      [payId]
    );
    if (!check.rowCount) break;
  }

  await pool.query(
    `
    INSERT INTO payments
    (id, order_id, merchant_id, amount, currency, method, status, vpa, card_network, card_last4)
    VALUES ($1,$2,$3,$4,$5,$6,'processing',$7,$8,$9)
    `,
    [
      payId,
      order.id,
      order.merchant_id,
      order.amount,
      order.currency,
      method,
      paymentData.vpa || null,
      paymentData.card_network || null,
      paymentData.card_last4 || null
    ]
  );

  // Simulate processing
  const delay = Number(process.env.TEST_PROCESSING_DELAY || 1000);
  await new Promise(r => setTimeout(r, delay));

  await pool.query(
    "UPDATE payments SET status='success', updated_at=NOW() WHERE id=$1",
    [payId]
  );

  const { rows } = await pool.query(
    "SELECT * FROM payments WHERE id=$1",
    [payId]
  );

  res.status(201).json(rows[0]);
});



router.get("/api/v1/payments/:id", auth, async (req, res) => {
  const { id } = req.params;

  const { rows } = await pool.query(
    "SELECT * FROM payments WHERE id=$1 AND merchant_id=$2",
    [id, req.merchant.id]
  );

  if (!rows.length) {
    return res.status(404).json({
      error: {
        code: "NOT_FOUND_ERROR",
        description: "Payment not found"
      }
    });
  }

  res.json(rows[0]);
});

router.get("/api/v1/payments/:id/public", async (req, res) => {
  const { id } = req.params;

  const { rows } = await pool.query(
    "SELECT id, status FROM payments WHERE id=$1",
    [id]
  );

  if (!rows.length) {
    return res.status(404).json({
      error: { code: "NOT_FOUND_ERROR", description: "Payment not found" }
    });
  }

  res.json(rows[0]);
});


export default router;
