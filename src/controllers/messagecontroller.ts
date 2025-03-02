import { Message } from "../schema/messageSchema";
import { Chat } from "../schema/chatSchema";
export interface req {
  body: {
    userID: string;
    recipientId: string;
    message: String;
  };
}
export const createMessage = async (req: req): Promise<boolean> => {
  try {
    const { userID, recipientId, message: messageData } = req.body;
    const identefier = userID + recipientId;
    let chat = await Chat.findOne({
      $or: [
        { identefier: userID + recipientId },
        { identefier: recipientId + userID },
      ],
    });
    if (!chat) {
      chat = new Chat({
        users: [userID, recipientId],
        messages: [],
        chatType: "single",
        identefier: identefier,
      });
      await chat.save();
    }
    if (chat) {
      const message = new Message({
        senderId: userID,
        receiverId: recipientId,
        message: messageData,
        chat: chat._id,
      });
      await message.save();

      chat.messages.push(message._id);
      await chat.save();

      return true;
    } else throw new Error("");
  } catch (error) {
    console.error("Error creating message:", error);
    return false;
  }
};
