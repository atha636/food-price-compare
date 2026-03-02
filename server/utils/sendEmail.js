const nodemailer = require("nodemailer");

const sendVerificationEmail = async (to, link) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Food Compare" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Verify your email",
      html: `
        <h2>Email Verification</h2>
        <p>Click below to verify your account:</p>
        <a href="${link}" target="_blank">Verify Email</a>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log("✅ Email sent to:", to);

  } catch (err) {
    console.error("❌ Email send error:", err);
  }
};

module.exports = sendVerificationEmail;