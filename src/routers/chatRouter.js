import { Router } from "express";
import { chatHistory } from "../controllers/chat.controller.js";
import protect from "../middlewares/protect.js";

const chatRouter = Router();

chatRouter.route("/:receiverId").get(protect, chatHistory);

export default chatRouter;
