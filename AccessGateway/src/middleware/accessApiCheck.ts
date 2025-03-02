import next, { Request, Response } from "express";
import System from "../schema/system";

// Check Access
export const checkAccess = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { apiKey } = req.body;

    if (!apiKey) {
      res.status(400).json({ message: "API key is required." });
      return;
    }

    const system = await System.findOne({ apiKey });
    if (!system) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};
