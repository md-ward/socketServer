import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import systemRouter from "./routes/systemRouter";
import { checkAccess } from "./middleware/accessApiCheck";

dotenv.config();

const app = express();
app.use(cors());
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
app.use("/api", checkAccess,proxyMiddleware);

// Handle WebSocket Upgrade
server.on("upgrade", proxyMiddleware.upgrade);

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
