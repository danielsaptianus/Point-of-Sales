-- PENTING: Tekan Alt+X (Execute Script) di DBeaver agar SEMUA baris dijalankan.

-- 0. Reset semua tabel agar bersih tanpa ada yang bentrok
TRUNCATE TABLE stocks, inventory_batches, transaction_items, transactions, payments, transaction_item_batches, transaction_vouchers, products, categories, vouchers, position_permissions, employees, users, permissions, positions CASCADE;

-- 1. Insert Positions
INSERT INTO positions (id, name, description, is_active, created_at, updated_at) VALUES 
(1, 'Admin', 'Administrator with full system access', true, NOW(), NOW()),
(2, 'Staff Kasir', 'Cashier with access to POS and Sales', true, NOW(), NOW()),
(3, 'Staff Gudang', 'Warehouse staff with access to Inventory and Products', true, NOW(), NOW());

-- 2. Insert Permissions
INSERT INTO permissions (id, name, description, resource, action, created_at, updated_at) VALUES 
(1, 'view_dashboard', 'View dashboard statistics', 'Dashboard', 'read', NOW(), NOW()),
(2, 'manage_users', 'Manage system users', 'Users', 'manage', NOW(), NOW()),
(3, 'manage_products', 'Manage inventory', 'Products', 'manage', NOW(), NOW()),
(4, 'manage_sales', 'Process transactions', 'Sales', 'manage', NOW(), NOW());

-- 3. Link Permissions to Admin (position_id = 1)
INSERT INTO position_permissions (position_id, permission_id, created_at) VALUES 
(1, 1, NOW()), (1, 2, NOW()), (1, 3, NOW()), (1, 4, NOW());

-- 4. Insert Users & Employees
-- Password for all is 'password123' hashed with bcrypt
INSERT INTO users (id, email, password, is_active, created_at, updated_at) VALUES 
(1, 'admin@kulidigital.com', '$2b$10$bDWLe26kIePt79FMfa2K0OwESW9ppYFkaWgINZ9PqbbpOLrN1nopC', true, NOW(), NOW()),
(2, 'kasir@kulidigital.com', '$2b$10$bDWLe26kIePt79FMfa2K0OwESW9ppYFkaWgINZ9PqbbpOLrN1nopC', true, NOW(), NOW()),
(3, 'gudang@kulidigital.com', '$2b$10$bDWLe26kIePt79FMfa2K0OwESW9ppYFkaWgINZ9PqbbpOLrN1nopC', true, NOW(), NOW());

INSERT INTO employees (employee_number, first_name, last_name, gender, position_id, user_id, is_active, created_at, updated_at) VALUES 
('EMP-ADMIN-001', 'Admin', 'Kuli Digital', 'Male', 1, 1, true, NOW(), NOW()),
('EMP-KASIR-001', 'Kasir', 'Kuli Digital', 'Female', 2, 2, true, NOW(), NOW()),
('EMP-GUDANG-001', 'Gudang', 'Kuli Digital', 'Male', 3, 3, true, NOW(), NOW());

-- 5. Insert Categories
INSERT INTO categories (id, name, description, created_at, updated_at) VALUES 
(1, 'Minuman Ringan', 'Air mineral, soda, susu, teh, dll', NOW(), NOW()),
(2, 'Makanan Ringan', 'Cemilan, keripik, biskuit', NOW(), NOW()),
(3, 'Kebutuhan Dapur', 'Mie instan, beras, minyak goreng, dll', NOW(), NOW()),
(4, 'Perawatan Diri & Rumah', 'Sabun, pasta gigi, deterjen', NOW(), NOW());

-- 6. Insert Products
INSERT INTO products (id, name, sku, description, price, category_id, is_active, created_at, updated_at) VALUES 
(1, 'Indomie Goreng Spesial 85g', 'KBT-001', 'Mie instan goreng favorit keluarga', 3500, 3, true, NOW(), NOW()),
(2, 'Beras Ramos Setra 5kg', 'KBT-002', 'Beras putih pulen berkualitas', 68000, 3, true, NOW(), NOW()),
(3, 'Minyak Goreng Bimoli 2L', 'KBT-003', 'Minyak goreng kelapa sawit refill', 38500, 3, true, NOW(), NOW()),
(4, 'Aqua Air Mineral 600ml', 'MNM-001', 'Air minum dalam kemasan botol', 3500, 1, true, NOW(), NOW()),
(5, 'Coca Cola 1.5L', 'MNM-002', 'Minuman ringan berkarbonasi ukuran besar', 15500, 1, true, NOW(), NOW()),
(6, 'Pocari Sweat 500ml', 'MNM-003', 'Minuman isotonik pengganti ion tubuh', 7500, 1, true, NOW(), NOW()),
(7, 'Susu Ultra Coklat 250ml', 'MNM-004', 'Susu UHT rasa coklat', 6000, 1, true, NOW(), NOW()),
(8, 'Chitato Sapi Panggang 68g', 'SNK-001', 'Keripik kentang rasa sapi panggang', 11500, 2, true, NOW(), NOW()),
(9, 'Taro Net Seaweed 65g', 'SNK-002', 'Snack chiki rasa rumput laut', 9000, 2, true, NOW(), NOW()),
(10, 'Sari Roti Tawar Kupas', 'SNK-003', 'Roti tawar kupas lembut', 18000, 2, true, NOW(), NOW()),
(11, 'Pepsodent White 190g', 'PRW-001', 'Pasta gigi pencegah gigi berlubang', 12500, 4, true, NOW(), NOW()),
(12, 'Rinso Anti Noda 700g', 'PRW-002', 'Deterjen bubuk anti noda', 22000, 4, true, NOW(), NOW()),
(13, 'Sabun Lifebuoy Total 10 110g', 'PRW-003', 'Sabun mandi batang antibakteri', 4500, 4, true, NOW(), NOW());

-- 7. Insert Inventory Batches
INSERT INTO inventory_batches (product_id, received_date, initial_quantity, remaining_quantity, cost_per_unit) VALUES 
(1, NOW(), 150, 150, 2450),
(2, NOW(), 150, 150, 47600),
(3, NOW(), 150, 150, 26950),
(4, NOW(), 150, 150, 2450),
(5, NOW(), 150, 150, 10850),
(6, NOW(), 150, 150, 5250),
(7, NOW(), 150, 150, 4200),
(8, NOW(), 150, 150, 8050),
(9, NOW(), 150, 150, 6300),
(10, NOW(), 150, 150, 12600),
(11, NOW(), 150, 150, 8750),
(12, NOW(), 150, 150, 15400),
(13, NOW(), 150, 150, 3150);

-- 8. Insert Stock Logs
INSERT INTO stocks (product_id, type, quantity, notes, created_at, updated_at) VALUES 
(1, 'IN', 150, 'Initial stock from seeder', NOW(), NOW()),
(2, 'IN', 150, 'Initial stock from seeder', NOW(), NOW()),
(3, 'IN', 150, 'Initial stock from seeder', NOW(), NOW()),
(4, 'IN', 150, 'Initial stock from seeder', NOW(), NOW()),
(5, 'IN', 150, 'Initial stock from seeder', NOW(), NOW()),
(6, 'IN', 150, 'Initial stock from seeder', NOW(), NOW()),
(7, 'IN', 150, 'Initial stock from seeder', NOW(), NOW()),
(8, 'IN', 150, 'Initial stock from seeder', NOW(), NOW()),
(9, 'IN', 150, 'Initial stock from seeder', NOW(), NOW()),
(10, 'IN', 150, 'Initial stock from seeder', NOW(), NOW()),
(11, 'IN', 150, 'Initial stock from seeder', NOW(), NOW()),
(12, 'IN', 150, 'Initial stock from seeder', NOW(), NOW()),
(13, 'IN', 150, 'Initial stock from seeder', NOW(), NOW());

-- 9. Insert Vouchers
INSERT INTO vouchers (code, name, description, discount_type, discount_value, max_discount, min_transaction, start_date, end_date, usage_limit, used_count, is_active, created_at, updated_at) VALUES 
('PROMO2026', 'Promo Merdeka 2026', 'Diskon 20% maksimal Rp20.000 untuk pelanggan Arto POS.', 'PERCENTAGE', 20, 20000, 50000, NOW(), NOW() + INTERVAL '1 year', 100, 0, true, NOW(), NOW()),
('MAKANHEMAT', 'Voucher Makan Hemat', 'Potongan harga flat Rp 15.000 untuk pembelian minimal Rp 100.000.', 'FIXED', 15000, 15000, 100000, NOW(), NOW() + INTERVAL '1 month', 50, 0, true, NOW(), NOW()),
('EXPIRED123', 'Promo Jadul', 'Voucher yang sudah kadaluarsa (untuk testing).', 'PERCENTAGE', 10, 5000, 0, '2023-01-01 00:00:00', '2023-12-31 23:59:59', null, 0, true, NOW(), NOW());
