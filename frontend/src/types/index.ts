export interface Position {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
}

export interface Employee {
  id: number;
  employee_number: string;
  first_name: string;
  last_name?: string;
  gender: 'L' | 'P' | string;
  birth_date?: string;
  marital_status?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | string;
  email?: string;
  phone?: string;
  address?: string;
  hire_date?: string;
  termination_date?: string;
  employment_type?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN' | string;
  salary?: number;
  bank_name?: string;
  bank_account_number?: string;
  bank_account_name?: string;
  is_active: boolean;
  position_id: number;
  position?: Position;
  user_id?: number;
}

export interface User {
  id: number;
  email: string;
  is_active: boolean;
  employee?: Employee;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  description?: string;
  price: number;
  is_active: boolean;
  category_id: number;
  category?: Category;
  stock_quantity?: number;
  image?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export interface Transaction {
  id?: number;
  invoice_number: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'FAILED';
  user_id: number;
  cashier_name: string;
  created_at: string;
  items: {
    id?: number;
    product_id: number;
    product_name: string;
    price: number;
    quantity: number;
    subtotal: number;
  }[];
  payment?: {
    payment_method: 'CASH' | 'QRIS' | 'TRANSFER';
    amount_paid: number;
    change: number;
    reference_id?: string;
  };
}

export interface StockTransaction {
  id: number;
  product_id: number;
  product_name?: string; // Helpful for UI
  quantity: number;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  notes?: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  created_at: string;
}
