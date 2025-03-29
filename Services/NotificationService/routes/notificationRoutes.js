const express = require("express");
const { sendEmail, sendSMS } = require("../controllers/notificationController");

const router = express.Router();

// Send email notification
router.post("/email", async (req, res) => {
  const { to, subject, text } = req.body;

  try {
    await sendEmail(to, subject, text);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send email", error: error.message });
  }
});

// Send SMS notification
router.post("/sms", async (req, res) => {
  const { to, body } = req.body;

  try {
    await sendSMS(to, body);
    res.status(200).json({ message: "SMS sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send SMS", error: error.message });
  }
});

module.exports = router;
