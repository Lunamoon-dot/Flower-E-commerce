import * as authRepository from "./auth.repository";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../shared/utils/jwt";

export const registerUser = async (userData: any) => {
  const existingUser = await authRepository.findUserByEmail(userData.email);
  if (existingUser) {
    throw new Error("Email already registered");
  }

  const user = await authRepository.createUser(userData);
  const accessToken = generateAccessToken(String(user._id), user.role);
  const refreshToken = generateRefreshToken(String(user._id), user.role);

  return { user, accessToken, refreshToken };
};

export const loginUser = async (credentials: any) => {
  const user = await authRepository.findUserByEmail(credentials.email, true);
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await user.comparePassword(credentials.password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const accessToken = generateAccessToken(String(user._id), user.role);
  const refreshToken = generateRefreshToken(String(user._id), user.role);

  return { user, accessToken, refreshToken };
};

export const getMe = async (userId: string) => {
  const user = await authRepository.findUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

export const refreshUserToken = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new Error("No refresh token provided");
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await authRepository.findUserById(decoded.id);
    
    if (!user) {
      throw new Error("User not found");
    }

    const accessToken = generateAccessToken(String(user._id), user.role);
    // Optionally rotate refresh token
    const newRefreshToken = generateRefreshToken(String(user._id), user.role);

    return { user, accessToken, refreshToken: newRefreshToken };
  } catch (error) {
    throw new Error("Invalid or expired refresh token");
  }
};
