import express from "express";

import {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transaction.controller.js";

import {
  validateCreateTransaction,
  validateTransactionId,
  validateUpdateTransaction,
} from "../middleware/transaction.validation.js";

const transactionRoutes = express.Router();

// Create a transaction
transactionRoutes.post("/create", validateCreateTransaction, createTransaction);

// Get all transactions
transactionRoutes.get("/", getTransactions);

// Get a single transaction
transactionRoutes.get("/:id", validateTransactionId, getTransactionById);

// Update a transaction
transactionRoutes.patch("/:id", validateUpdateTransaction, updateTransaction);

// Delete a transaction
transactionRoutes.delete("/:id", validateTransactionId, deleteTransaction);

export { transactionRoutes };
