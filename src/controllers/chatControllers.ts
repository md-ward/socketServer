import { Request, Response } from "express";
import { Chat } from "../schema/chatSchema";
import { Message } from "../schema/messageSchema";
//najib first push

export interface req {
  body: {
    senderId: string;
    receiverId: string;
    messageData: String;
    key?: string; // Optional key
  };
}

// Create a new chat
export const createChat = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const chat = new Chat(req.body);
    await chat.save();
    res.status(201).json(chat);
  } catch (error: Error | any) {
    res.status(400).json({ message: error.message });
  }
};

// Get messages for a chat
export const getMessages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("senderId")
      .populate("receiverId");
    res.status(200).json(messages);
  } catch (error: Error | any) {
    res.status(400).json({ message: error.message });
  }
};

// Send a new message
export const sendMessage = async (req: Request): Promise<Message | Error> => {
  try {
    const { senderId, receiverId, messageData, key } = req.body;

    // Determine identifier based on request origin (external system vs. internal user)
    const identifier = key.e
      ? `${senderId}${key}${receiverId}${key}`
      : `${senderId}${receiverId}`;

    // Check if chat already exists
    let chat = await Chat.findOne({
      $or: [
        { identifier },
        {
          identifier: key
            ? `${receiverId}${key}${senderId}${key}`
            : `${receiverId}${senderId}`,
        },
      ],
    });

    // Create a new chat if it doesn't exist
    if (!chat) {
      chat = new Chat({
        users: [senderId, receiverId],
        chatType: "single",
        identifier, // Corrected typo (previously "identefier")
      });
      await chat.save();
    }

    // Create and save the message
    const messageObj = new Message({
      senderId,
      receiverId,
      messageData,
      chat: chat._id,
    });

    await messageObj.save();
    return messageObj;
  } catch (error) {
    console.error("Error in sendMessage:", error);
    return new Error("Failed to send message");
  }
};

// Check if a chat exists between the two users
//befor sendig the user ID chack the request if it is from a externel system or internel user
//externel system => sendrID+systemKey,ReciverID+systemKey {type : String}!!!
//internel user => Sender tag,reciver tag {type : String}!!!
