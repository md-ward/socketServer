import { Document, model, Schema } from "mongoose";
import { Chat } from "./chatSchema";

export interface Message extends Document {
  senderId: string;
  receiverId: string;
  message: string;
  chat?: Chat["_id"];
}

const messageSchema = new Schema<Message>(
  {
    senderId: {
      type: String,
      required: true,
    },
    receiverId: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    chat: {
      type: [Schema.Types.ObjectId],
      ref: "Chats",
      required: true, // Making it required
      index: true, // Indexing for faster queries
    },
  },
  { timestamps: true }
);

export const Message = model<Message>("Message", messageSchema);
