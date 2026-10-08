import jwt from "jsonwebtoken";
import env from "../lib/env";
import { UserTokenPayload } from "../types";

export const ACCESS_TOKEN_EXPIRES_IN = "15m";
export const REFRESH_TOKEN_EXPIRES_IN = "7d";

export const REFRESH_COOKIE_NAME = "refreshToken";

export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

export function signAccessToken(payload: UserTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
}

export function signRefreshToken(payload: UserTokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
}

export function verifyAccessToken(token: string): UserTokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as UserTokenPayload;
}

export function verifyRefreshToken(token: string): UserTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as UserTokenPayload;
}

// Backwards compatibility aliases
export const signToken = signAccessToken;
export const verifyToken = verifyAccessToken;
