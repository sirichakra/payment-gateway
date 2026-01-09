# Payment Gateway – Global Placement Program

## Overview
This project implements a simplified payment gateway similar to Razorpay/Stripe.
It supports merchant authentication, order creation, UPI/Card payments, and a hosted checkout page.

## Tech Stack
- Backend: Node.js, Express
- Database: PostgreSQL
- Frontend: HTML + JavaScript (Checkout Page)
- Containerization: Docker & Docker Compose

## Features
- Merchant authentication using API Key & Secret
- Order creation and retrieval
- UPI and Card payment processing
- Luhn algorithm for card validation
- Payment state machine (processing → success / failed)
- Hosted checkout page with polling
- Test mode for deterministic evaluation

## Services & Ports
| Service   | Port |
|----------|------|
| API      | 8000 |
| Checkout | 3001 |
| Postgres | 5432 |

## How to Run
```bash
docker-compose up -d --build
