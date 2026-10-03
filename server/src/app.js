import express from "express";
import cors from "cors";
import mainRouter from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
const app = express();

app.use(cors());
app.use(express.json());

//mount all routes to app
app.use("/api", mainRouter);

//handle unmatched requests
app.use(notFound);

//Error-hadling middleware
app.use(errorHandler);

export default app;
