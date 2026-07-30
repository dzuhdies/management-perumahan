# Administrasi Perumahan RT

Aplikasi administrasi perumahan dengan backend Laravel, frontend React, dan
database MySQL.

## Struktur proyek

```text
kelola perumahan/
├── backend/   REST API Laravel
└── frontend/  React + Vite
```

## Kebutuhan sistem

Pastikan perangkat sudah memiliki:

- PHP 8.3 atau lebih baru beserta ekstensi `pdo_mysql`, `mbstring`,
  `openssl`, `fileinfo`, dan `gd`;
- Composer 2;
- MySQL 8 atau MariaDB;
- Node.js 20.19+ atau Node.js 22;
- npm 10+.

Periksa versi yang terpasang:

```bash
php -v
composer --version
mysql --version
node -v
npm -v
```

## 1. Mengambil source code

Jika proyek berasal dari Git:

```bash
git clone https://github.com/dzuhdies/management-perumahan.git
cd "management perumahan"
```

Jika source code sudah tersedia, buka terminal di folder utama proyek.

## 2. Membuat database MySQL

Masuk ke MySQL:

```bash
mysql -u root -p
```

Buat database:

```sql
CREATE DATABASE rt_management
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

Nama database boleh diubah, tetapi harus sama dengan nilai `DB_DATABASE`
pada konfigurasi backend.

## 3. Instalasi backend Laravel

Masuk ke folder backend:

```bash
cd backend
```

Instal dependency:

```bash
composer install
```

Buat file konfigurasi:

```bash
cp .env.example .env
php artisan key:generate
```

Sesuaikan bagian database di `backend/.env`:

```dotenv
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=rt_management
DB_USERNAME=root
DB_PASSWORD=
```

Jika MySQL memiliki password, isi `DB_PASSWORD` dengan password tersebut.

Bersihkan cache konfigurasi:

```bash
php artisan optimize:clear
```

Jalankan migrasi beserta data dummy:

```bash
php artisan migrate --seed
```

Seeder menghasilkan:

- 20 rumah;
- data penghuni aktif dan riwayat penghuni;
- jenis iuran Satpam dan Kebersihan;
- tagihan, pembayaran, dan pengeluaran untuk tahun berjalan serta dua tahun
  sebelumnya.

Hubungkan penyimpanan publik agar foto KTP dapat dilihat:

```bash
php artisan storage:link
```

Jalankan backend:

```bash
php artisan serve
```

Backend akan tersedia di:

```text
http://127.0.0.1:8000
```

Dokumentasi API:

```text
http://127.0.0.1:8000/docs/api
```

Biarkan terminal backend tetap berjalan.

## 4. Instalasi frontend React

Buka terminal baru, lalu masuk ke folder frontend:

```bash
cd frontend
```

Instal dependency sesuai lockfile:

```bash
npm ci
```

Buat file konfigurasi frontend:

```bash
cp .env.example .env
```

Pastikan `frontend/.env` berisi:

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Jalankan frontend:

```bash
npm run dev
```

Buka alamat yang ditampilkan Vite, biasanya:

```text
http://127.0.0.1:5173
```

## 5. Menjalankan aplikasi setiap hari

Terminal pertama:

```bash
cd backend
php artisan serve
```

Terminal kedua:

```bash
cd frontend
npm run dev
```

Kemudian buka `http://127.0.0.1:5173`.

## 6. Menjalankan pemeriksaan


Frontend:

```bash
cd frontend
npm run lint
npm run build
```

Hasil build production frontend tersedia di `frontend/dist`.

## 7. Instalasi pada database yang sudah berisi data

Untuk database yang sudah digunakan, jalankan migrasi tanpa menghapus data:

```bash
cd backend
php artisan migrate
```

Jangan menjalankan `php artisan migrate:fresh`, karena perintah tersebut
menghapus seluruh tabel dan data.

## Troubleshooting

### Laravel gagal terhubung ke MySQL

- Pastikan layanan MySQL berjalan.
- Periksa `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, dan
  `DB_PASSWORD`.
- Jalankan `php artisan optimize:clear` setelah mengubah `.env`.
- Pada file `.env` tetap jalankan `SESSION_DRIVER=file`

### React menampilkan Network Error

- Pastikan `php artisan serve` masih berjalan.
- Pastikan `VITE_API_BASE_URL` mengarah ke URL backend yang benar.
- Mulai ulang `npm run dev` setelah mengubah `.env`.

### Foto KTP tidak tampil

Jalankan:

```bash
cd backend
php artisan storage:link
```

Pastikan `APP_URL` sama dengan alamat backend, lalu jalankan:

```bash
php artisan optimize:clear
```

### Port sudah digunakan

Backend dapat dijalankan pada port lain:

```bash
php artisan serve --port=8001
```

Jika memakai port lain, ubah frontend:

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8001/api
```

Kemudian mulai ulang Vite.

