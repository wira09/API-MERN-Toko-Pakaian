const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.user.id;

    // Validasi input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Item pesanan tidak valid" });
    }

    // Validasi setiap item
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        return res
          .status(400)
          .json({
            error:
              "Setiap item harus memiliki productId dan quantity yang valid",
          });
      }
    }

    // ambil data product
    const productIds = items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    // cek apakah product ada
    let total = 0;
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new Error(`Produk dengan ID ${item.productId} tidak ditemukan`);
      }
      const price = product.price;
      total += price * item.quantity;
      return {
        productId: item.productId,
        quantity: item.quantity,
        price,
      };
    });

    // buat order
    const order = await prisma.order.create({
      data: {
        userId,
        total,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
