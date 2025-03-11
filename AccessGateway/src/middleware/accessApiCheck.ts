import { Request, Response, NextFunction } from "express";
import System, { Service } from "../schema/system";
import routes from "./routes";

// ✅ Middleware to check access
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

    if (!system) {
      res.status(401).send({ message: "API key is Unauthorized" });
      return;
    }

    // Check if the API key has expired
    const date = new Date();
    if (system.expiryDate && date > system.expiryDate) {
      res.status(401).send({ message: "The API key has expired" });
      return;
    }

    req.body.services = system.services;

    // ✅ Extracting service from query parameters
    const service = req.query.service as Service;
    console.log({ service, system });
    if (!service || !system.services.includes(service)) {
      
      res.status(401).send({ message: "You are not authorized for this service" });
    }

    // ✅ Extracting route from URL
    const urlPath = req.path; // Extracts only the pathname (e.g., `/api/user/register`)

    console.log(`Checking route access for: ${service}, Path: ${urlPath}`);

    // ✅ Validate if the requested route is allowed for the given service
    const allowedRoutes = routes.get(service);
    if (allowedRoutes && allowedRoutes.some((route) => urlPath.startsWith(route))) {
      req.body.systemId = system._id;
      req.body.service = service;
      next();
    } else {
      res.status(401).send({ message: "Route not found or unauthorized access" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error: unsupported operation" });
  }
};
