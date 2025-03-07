import Chat from "../models/Chat.js";
import { usersSocket } from "../socket/socket.js";
import { protect } from "../socket/utils/helper.js";
import AppError from "../utils/appError.js";

export const chatHistoryService = async (user, receiverId) => {
  if (!receiverId) {
    throw new AppError("Invalid receiver id", 400);
  }

  const chat = await Chat.findOne({
    $or: [
      { senderId: user._id, receiverId },
      { receiverId: user._id, senderId: receiverId },
    ],
  });

  return chat?.messages || [];
};

export const sendMessageService = (socket) => {
  return socket.on("sendMessage", async (data) => {
    const sender = await protect(socket.handshake.auth.token);

    const { receiverId, message } = data;

    if (!receiverId || !message) throw new AppError("Invalid data", 400);

    const chat = await Chat.findOne({
      $or: [
        { senderId: sender._id, receiverId },
        { receiverId: sender._id, senderId: receiverId },
      ],
    });

    if (!chat) {
      const newChat = new Chat({
        senderId: sender._id,
        receiverId,
        messages: [{ message, senderId: sender._id }],
      });
      await newChat.save();
    } else {
      chat.messages.push({ message, senderId: sender._id });
      await chat.save();
    }

    socket.emit("successMessage", { message, senderId: sender._id.toString() });

    // Emit message to receiver
    const receiverSocketId = usersSocket.get(receiverId.toString());
    if (receiverSocketId) {
      socket.to(receiverSocketId).emit("receiveMessage", {
        senderId: sender._id.toString(),
        message,
      });
    }
  });
};
