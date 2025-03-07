import { chatHistoryService } from "../services/chat.service.js";
import catchAsync from "../utils/catchAsync.js";

export const chatHistory = catchAsync(async (req, res) => {
  const { user } = req;
  const { receiverId } = req.params;

  const chat = await chatHistoryService(user, receiverId);

  res.status(200).json({
    status: "success",
    data: { chat },
  });
});
