import { Document, model, Schema } from "mongoose";
import { Message } from "./messageSchema";
import { User } from "./userSchema";

export interface Chat extends Document {
  users: String[];
  messages: Message["_id"][];
  chatType: "single" | "group";
  identefier: Number;
}

const chatSchema = new Schema<Chat>(
  {
    users: {
      type: [String],
      ref: "User",
      required: true,
    },
    messages: {
      type: [Schema.Types.ObjectId],
      ref: "Message",
      default: [],
    },
    chatType: {
      type: String,
      enum: ["single", "group"], // Only allow "single" or "group"
      required: true,
    },
    identefier: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Chat = model<Chat>("Chat", chatSchema);
