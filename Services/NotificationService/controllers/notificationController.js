const { sendEmail } = require("../services/emailService");
const { sendSMS } = require("../services/smsService");

const sendNotification = async (req, res) => {
  const { type, to, subject, message } = req.body;

  try {
    if (type === "email") {
      await sendEmail(to, subject, message);
    } else if (type === "sms") {
      await sendSMS(to, message);
    } else {
      return res.status(400).json({ success: false, message: "Invalid notification type" });
    }

    res.status(200).json({ success: true, message: "Notification sent successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { sendNotification };
