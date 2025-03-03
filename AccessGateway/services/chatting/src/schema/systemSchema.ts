import { Document, model, Schema } from "mongoose";
import { Chat } from "./chatSchema";

//app schema
export interface System extends Document {
  identifier: string;
  chats: Chat["_id"][];
  apiKey: string;
}

const systemSchema = new Schema<System>(
  {
    identifier: {
      type: Schema.Types.String,
      required: true,
      unique: true, // Ensuring uniqueness
      index: true, // Indexing for faster lookups
    },
    chats: [
      {
        type: Schema.Types.ObjectId,
        ref: "Chat",
      },
    ],
    apiKey: {
      type: Schema.Types.String,
      required: false,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

export const System = model<System>("System", systemSchema);
