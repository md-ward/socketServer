import http, { IncomingMessage } from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import systemRouter from "./routes/systemRouter";
import { checkAccess } from "./middleware/accessApiCheck";

import System from "./schema/system";
import { Socket } from "net";
import {proxyMiddleware , handleWebSocketUpgrade } from "./middleware/proxy";

dotenv.config();

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create HTTP server
const server = http.createServer(app);

// Attach Proxy Middleware
app.use("/api/sys", systemRouter);
app.use("/api", checkAccess, proxyMiddleware);
server.on(
  "upgrade",
  async (req: IncomingMessage, socket: Socket, head: Buffer) => {
    handleWebSocketUpgrade(req, socket, head);
    try {
      const apiKey = req.headers["authorization"];

      if (!apiKey) {
        // console.error("❌ WebSocket Access Denied: Missing API key");
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        return socket.destroy();
      }

      const system = await System.findOne({ apiKey });

      if (!system) {
        // console.error("❌ WebSocket Access Denied: Invalid API key");
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        return socket.destroy();
      }

      const date = new Date();
      if (system.expiryDate && date > system.expiryDate) {
        // console.error("❌ WebSocket Access Denied: API key expired");
        socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
        return socket.destroy();
      }

      // ✅ Attach systemId for tracking
      req.headers["x-system-id"] = system._id as string;
      // console.log("✅ WebSocket Access Granted, forwarding to proxy...");
    } catch (error) {
      console.error("❌ WebSocket Access Error:", error);
      socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
      socket.destroy();
    }
  }
);

const port = process.env.System_PORT || 8000;

mongoose
  .connect(process.env.System_DB_URL as string)
  .then(() => {
    console.log("Connected to MongoDB");
    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
