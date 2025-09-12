const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Validasi format email
const validateEmail = (email) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

// auth register
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  // Validasi input
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Nama, email, dan password harus diisi" });
  }

  // Validasi format email
  if (!validateEmail(email)) {
    return res.status(400).json({ error: "Format email tidak valid" });
  }

  // Validasi panjang password
  if (password.length < 6) {
    return res.status(400).json({ error: "Password minimal 6 karakter" });
  }

  try {
    // Cek apakah email sudah digunakan
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email sudah digunakan" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "USER",
      },
    });
    res.status(201).json({ message: "User berhasil didaftarkan", user });
  } catch (error) {
    res.status(500).json({
      error: "Terjadi kesalahan saat registrasi",
      details: error.message,
    });
  }
};

// auth login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Validasi input
  if (!email || !password) {
    return res.status(400).json({ error: "Email dan password harus diisi" });
  }

  // Validasi format email
  if (!validateEmail(email)) {
    return res.status(400).json({ error: "Format email tidak valid" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Email atau password salah" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Terjadi kesalahan saat login",
      details: error.message,
    });
  }
};
