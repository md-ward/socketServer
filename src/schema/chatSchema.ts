import { Document, model, Schema } from "mongoose";
import { Message } from "./messageSchema";
import { User } from "./userSchema";

export interface Chat extends Document {
  users: String[];
  messages: Message["_id"][];
  chatType: "single" | "group";
  identifier: Number;
  Type: "Internel" | "Externel";
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
    identifier: {
      type: String,
      required: true,
    },
    Type: {
      Type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Chat = model<Chat>("Chat", chatSchema);
