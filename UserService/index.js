const express = require('express');
const mongoose = require('mongoose');
const dotnev = require('dotenv');

dotnev.config();
const app = express();
app.use(express.json());


// connect mongodb
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('User Service DB Connected'))
.catch(err => console.log(err));

// Routes
app.get('/', (req, res) => res.send ('User Service Running'));

// Start Server
const PORT = process.env.PORT || 5001;