import nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

// You can define a type for the email options if needed
type EmailOptions = {
  to: string;
  subject: string;
  htmlContent?: string;
  textContent?: string;
};

export const sendEmail = async ({
  to,
  subject,
  htmlContent,
  textContent
}: EmailOptions): Promise<void> => {
  console.log({
    to,
    subject,
    htmlContent,
    textContent
  });
  let transporter: Transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_API_KEY, // API KEY of a mailing service, or username of a personal email
      pass: process.env.EMAIL_SECRET_KEY // SECRET KEY of a mailing service, or password of a personal email
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM, // sender address
    to: to, // list of receivers
    subject: subject,
    html: htmlContent, // HTML body content
    text: textContent ?? ''
  });
};
