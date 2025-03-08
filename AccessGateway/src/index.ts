import http, { IncomingMessage } from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import systemRouter from "./routes/systemRouter";
import { checkAccess } from "./middleware/accessApiCheck";

import System from "./schema/system";
import { Socket } from "net";

dotenv.config();

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create HTTP server
const server = http.createServer(app);

// Proxy for Chatting Service (Port 8002)
const proxyMiddleware = createProxyMiddleware({
  target: "http://localhost:8002",

  // changeOrigin: true,
  ws: true, // Enable WebSocket support
  pathRewrite: {
    "^/api": "", // Rewrite /api/user -> /user
  },
  on: {
    error: (error: Error) => console.error("Proxy Error:", error),

    proxyReq: (proxyReq: http.ClientRequest, req: http.IncomingMessage) => {
      console.log("Forwarding request to:", req.method);

      // Forward custom headers
      [
        "x-access-token",
        "x-refresh-token",
        "x-system-id",
        "x-api-key",
        "x-user-id",
        "x-forwarded-for",
        "referer",
      ].forEach((header) => {
        if (req.headers[header]) {
          proxyReq.setHeader(header, req.headers[header]);
        }
      });
    },
  },
});

// Attach Proxy Middleware
app.use("/api/sys", systemRouter);
app.use("/api", checkAccess, proxyMiddleware);
server.on(
  "upgrade",
  async (req: IncomingMessage, socket: Socket, head: Buffer) => {
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
      proxyMiddleware.upgrade(req, socket, head);
    } catch (error) {
      console.error("❌ WebSocket Access Error:", error);
      socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n" );
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
