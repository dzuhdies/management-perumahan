# Backend Administrasi RT

REST API Laravel untuk aplikasi Administrasi Perumahan RT.

Panduan instalasi lengkap tersedia di [README utama](../README.md).

Dokumentasi endpoint dapat dibuka di `/docs/api` ketika server Laravel berjalan.

Perintah `php artisan migrate --seed` mengisi data tagihan, pembayaran, dan
pengeluaran dummy untuk tahun berjalan serta dua tahun sebelumnya.

Setelah instalasi atau clone repository, jalankan `php artisan storage:link`
agar foto KTP pada `storage/app/public/ktp` dapat dibuka melalui aplikasi.
