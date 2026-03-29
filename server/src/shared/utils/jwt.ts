import jwt from "jsonwebtoken";
import { Response } from "express";

const getSecret = (type: "access" | "refresh"): string => {
  const secret = type === "access" ? process.env.JWT_SECRET : (process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
  if (!secret) throw new Error("JWT_SECRET is not defined in environment variables");
  return secret;
};

export const generateAccessToken = (userId: string, role: string): string => {
  const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
  return jwt.sign({ id: userId, role }, getSecret("access"), {
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
  });
};

export const generateRefreshToken = (userId: string, role: string): string => {
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
  return jwt.sign({ id: userId, role }, getSecret("refresh"), {
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
  });
};

export const verifyAccessToken = (token: string): jwt.JwtPayload => {
  return jwt.verify(token, getSecret("access")) as jwt.JwtPayload;
};

export const verifyRefreshToken = (token: string): jwt.JwtPayload => {
  return jwt.verify(token, getSecret("refresh")) as jwt.JwtPayload;
};

export const setRefreshTokenCookie = (res: Response, token: string): void => {
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge,
  });
};

export const clearRefreshTokenCookie = (res: Response): void => {
  res.cookie("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
  });
};
