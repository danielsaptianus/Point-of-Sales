# Point of Sales (POS) System

Sistem Point-of-Sales modern dengan arsitektur terpisah antara Backend (NestJS + PostgreSQL + Prisma) dan Frontend (Vue 3 + Vite + TypeScript + Pinia).

---

## 📁 Struktur Repositori

```text
Point-of-Sales/
├── backend/                  # RESTful API Backend (NestJS, Prisma, PostgreSQL)
│   ├── src/                  # Controller, Service, Module, DTO
│   ├── prisma/               # Schema database, migrasi & seeder
│   ├── package.json
│   └── ...
└── frontend/                 # Client Web Application (Vue 3, Pinia, Vite)
    ├── src/
    │   ├── components/       # Komponen kasir, produk, filter, modal
    │   ├── views/            # Halaman Kasir (POS) & Login
    │   ├── stores/           # Pinia store (Auth, Cart, Products)
    │   └── ...
    ├── package.json
    └── ...
```

---

## 🚀 Cara Menjalankan

### 1. Menjalankan Backend (NestJS)
```bash
cd backend
npm install
npm run prisma:generate
npm run start:dev
```
Backend akan berjalan di: `http://localhost:3000` (Dokumentasi Swagger di: `http://localhost:3000/api/docs`).

### 2. Menjalankan Frontend (Vue 3)
```bash
cd frontend
npm install
npm run dev
Frontend akan berjalan di: `http://localhost:5173`.

---

## 🧪 Pengujian End-to-End (E2E)

Proyek ini telah dikonfigurasi untuk pengujian E2E guna memastikan integrasi antar komponen berjalan dengan baik.

### Backend E2E Tests (NestJS / Jest)
Pengujian E2E pada backend akan melakukan test simulasi *request* ke *endpoint* API (seperti Auth, CRUD, dan Kalkulasi Transaksi Kasir) di dalam lingkungan yang terisolasi.

```bash
cd backend
npm run test:e2e
```
