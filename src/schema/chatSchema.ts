import { Document, model, Schema } from "mongoose";
import { Message } from "./messageSchema";
import { User } from "./userSchema";

export interface Chat extends Document {
  users: User["_id"][];
  messages?: Message["_id"][];
  chatType: "single" | "group";
}

const chatSchema = new Schema<Chat>(
  {
    users: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      required: true,
    },
    messages: {
      type: [Schema.Types.ObjectId],
      ref: "Message",
    },
    chatType: {
      type: String,
      enum: ["single", "group"], // Only allow "single" or "group"
      required: true,
    },
  },
  { timestamps: true }
);

export const Chat = model<Chat>("Chat", chatSchema);
