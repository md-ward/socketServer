import { Request, Response, NextFunction } from "express";
import System, { Service } from "../schema/system";
import routes from "./routes";
import { IncomingMessage } from "http";
// Check Access
export const checkAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const apiKey = req.headers["authorization"];

    if (!apiKey) {
      res.status(400).send({ message: "API key is required." });
      return;
    }

    const system = await System.findOne({ apiKey });

    const date = new Date();
    if (system) {
      if (system.expiryDate && date > system.expiryDate) {
        res.status(401).send({ message: "The API key has expired" });
      }
    }
    if (!system) {
      res.status(401).send({ message: "Api key is Unauthorized" });
    } else {
      req.body.services = system.services;
      const splittedURl = req.url.split("?");
      const [, service] = splittedURl[1].split("=");

      if (
        system.services.includes(req.query.service as Service) &&
        routes.get(service)?.includes(splittedURl[0])
      ) {
        req.body.systemId = system._id;

        next();
      } else if (
        system.services.includes(req.query.service as Service) &&
        !routes.get(service)?.includes(splittedURl[0])
      ) {
        res.status(401).send({ message: "Rout not found" });
      } else {
        res
          .status(401)
          .send({ message: "You are not authorized to reach this rout" });
      }
    }
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({ message: "Server error unsupported operation" });
  }
};

// ✅ Middleware for WebSocket Access Control
export const checkAccessSocket = async (
  req: IncomingMessage,
  socket: any,
  next: NextFunction
) => {
  try {
    const apiKey = req.headers["authorization"];
    console.log({ apiKey });

    if (!apiKey) {
      console.error("WebSocket Access Denied: Missing API key");
      return socket.disconnect(true);
    }

    const system = await System.findOne({ apiKey });

    if (!system) {
      console.error("WebSocket Access Denied: Invalid API key");
      return socket.disconnect(true);
    }

    const date = new Date();
    if (system.expiryDate && date > system.expiryDate) {
      console.error("WebSocket Access Denied: API key expired");
      return socket.disconnect(true);
    }

    // ✅ Attach systemId for tracking
    req.headers["x-system-id"] = system._id as string;
    next();
  } catch (error) {
    console.error("WebSocket Access Error:", error);
    socket.disconnect(true);
  }
};
