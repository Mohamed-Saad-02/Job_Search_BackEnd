import { CronJob } from "cron";
import User from "../models/User.js";

const job = new CronJob(
  "0 */6 * * *",
  async function () {
    try {
      const count = await User.updateMany(
        { "OTP.expiresIn": { $lt: new Date() } },
        { $pull: { OTP: { expiresIn: { $lt: new Date() } } } }
      );
      console.log(
        `${count.modifiedCount} expired OTP codes have been deleted.`
      );
    } catch (error) {
      console.error("Error deleting expired OTP codes:", error);
    }
  },
  null,
  true,
  "Africa/Cairo"
);

job.start();
