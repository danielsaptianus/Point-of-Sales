export interface User {
  id: number;
  email: string;
  is_active: boolean;
  employee?: {
    id: number;
    employee_number: string;
    first_name: string;
    last_name: string;
    gender: string;
    position?: {
      id: number;
      name: string;
    };
  };
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
