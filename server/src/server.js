import app from "./app.js";
import { connectDB } from "./config/db.js";
import "dotenv/config";


const startServer = async () => {
  console.log("server is starting....");
  console.log("connecting to mongodb.....");
  await connectDB();

  const PORT = process.env.PORT;
  app.listen(PORT);
};

startServer();
