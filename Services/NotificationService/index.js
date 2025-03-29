const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const notificationRoutes = require("./routes/notificationRoutes");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/notifications", notificationRoutes);

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`NotificationService running on port ${PORT}`));
