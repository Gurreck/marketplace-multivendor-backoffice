const nodemailer = require("nodemailer");

const sendEmail = async ({ email, subject, html }) => {
  console.log("📧 EMAIL_USER:", process.env.EMAIL_USER);
  console.log("📧 EMAIL_PASS existe:", !!process.env.EMAIL_PASS);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  console.log("📨 Enviando correo a:", email);

  const info = await transporter.sendMail({
    from: `"Marketplace" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html,
  });

  console.log("✅ Correo enviado. Message ID:", info.messageId);
};

module.exports = sendEmail;