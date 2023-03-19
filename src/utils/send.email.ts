const nodemailer = require('nodemailer');

/**
 * Sending email
 * @param {string} to
 * @param {string} subject
 * @param {string} html
 */
export const smtpEmail = async (
    to: String,
    subject: String,
    html: String,
) => {
  const from = process.env.SMTP_EMAIL_USERNAME;

  const smtpOptions = {
    host: process.env.SMTP_EMAIL_HOST,
    port: process.env.SMTP_EMAIL_PORT,
    auth: {
      user: process.env.SMTP_EMAIL_USERNAME,
      pass: process.env.SMTP_EMAIL_PASSWORD,
    },
  };

  const transporter = nodemailer.createTransport(smtpOptions);
  await transporter.sendMail({from, to, subject, html});
};
