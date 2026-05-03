const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const prisma = require("../prisma");

function buildToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
}

function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt
  };
}

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: errors.array()
    });
    return false;
  }
  return true;
}

async function register(req, res) {
  if (!handleValidation(req, res)) return;

  try {
    const { name, email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(422).json({
        success: false,
        message: "Email already in use"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "MEMBER"
      }
    });

    const token = buildToken(user);
    setAuthCookie(res, token);

    return res.json({
      success: true,
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Registration failed" });
  }
}

async function login(req, res) {
  if (!handleValidation(req, res)) return;

  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = buildToken(user);
    setAuthCookie(res, token);

    return res.json({
      success: true,
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Login failed" });
  }
}

async function me(req, res) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load user" });
  }
}

async function logout(req, res) {
  res.clearCookie("token");
  return res.json({ success: true, message: "Logged out" });
}

module.exports = {
  register,
  login,
  me,
  logout
};
