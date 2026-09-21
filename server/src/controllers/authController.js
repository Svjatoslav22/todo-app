const prisma = require("../lib/prisma");
const { hashPassword, comparePassword } = require("../utils/password");
const { signToken } = require("../utils/jwt");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function validateAuthPayload(email, password) {
  if (!email || !password) {
    return "Email and password are required";
  }

  if (!EMAIL_REGEX.test(email)) {
    return "Invalid email format";
  }

  if (typeof password !== "string" || password.length < 6) {
    return "Password must be at least 6 characters";
  }

  return null;
}

function publicUser(user) {
  return { id: user.id, email: user.email };
}

async function register(req, res) {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;
    const error = validateAuthPayload(email, password);

    if (error) {
      return res.status(400).json({ message: error });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: await hashPassword(password),
      },
    });

    return res.status(201).json({
      token: signToken({ id: user.id }),
      user: publicUser(user),
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Email already in use" });
    }

    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function login(req, res) {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;
    const error = validateAuthPayload(email, password);

    if (error) {
      return res.status(400).json({ message: error });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    const passwordMatches =
      user && (await comparePassword(password, user.password));

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    return res.json({
      token: signToken({ id: user.id }),
      user: publicUser(user),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function me(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true },
    });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    return res.json({ user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { register, login, me };
