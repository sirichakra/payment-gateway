import "dotenv/config";
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import health from "./routes/health.js";
import orders from "./routes/orders.js";
import payments from "./routes/payments.js";
import testRoutes from "./routes/test.js";
import { seedMerchant } from "./seed.js";

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "X-Api-Key", "X-Api-Secret"]
}));

app.use(express.json());

app.use("/", health);
app.use(orders);
app.use(payments);
app.use(testRoutes);

// seedMerchant().catch(err => {
//   console.error("Seed failed:", err.message);
// });
await seedMerchant();

app.listen(8000, () => {
  console.log("API running on port 8000");
});
