import axios from 'axios';
import {
  ApiResponse,
  User,
  Customer,
  Product,
  StockLog,
  SalesChallan,
  ChallanItem
} from '../types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('erp_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('erp_token');
      localStorage.removeItem('erp_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// AUTH API
export const authApi = {
  login: async (email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (name: string, email: string, password: string, role: string): Promise<ApiResponse<{ token: string; user: User }>> => {
    const res = await api.post('/auth/register', { name, email, password, role });
    return res.data;
  },
  getMe: async (): Promise<ApiResponse<User>> => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  listUsers: async (): Promise<ApiResponse<User[]>> => {
    const res = await api.get('/auth/users');
    return res.data;
  }
};

// CUSTOMERS API
export const customerApi = {
  getCustomers: async (params?: { search?: string; type?: string; status?: string; page?: number; limit?: number }): Promise<ApiResponse<Customer[]>> => {
    const res = await api.get('/customers', { params });
    return res.data;
  },
  getCustomerById: async (id: number): Promise<ApiResponse<Customer>> => {
    const res = await api.get(`/customers/${id}`);
    return res.data;
  },
  createCustomer: async (data: Partial<Customer>): Promise<ApiResponse<Customer>> => {
    const res = await api.post('/customers', data);
    return res.data;
  },
  updateCustomer: async (id: number, data: Partial<Customer>): Promise<ApiResponse<Customer>> => {
    const res = await api.put(`/customers/${id}`, data);
    return res.data;
  },
  appendNote: async (id: number, new_note: string, follow_up_date?: string): Promise<ApiResponse<Customer>> => {
    const res = await api.post(`/customers/${id}/notes`, { new_note, follow_up_date });
    return res.data;
  }
};

// PRODUCTS & INVENTORY API
export const productApi = {
  getProducts: async (params?: { search?: string; category?: string; low_stock?: boolean; page?: number; limit?: number }): Promise<ApiResponse<Product[]>> => {
    const res = await api.get('/products', { params });
    return res.data;
  },
  getProductById: async (id: number): Promise<ApiResponse<Product>> => {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },
  createProduct: async (data: Partial<Product>): Promise<ApiResponse<Product>> => {
    const res = await api.post('/products', data);
    return res.data;
  },
  updateProduct: async (id: number, data: Partial<Product>): Promise<ApiResponse<Product>> => {
    const res = await api.put(`/products/${id}`, data);
    return res.data;
  },
  adjustStock: async (id: number, qty_changed: number, movement_type: 'IN' | 'OUT', reason: string): Promise<ApiResponse<Product>> => {
    const res = await api.post(`/products/${id}/adjust-stock`, { qty_changed, movement_type, reason });
    return res.data;
  },
  getStockLogs: async (params?: { product_id?: number; movement_type?: string; page?: number; limit?: number }): Promise<ApiResponse<StockLog[]>> => {
    const res = await api.get('/products/logs', { params });
    return res.data;
  }
};

// SALES CHALLAN API
export const challanApi = {
  getChallans: async (params?: { search?: string; status?: string; customer_id?: number; page?: number; limit?: number }): Promise<ApiResponse<SalesChallan[]>> => {
    const res = await api.get('/challans', { params });
    return res.data;
  },
  getChallanById: async (id: number): Promise<ApiResponse<SalesChallan>> => {
    const res = await api.get(`/challans/${id}`);
    return res.data;
  },
  createChallan: async (data: { customer_id: number; items: Array<{ product_id: number; quantity: number; unit_price?: number }>; status: 'Draft' | 'Confirmed' }): Promise<ApiResponse<any>> => {
    const res = await api.post('/challans', data);
    return res.data;
  },
  updateStatus: async (id: number, status: 'Draft' | 'Confirmed' | 'Cancelled'): Promise<ApiResponse<any>> => {
    const res = await api.put(`/challans/${id}/status`, { status });
    return res.data;
  }
};

// DASHBOARD API
export const dashboardApi = {
  getStats: async (): Promise<ApiResponse<any>> => {
    const res = await api.get('/dashboard/stats');
    return res.data;
  }
};

export default api;
