import * as nodemailer from "nodemailer";

export const sendEmailService = async ({ to, subject, html, attachments }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
    // tls: { rejectUnauthorized: false },
  });

  const info = await transporter.sendMail({
    from: `Jop Search <${process.env.SMTP_USERNAME}>`,
    to,
    subject,
    html,
    attachments,
  });

  return info;
};
