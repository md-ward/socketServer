import express, { Application, NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import cors from "cors";
import { Server, Socket } from "socket.io";
import { sendMessage } from "./controllers/chatControllers";
import { Message } from "./schema/messageSchema";

//* Load environment variables
dotenv.config();

const app: Application = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:8000", // Only allow requests from proxy
    methods: ["GET", "POST"],
    allowedHeaders: ["x-access-token", "x-api-key", "x-user-id"],
  })
);
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.headers.host !== "localhost:8000") {
    console.log(`Blocked request from ${req.headers.host}`);
    res.status(403).send("Forbidden");
  } else {
    next();
  }
});

const port = process.env.Chat_Port || 8002; // Default to 8002
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:8000", // Allow only the proxy
    methods: ["GET", "POST"],
    allowedHeaders: ["x-access-token", "x-api-key", "x-user-id"],
  },
  allowEIO3: true,
});

//* Ensure WebSocket connections are only accepted from the proxy
io.use((socket, next) => {
  const origin = socket.handshake.headers.host as string;

  if (origin !== "localhost:8000") {
    console.log(`Blocked WebSocket connection from ${origin}`);
    return next(new Error("WebSocket connections only allowed from proxy"));
  }
  next();
});

// ✅ Accept forwarded WebSocket connections via proxy
io.engine.on("headers", (headers) => {
  headers["Access-Control-Allow-Origin"] = "*";
  headers["Access-Control-Allow-Headers"] =
    "x-access-token, x-api-key, x-user-id";
});

app.use("/user", (req, res) => {
  res.send("you did a req to /user");
});
app.use("/attachments", (req, res) => {
  res.send("you did a req to /attachments");
});
//! MongoDB Connection
mongoose
  .connect(process.env.Chat_DB_URL as string)
  .then(() => console.log("Chatting Service Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));
const onlineUsers: { [systemId: string]: { [userId: string]: string } } = {};

//? ✅ Handle New WebSocket Connection
io.on("connection", (socket: Socket) => {
  console.log(`🔵 User connected: ${socket.id}`);

  // ✅ Extract systemId and userId from handshake headers
  const systemId = socket.handshake.headers["x-system-id"] as string;
  const userId = socket.handshake.query.user as string;

  if (!systemId || !userId) {
    console.error("❌ Connection missing systemId or userId, disconnecting...");
    socket.disconnect();
    return;
  }

  console.log(`🔹 User ID: ${userId}, System ID: ${systemId}`);

  // ✅ Store user in onlineUsers map
  if (!onlineUsers[systemId]) {
    onlineUsers[systemId] = {};
  }
  onlineUsers[systemId][userId] = socket.id;

  console.log(`✅ Stored user: ${JSON.stringify(onlineUsers, null, 2)}`);

  // ✅ Listen for messages
  socket.on("sendMessage", async (data) => {
    const { message, recipientId } = data;

    console.log(
      `📩 Message from ${userId} (System: ${systemId}) to ${recipientId}: ${message}`
    );

    // ✅ Retrieve recipient's socket ID
    const recipientSocketId = onlineUsers[systemId]?.[recipientId];

    if (recipientSocketId) {
      io.to(recipientSocketId).emit("receiveMessage", {
        senderId: userId,
        message: message,
      });
      // ✅ Save message to database
      await sendMessage(
        new Message({
          message,
          senderId: userId,
          receiverId: recipientId,
          systemId,
        })
      );
      console.log(`✅ Message forwarded to ${recipientId}`);
    } else {
      console.log(`❌ Recipient ${recipientId} is offline.`);
    }   
  });

  // ✅ Handle User Disconnect
  socket.on("disconnect", () => {
    console.log(`🔴 User disconnected: ${socket.id}`);

    if (onlineUsers[systemId] && onlineUsers[systemId][userId]) {
      delete onlineUsers[systemId][userId];

      // Remove system if empty
      if (Object.keys(onlineUsers[systemId]).length === 0) {
        delete onlineUsers[systemId];
      }

      console.log(`🗑️ Removed user ${userId} from online list.`);
    }
  });
});

// ✅ Debugging WebSocket Forwarding
server.on("upgrade", (req) => {
  console.log(`WebSocket upgrade request from ${req.headers.host}`);
});

server.listen(port, () => {
  console.log(`Chatting Service is running on port ${port}`);
});


