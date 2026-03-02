const nodemailer = require("nodemailer");

const sendVerificationEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const verifyLink = `${process.env.FRONTEND_URL}/verify/${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify your account",
    html: `
      <h2>Verify your account</h2>
      <p>Click below to activate your account:</p>
      <a href="${verifyLink}">Verify Now</a>
    `
  });
};

module.exports = sendVerificationEmail;