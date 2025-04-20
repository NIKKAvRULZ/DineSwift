console.log("Loaded from .env:", require('dotenv').config());
const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const notificationRoutes = require("./routes/notificationRoutes");

dotenv.config();

const app = express();
app.use(express.json());

// Routes
app.use("/api/notifications", notificationRoutes);

// DB Connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Start server
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`NotificationService running on port ${PORT}`);
});
