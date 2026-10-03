import express from "express";

import { authRouter } from "./authRoutes.js";
import { transactionRoutes } from "./TransactionRoutes.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const mainRouter = express.Router();

// Public routes
mainRouter.use("/auth", authRouter);

// Protected transaction routes
mainRouter.use("/transactions", verifyToken, transactionRoutes);

export default mainRouter;
