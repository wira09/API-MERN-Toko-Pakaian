const jwt = require("jsonwebtoken");
const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token)
      return res.status(401).json({ error: "Akses ditolak. Token tidak ada" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(401).json({ error: "Token tidak valid" });

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ error: "Token tidak valid" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ error: "Token telah kadaluarsa" });
    }
    console.error("Auth error:", error);
    return res.status(500).json({ error: "Terjadi kesalahan pada server" });
  }
};

// Admin role middleware
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Pengguna tidak terautentikasi" });
  }
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Akses ditolak. Hanya untuk admin" });
  }
  next();
};

module.exports = { auth, adminOnly };
