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

const port = process.env.PORT || 8000;
const mongoUri =
  process.env.MONGO_URI || "mongodb://localhost:27017/accessGateway";

try {
  mongoose.connect(mongoUri).then(() => {
    console.log("Connected to MongoDB");
  });

  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
} catch (error) {}
