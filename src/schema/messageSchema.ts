import { Document, model, Schema } from "mongoose";
import { Chat } from "./chatSchema";
import { User } from "./userSchema";

export interface Message extends Document {
  senderId: String;
  receiverId: String;
  message: string;
  chat: Chat["_id"];
}

const messageSchema = new Schema<Message>(
  {
    senderId: {
      type: String,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: String,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    chat: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true, // Making it required
      index: true, // Indexing for faster queries
    },
  },
  { timestamps: true }
);

export const Message = model<Message>("Message", messageSchema);
