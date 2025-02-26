import { Request, Response } from "express";
import { Chat } from "../schema/chatSchema";
import { Message } from "../schema/messageSchema";

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
export const sendMessage = async (
  senderId: string,
  receiverId: string,
  message: string
): Promise<Message | Error> => {
  try {
    // Check if a chat exists between the two users
    let chat = await Chat.findOne({
      users: { $all: [senderId, receiverId] },
      chatType: "single",
    });

    // If no chat exists, create a new one
    if (!chat) {
      chat = new Chat({
        users: [senderId, receiverId],
        chatType: "single",
      });
      await chat.save();
    }

    // Create and save the message
    const messageObj = new Message({
      senderId,
      receiverId,
      message,
      chat: chat._id,
    });
    await messageObj.save();

    return messageObj;
  } catch (error: Error | any) {
    return error;
  }
};
