import express from "express";
import {
  createSystem,
  deleteUser,
  updateUser,
  getUsers,
} from "../controllers/userControllers";

const userRouter = express.Router();

userRouter.post("/", createSystem);
userRouter.get("/", getUsers);
userRouter.put("/:id", updateUser);
userRouter.delete("/:id", deleteUser);

export default userRouter;
