import { Request, Response } from "express";
import System, { Service } from "../schema/system";
import generateExpiryDate from "../utils/apiExpiry";


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
    console.log(validServices);
    
    if (
      !services.every((service: Service) => validServices.includes(service))
    ) {
      res.status(400).json({ message: "Invalid services provided." });
      return;
    }

    // Generate API Key
    const generatedKey = crypto
      .getRandomValues(new Uint32Array(1))[0]
      .toString(16);

    const system = new System({
      name,
      services,
      apiKey: generatedKey,
      expiryDate: generateExpiryDate.oneMonth(),
    });

    await system.save();
    res.status(201).json(system);
  } catch (error) { 
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Update System
export const extendApiKey = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const apiKey = req.headers.authorization;

    if (!apiKey) {
      res.status(400).json({ message: "API key is required for updating." });
      return;
    }

    const system = await System.findOneAndUpdate(
      { apiKey },
      { 
        expiryDate: generateExpiryDate.oneMonth(),
      },
      {
        new: true,
      }
    );

    if (!system) {
      res.status(404).json({ message: "System not found." });
      return;
    }

    res.status(200).send({
      message: `API key Extended successfully till : ${system.expiryDate} `,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Get System by API Key
export const getSystem = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log(req.body.systemId);

    res
      .status(200)
      .send({ message: "System found.", systemId: req.body.systemId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};
