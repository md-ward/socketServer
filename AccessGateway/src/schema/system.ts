import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";
// Enum for allowed services
export enum Service {
  CHATTING = "chatting",
  ATTACHMENTS = "attachments",
  DRIVE = "drive",
}

// Define the interface for TypeScript
interface ISystem extends Document { 
  name: string;
  services: Service[];
  apiKey: string;
  expiryDate?: Date;
  validateApiKey(candidateKey: string): Promise<boolean>;
}

// Define the Mongoose Schema
const SystemSchema = new Schema<ISystem>({
  name: { type: String, required: true },
  services: {
    type: [String], // Store services as an array of strings
    enum: Object.values(Service), // Enforce enum values
    required: true,
  },
  apiKey: { type: String, required: true, unique: true }, // Unique API key
  expiryDate: { type: Date }, // Optional expiry
});

// Hash API key before saving
SystemSchema.pre("save", async function (next) {
  if (this.isModified("apiKey")) {
    const salt = await bcrypt.genSalt(10);
    this.apiKey = await bcrypt.hash(this.apiKey, salt);
  }
  next();
});

// Method to validate API key
SystemSchema.methods.validateApiKey = async function (candidateKey: string) {
  return await bcrypt.compare(candidateKey, this.apiKey);
};

// Create the Mongoose model
const System = mongoose.model<ISystem>("System", SystemSchema);
export default System;
