const express = require('express');
const dotnev = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require("./routes/authRoutes");

dotnev.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

// Connect to MongoDB
connectDB();

// Routes
app.get('/', (req, res) => res.send ('User Service Running'));

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`User Service running on port ${PORT}`));