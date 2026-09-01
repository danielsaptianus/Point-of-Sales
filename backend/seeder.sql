
-- PENTING: Tekan Alt+X (Execute Script) di DBeaver agar SEMUA baris dijalankan dari atas sampai bawah.

-- 0. Hapus data secara manual berurutan (tanpa TRUNCATE agar tidak error)
DELETE FROM position_permissions;
DELETE FROM employees;
DELETE FROM users;
DELETE FROM permissions;
DELETE FROM positions;

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
(1, 1, NOW()),
(1, 2, NOW()),
(1, 3, NOW()),
(1, 4, NOW());

-- 4. Insert Admin User & Employee
INSERT INTO users (id, email, password, is_active, created_at, updated_at) 
VALUES (1, 'admin@kulidigital.com', '$2b$10$bDWLe26kIePt79FMfa2K0OwESW9ppYFkaWgINZ9PqbbpOLrN1nopC', true, NOW(), NOW());

INSERT INTO employees (employee_number, first_name, last_name, gender, position_id, user_id, is_active, created_at, updated_at)
VALUES ('EMP-ADMIN-001', 'Admin', 'Kuli Digital', 'Male', 1, 1, true, NOW(), NOW());

-- 5. Insert Kasir User & Employee
INSERT INTO users (id, email, password, is_active, created_at, updated_at) 
VALUES (2, 'kasir@kulidigital.com', '$2b$10$bDWLe26kIePt79FMfa2K0OwESW9ppYFkaWgINZ9PqbbpOLrN1nopC', true, NOW(), NOW());

INSERT INTO employees (employee_number, first_name, last_name, gender, position_id, user_id, is_active, created_at, updated_at)
VALUES ('EMP-KASIR-001', 'Kasir', 'Kuli Digital', 'Female', 2, 2, true, NOW(), NOW());
