const express = require("express");
const { auth, adminOnly } = require("../middleware/auth");
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const router = express.Router();

router.post("/", auth, adminOnly, createCategory);
router.get("/", auth, getAllCategories);
router.get("/:id", auth, getCategoryById);
router.put("/:id", auth, adminOnly, updateCategory);
router.delete("/:id", auth, adminOnly, deleteCategory);

module.exports = router;
