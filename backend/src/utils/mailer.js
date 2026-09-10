import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

export const isMailerConfigured = !!(env.gmailUser && env.gmailAppPassword);

let transporter = null;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: env.gmailUser, pass: env.gmailAppPassword },
    });
  }
  return transporter;
}

export async function sendMail({ to, subject, text }) {
  if (!isMailerConfigured) return false;
  await getTransporter().sendMail({
    from: `iCollege <${env.gmailUser}>`,
    to,
    subject,
    text,
  });
  return true;
}
