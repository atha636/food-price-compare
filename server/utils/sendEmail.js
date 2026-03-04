const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendVerificationEmail = async (to, link) => {
  const msg = {
    to: to,
   from: {
      email: process.env.EMAIL_USER,
      name: "PriceCompare"
    }, // verified sender
    subject: "Welcome to PriceCompare — Verify your account",
    html: `
      <div style="font-family: Arial, sans-serif; text-align:center; padding:20px;">
        <h2>Welcome to PriceCompare 🚀</h2>
        <p>Click the button below to verify your email address.</p>

        <a href="${link}" 
           style="
            display:inline-block;
            padding:12px 20px;
            background:#2563eb;
            color:white;
            text-decoration:none;
            border-radius:8px;
            font-weight:bold;
           ">
          Verify Email
        </a>

        <p style="margin-top:20px;font-size:12px;color:gray;">
          If you didn't create this account, you can ignore this email.
        </p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log("✅ Email sent via SendGrid");
  } catch (error) {
    console.error("❌ SendGrid Error:", error.response?.body || error);
  }
};

module.exports = sendVerificationEmail;