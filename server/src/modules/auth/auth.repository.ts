import User, { IUser } from "./auth.model";

export const findUserByEmail = async (email: string, selectPassword = false): Promise<IUser | null> => {
  const query = User.findOne({ email });
  if (selectPassword) query.select("+password");
  return query.exec();
};

export const findUserById = async (id: string): Promise<IUser | null> => {
  return User.findById(id).exec();
};

export const createUser = async (userData: Partial<IUser>): Promise<IUser> => {
  return User.create(userData);
};

export const findAllUsers = async () => {
  return User.find().select("-password").sort({ createdAt: -1 }).exec();
};

export const updateUserRole = async (id: string, role: string) => {
  return User.findByIdAndUpdate(id, { role }, { returnDocument: "after" }).select("-password").exec();
};

export const deleteUserById = async (id: string) => {
  return User.findByIdAndDelete(id).exec();
};
