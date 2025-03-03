import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import systemRouter from "./routes/systemRouter";

const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", systemRouter);
const server = http.createServer(app);

const port = process.env.System_PORT;

try {
  mongoose.connect(process.env.System_DB_URL as string).then(() => {
    console.log("Connected to MongoDB");
  });

  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
} catch (error) {
  console.error("Error connecting to MongoDB:", error);
}
