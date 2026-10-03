import * as TransactionService from "../services/transaction.service.js";

// Create Transaction
export const createTransaction = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const transaction = await TransactionService.createTransaction(
      userId,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      transaction: transaction,
    });
  } catch (error) {
    next(error);
  }
};

// Get All Transactions
export const getTransactions = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const transactions = await TransactionService.getTransactions(userId);

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions: transactions,
    });
  } catch (error) {
    next(error);
  }
};

// Get Transaction By ID
export const getTransactionById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;

    const transaction = await TransactionService.getTransactionById(
      userId,
      transactionId
    );

    res.status(200).json({
      success: true,
      transaction: transaction,
    });
  } catch (error) {
    next(error);
  }
};

// Update Transaction
export const updateTransaction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;

    const transaction = await TransactionService.updateTransaction(
      userId,
      transactionId,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      transaction: transaction,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Transaction
export const deleteTransaction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;

    await TransactionService.deleteTransaction(userId, transactionId);

    res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};