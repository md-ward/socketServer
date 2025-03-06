import { Router } from "express";
import {
  createSystem,
  extendApiKey,
  getSystem,
} from "../controllers/systemController";
import { checkAccess } from "../middleware/accessApiCheck";

const systemRouter = Router();
systemRouter.post("/", createSystem);
systemRouter.get("/", checkAccess, getSystem);
systemRouter.put("/",extendApiKey);

export default systemRouter;
