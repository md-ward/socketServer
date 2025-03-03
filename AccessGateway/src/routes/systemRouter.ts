import { Router } from "express";
import {
  createSystem,
  getSystem,
  updateSystem,
} from "../controllers/systemController";
import { checkAccess } from "../middleware/accessApiCheck";

const systemRouter = Router();
systemRouter.post("/", createSystem);
systemRouter.get("/", checkAccess, getSystem);
systemRouter.put("/:id", updateSystem);

export default systemRouter;
