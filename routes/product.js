const express = require("express");
const multer = require("multer");
const { auth, adminOnly } = require("../middleware/auth");
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  upload,
} = require("../controllers/productController");

const router = express.Router();

// Error handler untuk upload file
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ error: "Ukuran file terlalu besar. Maksimal 5MB." });
    }
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

// get all products
router.get("/", getAllProducts);
// create a new product (admin only)
router.post("/", auth, adminOnly, upload, handleUploadError, createProduct);
// get a product by ID
router.get("/:id", getProductById);
// update a product (admin only)
router.put("/:id", auth, adminOnly, upload, handleUploadError, updateProduct);
// delete a product (admin only)
router.delete("/:id", auth, adminOnly, deleteProduct);

module.exports = router;
