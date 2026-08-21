import axios from 'axios';
import type { Product, Category, Transaction, User } from '@/types';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock Initial Data for Immediate Interactive Demo & Fallback
export const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: 'Semua Kategori', icon: 'LayoutGrid' },
  { id: 2, name: 'Makanan', icon: 'Utensils' },
  { id: 3, name: 'Minuman Kopi', icon: 'Coffee' },
  { id: 4, name: 'Minuman Segar', icon: 'CupSoda' },
  { id: 5, name: 'Snack & Dessert', icon: 'Cake' },
  { id: 6, name: 'Paket Hemat', icon: 'Percent' },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Espresso Double Shot',
    sku: 'BEV-ESP-01',
    description: '100% Arabica beans, rich crema and bold flavor',
    price: 18000,
    is_active: true,
    category_id: 3,
    stock_quantity: 45,
  },
  {
    id: 2,
    name: 'Caramel Macchiato Ice',
    sku: 'BEV-CMC-02',
    description: 'Fresh milk, espresso, vanilla syrup & drizzled caramel',
    price: 28000,
    is_active: true,
    category_id: 3,
    stock_quantity: 32,
  },
  {
    id: 3,
    name: 'Matcha Latte Premium',
    sku: 'BEV-MTC-03',
    description: 'Authentic Uji Kyoto matcha with creamy steamed milk',
    price: 26000,
    is_active: true,
    category_id: 4,
    stock_quantity: 28,
  },
  {
    id: 4,
    name: 'Nasi Goreng Spesial Arto',
    sku: 'FOD-NGS-01',
    description: 'Nasi goreng bumbu rempah dengan telur mata sapi & sate ayam',
    price: 35000,
    is_active: true,
    category_id: 2,
    stock_quantity: 20,
  },
  {
    id: 5,
    name: 'Mie Goreng Seafood',
    sku: 'FOD-MGS-02',
    description: 'Mie telur dengan udang, cumi, bakso ikan dan sayuran segar',
    price: 32000,
    is_active: true,
    category_id: 2,
    stock_quantity: 15,
  },
  {
    id: 6,
    name: 'Croissant Butter Gold',
    sku: 'SNK-CRS-01',
    description: 'French style flaky butter croissant fresh from oven',
    price: 22000,
    is_active: true,
    category_id: 5,
    stock_quantity: 12,
  },
  {
    id: 7,
    name: 'French Fries Truffle Mayo',
    sku: 'SNK-FFT-02',
    description: 'Crispy straight cut fries with truffle oil & dip mayo',
    price: 24000,
    is_active: true,
    category_id: 5,
    stock_quantity: 50,
  },
  {
    id: 8,
    name: 'Iced Lychee Tea',
    sku: 'BEV-LCT-04',
    description: 'Black tea infused with sweet lychee syrup and whole fruit',
    price: 20000,
    is_active: true,
    category_id: 4,
    stock_quantity: 60,
  },
  {
    id: 9,
    name: 'Burger Beef Cheese Melt',
    sku: 'FOD-BBC-03',
    description: 'Juicy Australian beef patty, melted cheddar & special sauce',
    price: 42000,
    is_active: true,
    category_id: 2,
    stock_quantity: 18,
  },
  {
    id: 10,
    name: 'Paket Combo Hemat Kopi + Croissant',
    sku: 'PKT-CB1-01',
    description: 'Pilihan Americano/Latte + 1 Plain Butter Croissant',
    price: 36000,
    is_active: true,
    category_id: 6,
    stock_quantity: 25,
  }
];

export const MOCK_USER: User = {
  id: 1,
  email: 'kasir@arto-pos.id',
  is_active: true,
  employee: {
    id: 1,
    employee_number: 'EMP-001',
    first_name: 'Budi',
    last_name: 'Santoso',
    gender: 'MALE',
    is_active: true,
    position_id: 1,
    position: {
      id: 1,
      name: 'Cashier Staff',
      is_active: true,
    },
  },
};

// API Services
export const posService = {
  async getProducts(): Promise<Product[]> {
    try {
      const res = await apiClient.get('/products');
      if (res.data && res.data.data) return res.data.data;
      return MOCK_PRODUCTS;
    } catch {
      return MOCK_PRODUCTS;
    }
  },

  async getCategories(): Promise<Category[]> {
    try {
      const res = await apiClient.get('/categories');
      if (res.data && res.data.data) {
        return [{ id: 1, name: 'Semua Kategori' }, ...res.data.data];
      }
      return MOCK_CATEGORIES;
    } catch {
      return MOCK_CATEGORIES;
    }
  },

  async createTransaction(transaction: Transaction): Promise<{ success: boolean; data: Transaction }> {
    try {
      const payload = {
        subtotal: transaction.subtotal,
        tax: transaction.tax,
        discount: transaction.discount,
        total: transaction.total,
        items: transaction.items.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
          price: i.price,
        })),
        payment_method: transaction.payment?.payment_method || 'CASH',
      };
      const res = await apiClient.post('/sales/transactions', payload);
      return { success: true, data: res.data?.data || transaction };
    } catch {
      // Return local simulated transaction when backend is not reached
      return { success: true, data: transaction };
    }
  },
};
