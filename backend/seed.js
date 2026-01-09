import { pool } from "./db.js";

export async function seedMerchant() {
  // merchants table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS merchants (
      id UUID PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      api_key TEXT UNIQUE,
      api_secret TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // orders table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(64) PRIMARY KEY,
      merchant_id UUID REFERENCES merchants(id),
      amount INT NOT NULL CHECK (amount >= 100),
      currency VARCHAR(3) DEFAULT 'INR',
      receipt TEXT,
      notes JSONB,
      status VARCHAR(20) DEFAULT 'created',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // payments table
await pool.query(`
  CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) REFERENCES orders(id),
    merchant_id UUID REFERENCES merchants(id),
    amount INT NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    method VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'processing',
    vpa TEXT,
    card_network VARCHAR(20),
    card_last4 VARCHAR(4),
    error_code VARCHAR(50),
    error_description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )
`);

  // seed merchant
  await pool.query(`
    INSERT INTO merchants (id, name, email, api_key, api_secret)
    VALUES (
      '550e8400-e29b-41d4-a716-446655440000',
      'Test Merchant',
      'test@example.com',
      'key_test_abc123',
      'secret_test_xyz789'
    )
    ON CONFLICT (email) DO NOTHING
  `);
}
