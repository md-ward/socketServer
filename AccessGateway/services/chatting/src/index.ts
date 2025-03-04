import express, { Application } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import cors from "cors";
import { Server, Socket } from "socket.io";
import userRouter from "./routers/userRouter";
import { sendMessage } from "./controllers/chatControllers";

// Load environment variables
dotenv.config();

const app: Application = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

const port = process.env.Chat_Port || 8002; // Default to 8002
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Allow connections from all origins
    methods: ["GET", "POST"],
    allowedHeaders: ["x-access-token", "x-api-key", "x-user-id"],
  },
  allowEIO3: true, // Enable support for older clients
});

// ✅ Accept forwarded WebSocket connections via proxy
io.engine.on("headers", (headers, req) => {
  headers["Access-Control-Allow-Origin"] = "*";
  headers["Access-Control-Allow-Headers"] =
    "x-access-token, x-api-key, x-user-id";
});

app.use("/user", userRouter);


// MongoDB Connection
mongoose
  .connect(process.env.Chat_DB_URL as string)
  .then(() => console.log("Chatting Service Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

const onlineUsers = new Map<string, string>(); // Map userId -> socketId

// ✅ WebSocket Handling
io.on("connection", (socket: Socket) => {
  console.log(`User connected: ${socket.id}`);

  // ✅ Extract user ID from query (use headers for security)
  const userId = socket.handshake.query.user as string;
  console.log(`User ID: ${userId}`);

  if (userId) {
    onlineUsers.set(userId, socket.id);
  }

  // ✅ Listen for forwarded messages
  socket.on("sendMessage", async (data) => {
    const { message, apiKey, System } = data;
    console.log(
      `Message from ${userId} to ${message.receiverId}: ${message.text}`
    );

    const recipientSocketId = onlineUsers.get(message.receiverId);
    console.log(`Recipient Socket ID: ${recipientSocketId}`);

    const messageObj = await sendMessage(
      { ...message, senderId: userId },
      apiKey,
      System
    );

    if (recipientSocketId) {
      io.to(recipientSocketId).emit("receiveMessage", {
        senderId: userId,
        messageObj,
      });
    }
  });

  // ✅ Handle Disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    if (userId) {
      onlineUsers.delete(userId);
      console.log(`User ${userId} removed from online list`);
    }
  });
});

// ✅ Debugging WebSocket Forwarding
server.on("upgrade", (req, socket, head) => {
  console.log(`WebSocket upgrade request from ${req.headers.host}`);
});

server.listen(port, () => {
  console.log(`Chatting Service is running on port ${port}`);
});
