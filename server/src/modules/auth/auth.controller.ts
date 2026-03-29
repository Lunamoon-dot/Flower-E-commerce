import { Request, Response } from "express";
import * as authService from "./auth.service";
import { setRefreshTokenCookie, clearRefreshTokenCookie } from "../../shared/utils/jwt";
import { AuthRequest } from "../../shared/middleware/auth";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user, accessToken, refreshToken } = await authService.registerUser(req.body);
    setRefreshTokenCookie(res, refreshToken);
    res.status(201).json({
      user: { id: user._id.toString(), _id: user._id.toString(), name: user.name, email: user.email, role: user.role },
      token: accessToken,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed";
    res.status(400).json({ message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user, accessToken, refreshToken } = await authService.loginUser(req.body);
    setRefreshTokenCookie(res, refreshToken);
    res.json({
      user: { id: user._id.toString(), _id: user._id.toString(), name: user.name, email: user.email, role: user.role },
      token: accessToken,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    res.status(401).json({ message });
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  clearRefreshTokenCookie(res);
  res.json({ message: "Logged out successfully" });
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await authService.getMe(req.user!.id);
    res.json({
      id: user._id.toString(),
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get user";
    res.status(404).json({ message });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      res.status(401).json({ message: "No refresh token provided" });
      return;
    }

    const { user, accessToken, refreshToken: newRefreshToken } = await authService.refreshUserToken(refreshToken);
    setRefreshTokenCookie(res, newRefreshToken);
    
    res.json({
      user: { id: user._id.toString(), _id: user._id.toString(), name: user.name, email: user.email, role: user.role },
      token: accessToken,
    });
  } catch (error) {
    clearRefreshTokenCookie(res);
    const message = error instanceof Error ? error.message : "Refresh failed";
    res.status(401).json({ message });
  }
};
