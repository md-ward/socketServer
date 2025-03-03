import { Document, model, Schema } from "mongoose";
import { Message } from "./messageSchema";
import { System } from "./systemSchema";

export interface Chat extends Document {
  system: System["_id"];
  messages: Message["_id"][];
  chatType: "single" | "group";
  Participants: string[] | [];
}

const chatSchema = new Schema<Chat>(
  {
    system: {
      type: [Schema.Types.ObjectId],
      ref: "System",
      required: true,
    },
    messages: {
      type: [Schema.Types.ObjectId],
      ref: "Message",
      default: [],
    },
    chatType: {
      type: Schema.Types.String,
      enum: ["single", "group"], // Only allow "single" or "group"
      required: true,
    },
    Participants: {
      type: [Schema.Types.String],
      required: true,
    },
  },
  { timestamps: true }
);

export const Chat = model<Chat>("Chat", chatSchema);
