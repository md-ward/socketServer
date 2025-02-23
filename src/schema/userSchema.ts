import { Document, model, Schema } from "mongoose";
import { Chat } from "./chatSchema";
import { Message } from "./messageSchema";

export interface User extends Document {
  name: string;
  identifier: string;
  chats: Chat["_id"][];
  messages: Message["_id"][];
}

const userSchema = new Schema<User>(
  {
    name: {
      type: String,
      required: true,
    },
    identifier: {
      type: String,
      required: true,
      unique: true, // Ensuring uniqueness
      index: true,  // Indexing for faster lookups
    },
    chats: [
      {
        type: Schema.Types.ObjectId,
        ref: "Chat",
      },
    ],
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const User = model<User>("User", userSchema);
