const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/product");
const orderRoutes = require("./routes/order");
const categoryRoutes = require("./routes/category");
const path = require("path");
const fs = require("fs");

dotenv.config();

// Pastikan direktori uploads ada
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.static(uploadsDir));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: "Terjadi kesalahan pada server",
    message: process.env.NODE_ENV === "development" ? err.message : "Terjadi kesalahan pada server"
  });
});

// api auth routes
app.use("/api/auth", authRoutes);
// api category routes
app.use("/api/categories", categoryRoutes);
// api product routes
app.use("/api/products", productRoutes);
// api order routes
app.use("/api/orders", orderRoutes);
// status api check
app.get("/", (req, res) => {
  res.send("API Toko Busana Berjalan!");
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint tidak ditemukan" });
});

// menjalankan server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
