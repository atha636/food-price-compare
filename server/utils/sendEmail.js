const nodemailer = require("nodemailer");

const sendVerificationEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS   // Must be an App Password, NOT your Gmail password
    }
  });

  const verifyLink = `${process.env.FRONTEND_URL}/verify/${token}`;

  await transporter.sendMail({
    from: `"PriceCompare" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your PriceCompare account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #1d4ed8;">Welcome to PriceCompare 🎉</h2>
        <p>Click the button below to verify your email and activate your account:</p>
        <a href="${verifyLink}" 
           style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; 
                  text-decoration: none; border-radius: 8px; font-weight: bold; margin: 16px 0;">
          Verify My Email
        </a>
        <p style="color: #64748b; font-size: 13px;">
          Or copy this link: <br/>
          <a href="${verifyLink}">${verifyLink}</a>
        </p>
        <p style="color: #94a3b8; font-size: 12px;">This link expires in 24 hours. If you didn't sign up, ignore this email.</p>
      </div>
    `
  });
};

module.exports = sendVerificationEmail;