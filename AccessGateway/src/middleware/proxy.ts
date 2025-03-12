import { createProxyMiddleware } from "http-proxy-middleware";
import http from "http";
import net from "net";
import { Request, Response } from "express";

const servicesLinks = {
  chatting: "http://localhost:8002",
  // attachments: "http://localhost:8003",
  drive: "http://localhost:8003",
};

// Define CustomRequest interface
interface CustomRequest extends Request {
  body: {
    service?: keyof typeof servicesLinks;
  };
}

// Proxy middleware function
function proxyMiddleware(
  req: CustomRequest,
  res: Response
  // next: NextFunction
) {
  if (!req.body || !req.body.service) {
    res.status(400).json({ error: "Request body is missing or invalid" });
  }
  console.log(req.body);

  const service = req.body.service as keyof typeof servicesLinks;
  const proxy = createProxyMiddleware({
    target: servicesLinks[service],
    changeOrigin: true,
    ws: true, // Enable WebSocket support
    pathRewrite: {
      "^/api": "", // Rewrite /api/user -> /user
    },
    on: {
      error: (error: Error) => console.error("Proxy Error:", error),
      proxyReq: (proxyReq, req) => {
        console.log("Proxying request to:", servicesLinks[service]);
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

  proxy(req, res);
  // res.send("Proxying request to " + servicesLinks[service]);
}

// WebSocket Upgrade Handling
function handleWebSocketUpgrade(
  req: http.IncomingMessage,
  socket: net.Socket,
  head: Buffer
) {
  if (!(req as CustomRequest).body || !(req as CustomRequest).body?.service) {
    socket.destroy();
    return;
  }

  const service = (req as CustomRequest).body?.service;
  if (!service) {
    socket.destroy();
    return;
  }
  const proxy = createProxyMiddleware({
    target: servicesLinks[service],
    ws: true,
  });

  return proxy.upgrade(req, socket, head);
}

export { proxyMiddleware, handleWebSocketUpgrade };
