const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendVerificationEmail = async (to, link) => {
  const msg = {
    to,
    from: process.env.EMAIL_USER, // must be verified in SendGrid
    subject: "Verify your email",
    html: `
      <h2>Email Verification</h2>
      <p>Click below to verify your account:</p>
      <a href="${link}">Verify Email</a>
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