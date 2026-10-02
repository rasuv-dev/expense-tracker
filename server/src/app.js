import express from "express";
import cors from "cors";
import { authRouter } from "./routes/authRoutes.js";
import { verifyToken } from "./middleware/auth.middleware.js";
const app = express();

app.use(cors());
app.use(express.json());
app.use(authRouter);

app.get("/health", verifyToken ,(req, res) => {
  res.send("server is running..");
});

export default app;
