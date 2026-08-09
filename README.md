# Full Stack Mini ERP + CRM Operations Portal

> **Case Study Submission**: FundsRoom Technical Selection Round 1  
> **Case Study Reference**: `FundsRoom-OC.30985.2027.62908`

---

## 🌐 Live Production Deployments

| Component | Provider | Live Link / Host | Status |
| :--- | :--- | :--- | :--- |
| **Frontend Web App** | **Vercel** | [Live Vercel Frontend Application](https://vercel.com/kkunalstudent7549-9287s-projects/funds-room-erp-crm/9xkvBbiPhE1ZKrp1JNQnVfhut4bj) | 🟢 Live |
| **Backend REST API** | **Render.com** | `https://mini-erp-crm-backend-kgnl.onrender.com` | 🟢 Live |
| **Cloud Database** | **Aiven MySQL** | `mini-erp-mysql-kkunalstudent7549-d76c.c.aivencloud.com:24756` (DB: `defaultdb`) | 🟢 Live |

---

## 🔑 Quick Demo Login Credentials

| Role | Email | Password | Allowed Privileges |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@erp.com` | `Password123!` | Full System Access & User Registration |
| **Sales** | `sales@erp.com` | `Password123!` | CRM Lead Management, Create Sales Challans |
| **Warehouse** | `warehouse@erp.com` | `Password123!` | Inventory Adjustments & Stock Logs Audit |
| **Accounts** | `accounts@erp.com` | `Password123!` | Financial Challan & Delivery Verification |

*(You can also click **"Create Account"** on the login page to register new users directly into the live Aiven MySQL database).*

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
- **Database**: Aiven Cloud MySQL 8.x (Relational database schema with 6 tables & SSL TLS encryption).
- **Design System**: Enterprise Faded Black & Amber-Gold contrast theme with glassmorphism micro-animations.

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

## 👨‍💻 Candidate Details
- **Name**: Kunal
- **Assignment**: FundsRoom Technical Case Study `FundsRoom-OC.30985.2027.62908`
- **GitHub Repository**: [Kunalkumar82/FundsRoom-ERP-CRM](https://github.com/Kunalkumar82/FundsRoom-ERP-CRM)
