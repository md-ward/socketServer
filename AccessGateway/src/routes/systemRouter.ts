import { Router } from "express";
import { createSystem, getSystem, updateSystem } from "../controllers/systemController";

const systemRouter = Router();
systemRouter.post("/", createSystem);
systemRouter.get("/:id", getSystem);
systemRouter.put("/:id", updateSystem);

export default systemRouter;
