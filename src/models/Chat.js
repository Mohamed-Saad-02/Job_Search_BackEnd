import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Sender id is required"],
    },
    receiverId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Receiver id is required"],
    },
    messages: [
      {
        message: { type: String, required: true },
        senderId: {
          type: mongoose.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.chatSchema || mongoose.model("Chat", chatSchema);
