import express from "express";
import { createUser, deleteUser, updateUser, getUsers } from "../controllers/userControllers";

const router = express.Router();

router.post("/", createUser);
router.get("/", getUsers);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;

 