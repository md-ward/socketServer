import { Request, Response } from "express";
import { System } from "../schema/systemSchema";

export const createSystem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = new System(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = await System.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = await System.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('request body',req.body);

    const users = await System.find();
    res.status(200).send(users);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
