import express from "express";
import {
  createSystem,
  deleteUser,
  updateUser,
  getUsers,
} from "../controllers/userControllers";

const router = express.Router();

router.post("/", createSystem);
router.get("/", getUsers);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
