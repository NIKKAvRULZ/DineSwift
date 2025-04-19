const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent:", result.response);
  } catch (err) {
    console.error("Error sending email:", err.message);
    throw err;
  }
};

module.exports = { sendEmail };
