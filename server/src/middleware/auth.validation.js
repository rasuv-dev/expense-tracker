import { body, validationResult } from "express-validator";

export const validateRegister = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 100 })
    .withMessage("Name cannot exceed 100 characters"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Enter a valid email")
    .normalizeEmail(),

  body("password")
    .isString()
    .isLength({ min: 8, max: 72 })
    .withMessage("Password must be 8–72 characters"),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(({ path, msg }) => ({
          field: path,
          message: msg,
        })),
      });
    }

    next();
  },
];

export const validateLogin = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Enter a valid email")
    .normalizeEmail(),

  body("password")
    .isString()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ max: 72 })
    .withMessage("Invalid password length"),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(({ path, msg }) => ({
          field: path,
          message: msg,
        })),
      });
    }

    next();
  },
];
