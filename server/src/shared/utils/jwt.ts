import jwt from "jsonwebtoken";
import { Response } from "express";

const getSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined in environment variables");
  return secret;
};

export const generateToken = (userId: string, role: string): string => {
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign({ id: userId, role }, getSecret(), {
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
  });
};

export const verifyToken = (token: string): jwt.JwtPayload => {
  return jwt.verify(token, getSecret()) as jwt.JwtPayload;
};

export const setTokenCookie = (res: Response, token: string): void => {
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge,
  });
};

export const clearTokenCookie = (res: Response): void => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
  });
};
