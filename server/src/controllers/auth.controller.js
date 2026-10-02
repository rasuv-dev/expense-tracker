import * as authService from "../services/auth.service.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const result = await authService.registerUser({
      name,
      email: email.trim().toLowerCase(),
      password,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    return res
      .status(error.message === "Email already registered" ? 409 : 500)
      .json({
        success: false,
        message:
          error.message === "Email already registered"
            ? error.message
            : "Internal server error",
      });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const result = await authService.loginUser({
      email: email.trim().toLowerCase(),
      password,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    if (error.message === "Invalid email or password") {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
