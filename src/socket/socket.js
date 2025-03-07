import { sendMessageService } from "../services/chat.service.js";
import { protect } from "./utils/helper.js";

export const usersSocket = new Map();

export const establishIoConnection = (io) => {
  io.on("connection", async (socket) => {
    const token = socket.handshake.auth.token || "";

    try {
      const user = await protect(token);
      // Save userId on join
      socket.on("join", () => {
        usersSocket.set(user._id.toString(), socket.id);

        console.log(user.username, "connected");
      });

      // Handle message
      await sendMessageService(socket);
      // Handle disconnect
      socket.on("disconnect", () => {
        console.log("a user disconnected");
      });
    } catch (error) {
      console.log(error.message);

      socket.emit("error", error.message);
      socket.disconnect();
      return;
    }
  });
};
