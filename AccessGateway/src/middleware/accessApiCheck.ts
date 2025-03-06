import { Request, Response, NextFunction } from "express";
import System from "../schema/system";

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
      console.log(req.url);

      next();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};
