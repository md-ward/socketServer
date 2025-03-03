import { Chat } from "../schema/chatSchema";
import { Message } from "../schema/messageSchema";
import { System } from "../schema/systemSchema";

export const creatChat = async (chat: Chat): Promise<void> => {
  try {
    const newchat = await new Chat(chat);
    const system = await System.findById(chat.system);

    // Add the new chat to the system's chats array
    system?.chats.push(newchat._id);

    // Use Promise.all to handle saving both the system and newchat concurrently
    await Promise.all([
      newchat.save(), // Save newchat data
      system?.save(), // Save system data (if system exists)
    ]);
  } catch (error) {
    // Handle the error (you can log it or take other actions)
    console.error("Error during saving chat or system:", error);
  }
};

// Send a new message
export const sendMessage = async (
  message: Message,
  apiKey: string,
  system: System["_id"]
): Promise<Message | Error> => {
  try {
    console.log(message);

    let chat = await Chat.findOne({
      system: system,
      Participants: { $all: [message.senderId, message.receiverId] },
    });

    if (!chat) {
      const chatData = {
        system: system,
        Participants: [message.senderId, message.receiverId],
        chatType: "single",
        messages: [],
      };
      chat = await Chat.create(chatData); // Save it to the database
      await chat.save();
    }
    if (chat) {
      const newmessage = new Message({
        senderId: message.senderId,
        receiverId: message.receiverId,
        message: message.message,
        chat: chat._id,
      });
      await newmessage.save();

      chat.messages.push(newmessage._id);
      await chat.save();

      return newmessage;
    } else throw new Error();
    return message;
  } catch (error) {
    console.error("Error in sendMessage:", error);
    return new Error("Failed to send message");
  }
};
