import nodemailer from "nodemailer";
import { createContactEmailTemplate } from "./emailTemplates.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendContactMail = async ({
  firstName,
  lastName,
  email,
  subject,
  message,
}) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    replyTo: email,
    subject: `Portfolio Contact: ${subject}`,
    html: createContactEmailTemplate({
      firstName,
      lastName,
      email,
      subject,
      message,
    }),
  });
};
