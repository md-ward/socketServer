
// import cryptoRandomString from "crypto-random-string";
import { Request, Response } from "express";
import System from "../schema/system";

// Allowed services based on the enum
enum Service {
  chatting = "chatting",
  attachments = "attachments",
}

// Create System
export const createSystem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, services } = req.body;

    if (!name || !Array.isArray(services) || services.length === 0) {
      res
        .status(400)
        .json({ message: "Invalid input: name and services are required." });
      return;
    }

    // Validate services
    const validServices = Object.values(Service);
    if (
      !services.every((service: Service) => validServices.includes(service))
    ) {
      res.status(400).json({ message: "Invalid services provided." });
      return;
    }

    // Generate API Key
    // const generatedKey = cryptoRandomString({
    //   length: 32,
    //   type: "alphanumeric",
    // });

    const system = new System({
      name,
      services,
      apiKey: 'generatedKey',
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), // 1-year expiry
    });

    await system.save();
    res.status(201).json(system);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Update System
export const updateSystem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { apiKey } = req.body;

    if (!apiKey) {
      res.status(400).json({ message: "API key is required for updating." });
      return;
    }

    const system = await System.findOneAndUpdate({ apiKey }, req.body, {
      new: true,
    });

    if (!system) {
      res.status(404).json({ message: "System not found." });
      return;
    }

    res.status(200).json(system);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Get System by API Key
export const getSystem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { apiKey } = req.query;

    if (!apiKey) {
      res.status(400).json({ message: "API key is required." });
      return;
    }

    const system = await System.findOne({ apiKey });

    if (!system) {
      res.status(404).json({ message: "System not found." });
      return;
    }

    res.status(200).json(system);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};
