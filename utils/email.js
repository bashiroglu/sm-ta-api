const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.GMAIL,
      pass: process.env.GMAIL_PASSWORD,
    },
  });
  const mailOptions = {
    from: options.from,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
};
module.exports = sendEmail;
