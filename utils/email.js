const nodemailer = require("nodemailer");
const htmlToText = require("html-to-text");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name;
    this.url = url;
    this.from = `${process.env.COMPANY_NAME} <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV.trim() === "production") {
      return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Send the actual email
  async send(template, subject) {
    // TODO: Add html tempalate renderer

    // const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
    //   firstName: this.firstName,
    //   url: this.url,
    //   subject,
    // });

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: this.url,
      // html,
      // text: htmlToText.fromString(html),
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    // TODO: Create welcome html tempalate
    await this.send(
      "welcome",
      `Welcome to the ${process.env.COMPANY_NAME} Family!`
    );
  }

  async sendPasswordReset() {
    // TODO: Create password reset html tempalate
    await this.send(
      "passwordReset",
      "Your password reset token (valid for only 10 minutes)"
    );
  }
};
