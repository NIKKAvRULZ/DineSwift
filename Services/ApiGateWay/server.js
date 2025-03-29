const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Service URLs
const SERVICES = {
  USER_SERVICE: 'http://localhost:3001',
  RESTAURANT_SERVICE: 'http://localhost:3002',
  ORDER_SERVICE: 'http://localhost:3003',
  PAYMENT_SERVICE: 'http://localhost:3004',
  DELIVERY_SERVICE: 'http://localhost:3005',
  NOTIFICATION_SERVICE: 'http://localhost:3006'
};

// Route definitions
app.use('/api/users', createProxyMiddleware({
  target: SERVICES.USER_SERVICE,
  changeOrigin: true,
  pathRewrite: {'^/api/users': '/users'}
}));

app.use('/api/restaurants', createProxyMiddleware({
  target: SERVICES.RESTAURANT_SERVICE,
  changeOrigin: true,
  pathRewrite: {'^/api/restaurants': '/restaurants'}
}));

app.use('/api/orders', createProxyMiddleware({
  target: SERVICES.ORDER_SERVICE,
  changeOrigin: true,
  pathRewrite: {'^/api/orders': '/orders'}
}));

app.use('/api/payments', createProxyMiddleware({
  target: SERVICES.PAYMENT_SERVICE,
  changeOrigin: true,
  pathRewrite: {'^/api/payments': '/payments'}
}));

app.use('/api/delivery', createProxyMiddleware({
  target: SERVICES.DELIVERY_SERVICE,
  changeOrigin: true,
  pathRewrite: {'^/api/delivery': '/delivery'}
}));

app.use('/api/notifications', createProxyMiddleware({
  target: SERVICES.NOTIFICATION_SERVICE,
  changeOrigin: true,
  pathRewrite: {'^/api/notifications': '/notifications'}
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
}); 