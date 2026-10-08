import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { hashPassword, comparePassword } from "../utils/password";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_OPTIONS,
} from "../utils/jwt";
import {
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
} from "../utils/errors";
import asyncHandler from "../utils/asyncHandler";
import { logAudit } from "../utils/auditLogger";
import { AuthRequest } from "../types";

function publicUser(user: { id: number; email: string; role?: string; isBanned?: boolean; createdAt?: Date }) {
  return {
    id: user.id,
    email: user.email,
    role: user.role || "user",
    isBanned: Boolean(user.isBanned),
    createdAt: user.createdAt,
  };
}

function setAuthCookies(res: Response, refreshToken: string) {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);
}

export const register = asyncHandler(async (req: Request, res: Response) => {
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

  const accessToken = signAccessToken({ id: user.id, role: user.role });
  const refreshToken = signRefreshToken({ id: user.id });

  setAuthCookies(res, refreshToken);

  logAudit({
    action: "USER_REGISTER",
    details: `Новий користувач ${user.email} зареєструвався`,
    userId: user.id,
    ip: req.ip,
  });

  return res.status(201).json({
    token: accessToken,
    accessToken,
    user: publicUser(user),
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  const passwordMatches =
    user && (await comparePassword(password, user.password));

  if (!passwordMatches) {
    throw new UnauthorizedError("Невірний email або пароль");
  }

  if (user.isBanned) {
    throw new ForbiddenError("Ваш обліковий запис заблоковано адміністратором");
  }

  const accessToken = signAccessToken({ id: user.id, role: user.role });
  const refreshToken = signRefreshToken({ id: user.id });

  setAuthCookies(res, refreshToken);

  logAudit({
    action: "USER_LOGIN",
    details: `Користувач ${user.email} увійшов у систему`,
    userId: user.id,
    ip: req.ip,
  });

  return res.json({
    token: accessToken,
    accessToken,
    user: publicUser(user),
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;

  if (!token) {
    throw new UnauthorizedError("Сесія закінчилась або токен оновлення відсутній");
  }

  let decoded: { id: number };
  try {
    decoded = verifyRefreshToken(token) as { id: number };
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

  if (user.isBanned) {
    res.clearCookie(REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS);
    throw new ForbiddenError("Ваш обліковий запис заблоковано адміністратором");
  }

  const newAccessToken = signAccessToken({ id: user.id, role: user.role });
  const newRefreshToken = signRefreshToken({ id: user.id });

  setAuthCookies(res, newRefreshToken);

  return res.json({
    token: newAccessToken,
    accessToken: newAccessToken,
    user: publicUser(user),
  });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS);
  return res.json({ message: "Успішний вихід із системи" });
});

export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError("Не авторизовано");
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, email: true, role: true, isBanned: true, createdAt: true },
  });

  if (!user) {
    throw new UnauthorizedError("Користувача не знайдено");
  }

  return res.json({ user });
});

export default {
  register,
  login,
  refresh,
  logout,
  me,
};
