import { Document, model, Schema } from "mongoose";
import { Chat } from "./chatSchema";
import { Message } from "./messageSchema";

export interface User extends Document {
  name: string;
  type: "system" | "user";
  identifier: string;
  chats: Chat["_id"][];
  messages: Message["_id"][];
  key: String;
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
      index: true, // Indexing for faster lookups
    },
    chats: [
      {
        type: Schema.Types.ObjectId,
        ref: "Chat",
      },
    ],
    type: {
      type: String,
      required: true,
    },
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
    key: {
      type: String,
      required: false,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

export const User = model<User>("User", userSchema);
