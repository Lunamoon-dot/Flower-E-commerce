import * as authRepository from "./auth.repository";
import { generateToken } from "../../shared/utils/jwt";

export const registerUser = async (userData: any) => {
  const existingUser = await authRepository.findUserByEmail(userData.email);
  if (existingUser) {
    throw new Error("Email already registered");
  }

  const user = await authRepository.createUser(userData);
  const token = generateToken(String(user._id), user.role);

  return { user, token };
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

  const token = generateToken(String(user._id), user.role);
  return { user, token };
};

export const getMe = async (userId: string) => {
  const user = await authRepository.findUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};
