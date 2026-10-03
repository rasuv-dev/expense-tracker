import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";

// Allowed fields for updating a transaction
const allowedFields = ["type", "amount", "category", "date"];

// Create Transaction
export const createTransaction = async (userId, transactionData) => {
  const { amount, date, category, type } = transactionData;

  const newTransaction = {
    userId: userId,
    amount: amount,
    category: category,
    type: type,
  };

  // Use the model's default date if no date is provided
  if (date !== undefined) {
    newTransaction.date = date;
  }

  const transaction = await Transaction.create(newTransaction);

  return transaction;
};

// Get All Transactions
export const getTransactions = async (userId) => {
  const transactions = await Transaction.find({
    userId: userId,
  }).sort({ date: -1 });

  return transactions;
};

// Get Transaction By ID
export const getTransactionById = async (userId, transactionId) => {
  if (!mongoose.isValidObjectId(transactionId)) {
    const error = new Error("Invalid transaction ID");
    error.statusCode = 400;
    throw error;
  }

  const transaction = await Transaction.findOne({
    _id: transactionId,
    userId: userId,
  });

  if (!transaction) {
    const error = new Error("Transaction not found");
    error.statusCode = 404;
    throw error;
  }

  return transaction;
};

// Update Transaction
export const updateTransaction = async (
  userId,
  transactionId,
  transactionData,
) => {
  if (!mongoose.isValidObjectId(transactionId)) {
    const error = new Error("Invalid transaction ID");
    error.statusCode = 400;
    throw error;
  }

  const updateFields = {};

  for (const field of allowedFields) {
    if (transactionData[field] !== undefined) {
      updateFields[field] = transactionData[field];
    }
  }

  if (Object.keys(updateFields).length === 0) {
    const error = new Error("No valid fields provided for update");
    error.statusCode = 400;
    throw error;
  }

  const transaction = await Transaction.findOneAndUpdate(
    {
      _id: transactionId,
      userId: userId,
    },
    updateFields,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!transaction) {
    const error = new Error("Transaction not found");
    error.statusCode = 404;
    throw error;
  }

  return transaction;
};

// Delete Transaction
export const deleteTransaction = async (userId, transactionId) => {
  if (!mongoose.isValidObjectId(transactionId)) {
    const error = new Error("Invalid transaction ID");
    error.statusCode = 400;
    throw error;
  }

  const transaction = await Transaction.findOneAndDelete({
    _id: transactionId,
    userId: userId,
  });

  if (!transaction) {
    const error = new Error("Transaction not found");
    error.statusCode = 404;
    throw error;
  }

  return transaction;
};
