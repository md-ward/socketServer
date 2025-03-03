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

const port = process.env.Chat_Port;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust this based on security needs
    methods: ["GET", "POST"],
  },
});

app.use("/user", userRouter);
// MongoDB Connection
mongoose
  .connect(process.env.Chat_DB_URL as string)
  .then(() => console.log("Chatting ServiceConnected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

const onlineUsers = new Map<string, string>(); // Map userId -> socketId

// Socket.io Connection Handling
io.on("connection", (socket: Socket) => {
  console.log(`User connected: ${socket.id}`);

  // Capture user ID from query params
  const userId = socket.handshake.query.user as string;
  console.log(`User ID: ${userId}`);
  onlineUsers.set(userId, socket.id);

  // Listen for messages
  socket.on("sendMessage", async (data) => {
    const { message, apiKey, System } = data;
    console.log(`Message from ${userId} to ${message.receiverId}: ${message}`);

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

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    if (userId) {
      onlineUsers.delete(userId);
      console.log(`User ${userId} disconnected`);
    }
  });
});

// API Routes

// Start Server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
