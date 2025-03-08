import { Chat } from "../schema/chatSchema";
import { Message } from "../schema/messageSchema";

export const createChat = async (chat: Chat): Promise<void> => {
  try {
    const newChat = new Chat(chat);
    await newChat.save();
  } catch (error) {
    // Handle the error (you can log it or take other actions)
    console.error("Error during saving chat or system:", error);
  }
};

// Send a new message
export const sendMessage = async (
  message: Message
): Promise<Message | Error> => {
  try {
    console.log(message);

    let chat = await Chat.findOne({
      Participants: { $all: [message.senderId, message.receiverId] },
    });

    if (!chat) {
      const chatData = {
        Participants: [message.senderId, message.receiverId],
        chatType: "single",
        messages: [],
        systemId: message.systemId,
      };
      chat = await Chat.create(chatData); // Save it to the database
      await chat.save();
    }
    if (chat) {
      const newMessage = new Message({
        systemId: message.systemId,
        senderId: message.senderId,
        receiverId: message.receiverId,
        message: message.message,
        chat: chat._id,
      });
      await newMessage.save();

      chat.messages.push(newMessage._id);
      await chat.save();

      return newMessage;
    } else throw new Error();
  } catch (error) {
    console.error("Error in sendMessage:", error);
    return new Error("Failed to send message");
  }
};
