# Backend Toko Pakaian

Backend untuk aplikasi toko pakaian menggunakan Node.js, Express, dan Prisma ORM.

## Fitur

- Autentikasi pengguna (Register/Login)
- Manajemen produk (CRUD)
- Sistem pesanan
- Role-based access control (Admin/User)
- Upload gambar produk

## Teknologi

- Node.js
- Express.js
- Prisma ORM
- MySQL
- JSON Web Tokens (JWT)
- Bcrypt.js
- Multer (File upload)

## Instalasi

1. Clone repository
2. Install dependencies:
   ```
   npm install
   ```
3. Buat file `.env` berdasarkan `.env.example`
4. Jalankan migrasi database:
   ```
   npm run migrate
   ```
5. Generate Prisma Client:
   ```
   npm run generate
   ```
6. Jalankan server dalam mode development:
   ```
   npm run dev
   ```

## Script yang Tersedia

- `npm run dev` - Menjalankan server dalam mode development dengan nodemon
- `npm run start` - Menjalankan server dalam mode production
- `npm run migrate` - Menjalankan migrasi database
- `npm run migrate:reset` - Mereset database
- `npm run generate` - Mengenerate ulang Prisma Client
- `npm run studio` - Menjalankan Prisma Studio untuk melihat data database

## API Endpoints

### Autentikasi
- `POST /api/auth/register` - Registrasi pengguna baru
- `POST /api/auth/login` - Login pengguna

### Produk
- `GET /api/products` - Mendapatkan semua produk
- `POST /api/products` - Membuat produk baru (Admin only)
- `PUT /api/products/:id` - Mengupdate produk (Admin only)
- `DELETE /api/products/:id` - Menghapus produk (Admin only)

### Pesanan
- `POST /api/orders` - Membuat pesanan baru
- `GET /api/orders` - Mendapatkan pesanan pengguna

## Middleware

- `auth` - Memverifikasi token JWT
- `adminOnly` - Memastikan pengguna memiliki role ADMIN

## Struktur Database

- User (id, name, email, password, role)
- Category (id, name)
- Product (id, name, description, price, image, categoryId)
- Order (id, userId, total, status)
- OrderItem (id, orderId, productId, quantity, price)

## File Upload

Gambar produk disimpan di direktori `uploads/` dan diakses secara statis melalui endpoint `/uploads/filename`.

### Validasi File Upload
- Hanya file gambar yang diizinkan (jpeg, png, gif, dll)
- Ukuran maksimal file: 5MB
- Nama file diacak untuk mencegah konflik

## Penanganan Error

Backend dilengkapi dengan penanganan error yang komprehensif:
- Validasi input di setiap endpoint
- Penanganan error database
- Penanganan error autentikasi
- Penanganan error upload file
- Global error handler untuk error yang tidak terduga