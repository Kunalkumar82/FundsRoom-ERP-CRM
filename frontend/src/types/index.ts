/**
 * Frontend TypeScript Models & API Response Types
 */

export type UserRole = 'Admin' | 'Sales' | 'Warehouse' | 'Accounts';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
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
  created_at: string;
  updated_at: string;
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
  is_low_stock?: boolean | number;
  created_at: string;
}

export type MovementType = 'IN' | 'OUT';

export interface StockLog {
  id: number;
  product_id: number;
  product_name: string;
  sku: string;
  qty_changed: number;
  movement_type: MovementType;
  reason: string;
  created_by_name: string;
  created_at: string;
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
  customer_name: string;
  customer_business: string;
  customer_email?: string;
  customer_mobile?: string;
  customer_gst?: string;
  customer_address?: string;
  total_quantity: number;
  total_amount: number;
  status: ChallanStatus;
  created_by: number;
  created_by_name: string;
  created_at: string;
  items?: ChallanItem[];
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: Pagination;
}
