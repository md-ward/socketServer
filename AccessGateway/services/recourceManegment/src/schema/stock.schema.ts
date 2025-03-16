import { Document, model, Schema } from "mongoose";

// Define the Stock interface
interface Stock extends Document {
  productName: string;
  quantity: number;
  price: number;
  discount?: number;
  supplier?: string;
  category: string;
  width?: number;
  hight?: number;
  depth?: number;
  images: string[];
  company: string;
}

// Define the Stock schema
const stockSchema = new Schema<Stock>(
  {
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    discount: { type: Number },
    supplier: { type: String },
    category: { type: String, required: true },
    width: { type: Number },
    hight: { type: Number },
    depth: { type: Number },
    images: { type: [String], required: true },
    company: { type: String, required: true },
  },
  { timestamps: true, statics: {} }
);
 const Stock = model<Stock>("Stock", stockSchema);
// Export the Stock model
export  default Stock;
