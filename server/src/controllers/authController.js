const prisma = require("../lib/prisma");
const { hashPassword, comparePassword } = require("../utils/password");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_OPTIONS,
} = require("../utils/jwt");
const {
  UnauthorizedError,
  ConflictError,
} = require("../utils/errors");
const asyncHandler = require("../utils/asyncHandler");

function publicUser(user) {
  return { id: user.id, email: user.email, createdAt: user.createdAt };
}

function setAuthCookies(res, refreshToken) {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);
}

const register = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new ConflictError("Користувач із таким email вже зареєстрований");
  }

  const user = await prisma.user.create({
    data: {
      email,
      password: await hashPassword(password),
    },
  });

  const accessToken = signAccessToken({ id: user.id });
  const refreshToken = signRefreshToken({ id: user.id });

  setAuthCookies(res, refreshToken);

  return res.status(201).json({
    token: accessToken,
    accessToken,
    user: publicUser(user),
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  const passwordMatches =
    user && (await comparePassword(password, user.password));

  if (!passwordMatches) {
    throw new UnauthorizedError("Невірний email або пароль");
  }

  const accessToken = signAccessToken({ id: user.id });
  const refreshToken = signRefreshToken({ id: user.id });

  setAuthCookies(res, refreshToken);

  return res.json({
    token: accessToken,
    accessToken,
    user: publicUser(user),
  });
});

const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;

  if (!token) {
    throw new UnauthorizedError("Сесія закінчилась або токен оновлення відсутній");
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (_err) {
    res.clearCookie(REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS);
    throw new UnauthorizedError("Недійсний або прострочений токен оновлення");
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
  });

  if (!user) {
    res.clearCookie(REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS);
    throw new UnauthorizedError("Користувача більше не існує");
  }

  const newAccessToken = signAccessToken({ id: user.id });
  const newRefreshToken = signRefreshToken({ id: user.id });

  setAuthCookies(res, newRefreshToken);

  return res.json({
    token: newAccessToken,
    accessToken: newAccessToken,
    user: publicUser(user),
  });
});

const logout = asyncHandler(async (_req, res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS);
  return res.json({ message: "Успішний вихід із системи" });
});

const me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, email: true, createdAt: true },
  });

  if (!user) {
    throw new UnauthorizedError("Користувача не знайдено");
  }

  return res.json({ user });
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  me,
};
