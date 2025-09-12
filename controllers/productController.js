const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const multer = require("multer");
const path = require("path");

// Setup upload images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Filter file untuk hanya menerima gambar
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Hanya file gambar yang diizinkan!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

exports.upload = upload.single("image");

// Create a new product
exports.createProduct = async (req, res) => {
  const { name, description, price, categoryId } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    // Validasi input
    if (!name || !price || !categoryId) {
      // Hapus file yang sudah diupload jika validasi gagal
      if (req.file) {
        const fs = require("fs");
        const filePath = req.file.path;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      return res
        .status(400)
        .json({ error: "Nama, harga, dan kategori harus diisi" });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        price: parseFloat(price),
        image,
        categoryId: parseInt(categoryId),
      },
    });
    res.status(201).json(product);
  } catch (err) {
    // Hapus file yang sudah diupload jika terjadi error
    if (req.file) {
      const fs = require("fs");
      const filePath = req.file.path;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    res.status(400).json({ error: err.message });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, categoryId } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : undefined;

  try {
    // Validasi ID
    const productId = parseInt(id);
    if (isNaN(productId)) {
      // Hapus file yang sudah diupload jika validasi gagal
      if (req.file) {
        const fs = require("fs");
        const filePath = req.file.path;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      return res.status(400).json({ error: "ID produk tidak valid" });
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(name && { name }),
        description: description !== undefined ? description : undefined,
        ...(price && { price: parseFloat(price) }),
        ...(categoryId && { categoryId: parseInt(categoryId) }),
        ...(image && { image }),
      },
    });
    res.json(product);
  } catch (err) {
    // Hapus file yang sudah diupload jika terjadi error
    if (req.file) {
      const fs = require("fs");
      const filePath = req.file.path;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    if (err.code === "P2025") {
      res.status(404).json({ error: "Produk tidak ditemukan." });
    } else {
      res.status(400).json({ error: err.message });
    }
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    // Validasi ID
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return res.status(400).json({ error: "ID produk tidak valid" });
    }

    // Dapatkan produk untuk menghapus gambar
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    // Hapus produk
    await prisma.product.delete({ where: { id: productId } });

    // Hapus file gambar jika ada
    if (product && product.image) {
      const fs = require("fs");
      const imagePath = path.join(__dirname, "..", product.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.json({ message: "Produk dihapus." });
  } catch (err) {
    if (err.code === "P2025") {
      res.status(404).json({ error: "Produk tidak ditemukan." });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};
