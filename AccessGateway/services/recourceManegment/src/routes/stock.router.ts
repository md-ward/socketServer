import express, { Router } from "express";
import {
  createStock,
  deleteStock,
  readStock,
  readStocks,
  searchStocks,
  updateStock,
} from "../controllers/stock.controller";

const stockRouter: Router = express.Router();

stockRouter.post("/", createStock);
stockRouter.get("/", readStocks);
stockRouter.get("/search", searchStocks);
stockRouter.get("/:id", readStock);
stockRouter.put("/:id", updateStock);
stockRouter.delete("/:id", deleteStock);

export default stockRouter;
