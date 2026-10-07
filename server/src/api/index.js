import "dotenv/config";
import app from "../app.js";
import { connectDB } from "../config/db.js";

// Cache database connection state across serverless function invocations
let isConnected = false;

const handler = async (req, res) => {
  if (!isConnected) {
    console.log("connecting to mongodb.....");
    await connectDB();
    isConnected = true;
  }

  // Pass the actual incoming request and response to Express
  return app(req, res);
};

export default handler;
