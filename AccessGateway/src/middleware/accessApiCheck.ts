import { Request, Response, NextFunction } from "express";
import System from "../schema/system";

// Check Access
export const checkAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { service } = req.query;
    const apiKey = req.headers["authorization"];
    console.log(service, apiKey);

    if (!apiKey) {
      res.status(400).send({ message: "API key is required." });
      return;
    }

    const system = await System.findOne({ apiKey });

    console.log({ system });

    const date = new Date();
    if (system) {
      if (system.expiryDate && date.getDate() > system.expiryDate.getDate()) {
        res.status(401).send({ message: "The API key has expired" });
      }
    }
    if (!system) {
      res.status(401).send({ message: "Api key is Unauthorized" });
    } else {
      req.body.services = system.services;
      
      next();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};
