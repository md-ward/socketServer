import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import stockRouter from "./src/routes/stock.router";

dotenv.config();

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create HTTP server
const server = http.createServer(app);

const port = process.env.Recourse_Port;

app.use("/stock", stockRouter);

mongoose
  .connect(process.env.Recourse_DB_URL as string)
  .then(() => {
    console.log("Connected to MongoDB");
    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
