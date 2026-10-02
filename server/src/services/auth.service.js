import User from "../models/User.js";
import jwt from "jsonwebtoken";

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
};

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("Email already registered");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    token: generateToken(user._id.toString()),
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new Error("Invalid email or password");
  }

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    token: generateToken(user._id.toString()),
  };
};
