# Full Stack Mini ERP + CRM Operations Portal

> **Case Study Submission**: FundsRoom Technical Selection Round 1  
> **Case Study Reference**: `FundsRoom-OC.30985.2027.62908`

A production-ready Full Stack Mini ERP & CRM Operations Web Portal built with Express, TypeScript, MySQL (ACID Transactions), and Vite + React.

---

## 🌟 Key Features

- 🔒 **Role-Based Access Control (RBAC)**: Support for `Admin`, `Sales Manager`, `Warehouse Inspector`, and `Accounts Specialist` roles with JWT authentication and bcrypt password hashing.
- 💼 **Customer CRM Module**: Lead management, client search & status filtering, and timestamped follow-up timeline history.
- 📦 **Inventory & Stock Management**: Product catalog, reorder threshold alerts, manual stock adjustments (IN/OUT), and an immutable stock movement audit log.
- ⚡ **MySQL ACID Sales Challans Engine**:
  - Row locking with `SELECT ... FOR UPDATE`.
  - Automated stock verification returning HTTP 400 when stock < requested quantity.
  - Atomic stock decrements and transaction rollbacks (`connection.rollback()`).
- 📸 **Static JSON Product Snapshots**: Preserves historical item pricing on delivery challans (`product_snapshot`) guaranteeing audit immutability.
- 🖨️ **Printable Delivery Challan Receipts**: Invoice views ready for client signatures and warehouse dispatch.

---

## 🛠️ Tech Stack & Architecture

- **Backend**: Node.js, Express.js, TypeScript, `mysql2/promise` (ACID transaction wrapper), JSONWebToken, Bcrypt.js.
- **Frontend**: React 18, TypeScript, Vite, Lucide Icons, Axios.
- **Database**: MySQL 8.x (Relational database schema with 6 tables).
- **Design System**: Enterprise Faded Black & Amber-Gold contrast theme with glassmorphism micro-animations.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- MySQL Server (v8.0+ running on port 3306)

### 1. Database Setup
Create MySQL database and table schemas:
```sql
CREATE DATABASE IF NOT EXISTS mini_erp_crm;
```
*(The backend automatically creates the database, table schemas, and seeds initial data upon first startup using `backend/src/db/schema.sql`).*

### 2. Backend Setup
```bash
cd backend
npm install
# Copy environment file
cp .env.example .env
# Edit .env with your MySQL credentials (DB_USER, DB_PASSWORD)
npm run dev
```
*Backend runs on `http://localhost:5000`*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`*

---

## 🔑 Quick Demo Credentials

| Role | Email | Password | Allowed Actions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@erp.com` | `Password123!` | Full System Access & User Management |
| **Sales** | `sales@erp.com` | `Password123!` | CRM Follow-ups, Create Sales Challans |
| **Warehouse** | `warehouse@erp.com` | `Password123!` | Inventory Adjustments & Stock Movement Logs |
| **Accounts** | `accounts@erp.com` | `Password123!` | Financial Challan & Invoice Audit |

*(You can also click **"Create Account"** on the login page to register new users directly into the MySQL database).*

---

## 📜 Database Schema Architecture

```
users (id, name, email, password_hash, role, status)
customers (id, name, email, phone, company, address, status, follow_up_notes)
products (id, name, sku, category, unit_price, current_stock, reorder_level)
stock_logs (id, product_id, qty_changed, movement_type, reason, created_by)
sales_challans (id, challan_number, customer_id, total_amount, status, created_by)
challan_items (id, challan_id, product_id, quantity, unit_price, product_snapshot)
```

---

## 👨‍💻 Author
**Kunal** — Candidate for FundsRoom Technical Case Study `FundsRoom-OC.30985.2027.62908`
