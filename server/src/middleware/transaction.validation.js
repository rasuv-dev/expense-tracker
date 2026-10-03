import { body, param, validationResult } from "express-validator";

// Check validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      code: "VALIDATION_ERROR",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }

  next();
};

// Validate Transaction ID
export const validateTransactionId = [
  param("id").isMongoId().withMessage("Invalid transaction ID format"),

  validate,
];

// Validate Create Transaction
export const validateCreateTransaction = [
  body("type")
    .exists()
    .withMessage("Transaction type is required")
    .bail()
    .isString()
    .withMessage("Transaction type must be a string")
    .bail()
    .trim()
    .toLowerCase()
    .isIn(["income", "expense"])
    .withMessage("Transaction type must be income or expense"),

  body("amount")
    .exists()
    .withMessage("Transaction amount is required")
    .bail()
    .isFloat({ min: 0.01 })
    .withMessage("Transaction amount must be at least 0.01")
    .toFloat(),

  body("category")
    .exists()
    .withMessage("Transaction category is required")
    .bail()
    .isString()
    .withMessage("Transaction category must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Transaction category cannot be empty"),

  body("date")
    .optional()
    .isISO8601()
    .withMessage("Transaction date must be a valid ISO 8601 date")
    .bail()
    .toDate(),

  validate,
];

// Validate Update Transaction
export const validateUpdateTransaction = [
  param("id").isMongoId().withMessage("Invalid transaction ID format"),

  body().custom((value) => {
    const allowedFields = ["type", "amount", "category", "date"];

    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("Request body must be an object");
    }

    const hasValidField = allowedFields.some(
      (field) => value[field] !== undefined,
    );

    if (!hasValidField) {
      throw new Error("At least one valid field is required for update");
    }

    return true;
  }),

  body("type")
    .optional()
    .isString()
    .withMessage("Transaction type must be a string")
    .bail()
    .trim()
    .toLowerCase()
    .isIn(["income", "expense"])
    .withMessage("Transaction type must be income or expense"),

  body("amount")
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage("Transaction amount must be at least 0.01")
    .toFloat(),

  body("category")
    .optional()
    .isString()
    .withMessage("Transaction category must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Transaction category cannot be empty"),

  body("date")
    .optional()
    .isISO8601()
    .withMessage("Transaction date must be a valid ISO 8601 date")
    .bail()
    .toDate(),

  validate,
];
