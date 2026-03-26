import { Request, Response } from "express";
import * as authService from "./auth.service";
import { setTokenCookie, clearTokenCookie } from "../../shared/utils/jwt";
import { AuthRequest } from "../../shared/middleware/auth";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user, token } = await authService.registerUser(req.body);
    setTokenCookie(res, token);
    res.status(201).json({
      user: { id: user._id.toString(), _id: user._id.toString(), name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed";
    res.status(400).json({ message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user, token } = await authService.loginUser(req.body);
    setTokenCookie(res, token);
    res.json({
      user: { id: user._id.toString(), _id: user._id.toString(), name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    res.status(401).json({ message });
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  clearTokenCookie(res);
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
