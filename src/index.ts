import express, { Express, Request, Response, Application } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import http, { Server } from "http";
import cors from "cors";
import { Socket } from "socket.io";
//For env File
dotenv.config();

const app: Application = express();
app.use(express.json());
app.use(cors({ origin: "*" }));
const port = process.env.PORT || 8000;
const server = http.createServer(app);
const io = new Server(server);

try {
  const dbConnection = mongoose.connect(process.env.DB_URL as string);
  dbConnection
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((error) => {
      console.error("Error connecting to MongoDB:", error);
    });
  const onlineUsers = new Map<string, string>(); // Map userId -> socketId

  io.on("connection", (socket: Socket) => {
    if (socket.handshake.query.user) {
      const userId = socket.handshake.query.user as string;
      onlineUsers.set(userId, socket.id);
    }
  });
} catch (error) {
  console.log(error);
}
