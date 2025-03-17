const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Define microservices
const SERVICES = {
    userService: process.env.USER_SERVICE_URL || "http://localhost:5001",
    restaurantService: process.env.RESTAURANT_SERVICE_URL || "http://localhost:5002",
    orderService: process.env.ORDER_SERVICE_URL || "http://localhost:5003",
    deliveryService: process.env.DELIVERY_SERVICE_URL || "http://localhost:5004",
    paymentService: process.env.PAYMENT_SERVICE_URL || "http://localhost:5005",
    notificationService: process.env.NOTIFICATION_SERVICE_URL || "http://localhost:5006",
};

// API Gateway Routes
app.use("/api/auth", createProxyMiddleware({ target: SERVICES.userService, changeOrigin: true }));
app.use("/api/restaurants", createProxyMiddleware({ target: SERVICES.restaurantService, changeOrigin: true }));
app.use("/api/orders", createProxyMiddleware({ target: SERVICES.orderService, changeOrigin: true }));
app.use("/api/delivery", createProxyMiddleware({ target: SERVICES.deliveryService, changeOrigin: true }));
app.use("/api/payment", createProxyMiddleware({ target: SERVICES.paymentService, changeOrigin: true }));
app.use("/api/notifications", createProxyMiddleware({ target: SERVICES.notificationService, changeOrigin: true }));

// Gateway Health Check
app.get("/", (req, res) => {
    res.json({ message: "API Gateway is Running!" });
});

// Start API Gateway
const PORT = process.env.GATEWAY_PORT || 5000;
app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});
