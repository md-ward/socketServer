import { Request, Response } from "express";
import Stock from "../schema/stock.schema";

export async function createStock(req: Request, res: Response): Promise<void> {
  try {
    const newStock = await Stock.create(req.body);
    res
      .status(201)
      .json({ message: "Stock created successfully", stock: newStock });
  } catch (error) {
    console.error("Error creating stock:", error);
    res
      .status(500)
      .json({ message: "Failed to create stock", error: (error as Error).message });
  }
}

export async function readStocks(req: Request, res: Response): Promise<void> {
  try {
    const stocks = await Stock.find();
    res.status(200).json(stocks);
  } catch (error) {
    console.error("Error reading stocks:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch stocks", error: (error as Error).message });
  }
}

export async function readStock(req: Request, res: Response): Promise<void> {
  try {
    const stock = await Stock.findById(req.params.id);
    if (!stock) {
      res.status(404).json({ message: "Stock not found" });
    }
    res.status(200).json(stock);
  } catch (error) {
    console.error(`Error fetching stock with ID ${req.params.id}:`, error);
    res
      .status(500)
      .json({ message: "Failed to fetch stock", error: (error as Error).message });
  }
}

export async function updateStock(req: Request, res: Response): Promise<void> {
  try {
    const updatedStock = await Stock.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedStock) {
      res.status(404).json({ message: "Stock not found" });
    }
    res
      .status(200)
      .json({ message: "Stock updated successfully", stock: updatedStock });
  } catch (error) {
    console.error(`Error updating stock with ID ${req.params.id}:`, error);
    res
      .status(500)
      .json({ message: "Failed to update stock", error: (error as Error).message });
  }
}

export async function deleteStock(req: Request, res: Response): Promise<void> {
  try {
    const deletedStock = await Stock.findByIdAndDelete(req.params.id);
    if (!deletedStock) {
      res.status(404).json({ message: "Stock not found" });
    }
    res.status(200).json({ message: "Stock deleted successfully" });
  } catch (error) {
    console.error(`Error deleting stock with ID ${req.params.id}:`, error);
    res
      .status(500)
      .json({ message: "Failed to delete stock", error: (error as Error).message });
  }
}

export async function searchStocks(req: Request, res: Response): Promise<void> {
  try {
    const stocks = await Stock.find({
      $text: { $search: req.query.q as string },
    });
    res.status(200).json(stocks);
  } catch (error) {
    console.error(`Error searching stocks with query "${req.query.q}":`, error);
    res
      .status(500)
      .json({ message: "Failed to search stocks", error: (error as Error).message });
  }
}
