const express = require("express");
const { auth } = require("../middleware/auth");
const {
  createOrder,
  getUserOrders,
} = require("../controllers/orderController");
const router = express.Router();

// Create a new order
router.post("/", auth, createOrder);

// Get orders for the authenticated user
router.get("/", auth, getUserOrders);

module.exports = router;
