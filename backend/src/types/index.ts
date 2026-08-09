/**
 * Core Data Models and TypeScript Types for Mini ERP + CRM Portal
 */

export type UserRole = 'Admin' | 'Sales' | 'Warehouse' | 'Accounts';
export type UserStatus = 'Active' | 'Inactive';

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash?: string;
  role: UserRole;
  status: UserStatus;
  created_at: Date;
}

export type CustomerType = 'Retail' | 'Wholesale' | 'Distributor';
export type CustomerStatus = 'Lead' | 'Active' | 'Inactive';

export interface Customer {
  id: number;
  name: string;
  mobile: string;
  email: string;
  business_name: string;
  gst_number?: string | null;
  type: CustomerType;
  address: string;
  status: CustomerStatus;
  follow_up_date?: string | null;
  notes?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  unit_price: number;
  current_stock: number;
  min_stock_alert_qty: number;
  location: string;
  created_at: Date;
  updated_at: Date;
}

export type MovementType = 'IN' | 'OUT';

export interface StockLog {
  id: number;
  product_id: number;
  product_name?: string;
  sku?: string;
  qty_changed: number;
  movement_type: MovementType;
  reason: string;
  created_by: number;
  created_by_name?: string;
  created_at: Date;
}

export type ChallanStatus = 'Draft' | 'Confirmed' | 'Cancelled';

export interface ProductSnapshot {
  id: number;
  sku: string;
  name: string;
  category: string;
  unit_price: number;
}

export interface ChallanItem {
  id?: number;
  challan_id?: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product_snapshot: ProductSnapshot;
}

export interface SalesChallan {
  id: number;
  challan_number: string;
  customer_id: number;
  customer_name?: string;
  customer_business?: string;
  total_quantity: number;
  total_amount: number;
  status: ChallanStatus;
  created_by: number;
  created_by_name?: string;
  created_at: Date;
  updated_at: Date;
  items?: ChallanItem[];
}

export interface JWTPayload {
  userId: number;
  email: string;
  name: string;
  role: UserRole;
}
