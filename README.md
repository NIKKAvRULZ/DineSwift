# 🍽️ DineSwift - Cloud-Native Food Ordering & Delivery System  

DineSwift is a **next-gen, cloud-native food ordering and delivery platform** inspired by **UberEats & PickMe Food**. Designed with a **scalable microservices architecture**, it offers a seamless experience for customers, restaurants, and delivery drivers. 🚀

---

## 🚀 Features at a Glance  

✅ **Intuitive Web Interface** – Easily browse restaurants, add items to cart, and place orders.  
✅ **Restaurant Dashboard** – Manage menus, update orders, and track earnings.  
✅ **Order Tracking** – Real-time status updates with GPS-enabled delivery tracking.  
✅ **AI-Powered Auto Assignment** – Smart allocation of drivers to optimize deliveries.  
✅ **Secure Payments** – Supports **PayHere, Dialog Genie, and Stripe** (Sandbox Mode).  
✅ **Instant Notifications** – Get email & SMS updates for every order status change.  

---

## 🏗️ Tech Stack  

### **Backend (Microservices)**  
- 🟢 **Node.js (Express.js)** – API Development  
- 🟢 **MongoDB** – NoSQL Database  
- 🟢 **Kafka** – Asynchronous Messaging  
- 🟢 **Docker & Kubernetes** – Containerized Services & Orchestration  

### **Frontend**  
- 🎨 **React.js** – Modern Web App UI  
- 🔄 **Axios / Fetch API** – Efficient API Calls  

### **DevOps & Deployment**  
- 🐳 **Docker** – Microservice Deployment  
- ☸️ **Kubernetes** – Scalable Service Management  
- 🛠️ **Postman** – API Testing & Debugging  

---

## 📂 Project Structure  

```
food-delivery-system/
│── services/                    # All microservices
│   │── user-service/             # User Authentication & Management Service
│   │   │── models/               # Mongoose Models
│   │   │── routes/               # Express Routes
│   │   │── controllers/          # Business Logic
│   │   │── config/               # Configurations (DB, JWT)
│   │   │── index.js              # Main entry point
│   │   │── Dockerfile            # Docker container setup
│   │   │── .env                  # Environment variables
│   │   └── package.json          # Node dependencies
│   │── restaurant-service/       # Restaurant Management Service
│   │   │── models/
│   │   │── routes/
│   │   │── controllers/
│   │   │── config/
│   │   │── index.js
│   │   │── Dockerfile
│   │   └── .env
│   │── order-service/            # Order Placement & Management Service
│   │   │── models/
│   │   │── routes/
│   │   │── controllers/
│   │   │── config/
│   │   │── index.js
│   │   │── Dockerfile
│   │   └── .env
│   │── delivery-service/         # Delivery Tracking & Management Service
│   │   │── models/
│   │   │── routes/
│   │   │── controllers/
│   │   │── config/
│   │   │── index.js
│   │   │── Dockerfile
│   │   └── .env
│   │── payment-service/          # Payment Processing Service
│   │   │── models/
│   │   │── routes/
│   │   │── controllers/
│   │   │── config/
│   │   │── index.js
│   │   │── Dockerfile
│   │   └── .env
│   │── notification-service/     # Email/SMS Notifications Service
│   │   │── models/
│   │   │── routes/
│   │   │── controllers/
│   │   │── config/
│   │   │── index.js
│   │   │── Dockerfile
│   │   └── .env
│
│── api-gateway/                  # API Gateway (Single Entry Point)
│   │── index.js                   # Gateway Logic
│   │── .env                        # Gateway Config
│   │── Dockerfile                   # Gateway Docker Setup
│   └── package.json                 # Dependencies
│
│── frontend/                      # React.js Frontend
│   │── src/
│   │   │── components/             # UI Components
│   │   │── pages/                  # React Pages
│   │   │── api/                    # API Calls to Gateway
│   │   └── App.js                  # Main React App
│   │── public/
│   │── package.json
│   │── Dockerfile
│   └── .env
│
│── database/                      # Database Configurations (MongoDB)
│   │── mongo-init.js               # DB Initialization Script
│   └── docker-compose.yml          # MongoDB Service in Docker
│
│── docker/                        # Docker-Compose Configurations
│   │── docker-compose.yml
│   │── .env
│
│── kubernetes/                    # Kubernetes Deployment Configs
│   │── user-service.yaml
│   │── restaurant-service.yaml
│   │── order-service.yaml
│   │── delivery-service.yaml
│   │── payment-service.yaml
│   │── notification-service.yaml
│   │── api-gateway.yaml
│   └── mongo-deployment.yaml
│
│── README.md                      # Project Documentation
│── .gitignore                      # Ignore files
└── package.json                    # Root package file (if using monorepo)


```

---

## 🔧 Quick Setup  

### 1️⃣ Clone the Repository  
```bash
 git clone https://github.com/NIKKAvRULZ/DineSwift.git
 cd DineSwift
```

### 2️⃣ Install Dependencies (Backend)  
```bash
 
```

### 3️⃣ Start the Backend Services  
```bash
 npm start
```

### 4️⃣ Run the Frontend (React)  
```bash
 
```

### 5️⃣ Deploy Using Docker & Kubernetes  
```bash
 
```

---

## 📌 Development Roadmap  

✅ **Phase 1:** Repository Setup & Microservices Architecture  
⏳ **Phase 2:** Backend API Development  
⏳ **Phase 3:** Frontend UI Implementation  
⏳ **Phase 4:** Payment & Notification Integration  
⏳ **Phase 5:** Docker & Kubernetes Deployment  
⏳ **Phase 6:** Testing & Documentation  

---

## 👥 Meet the Team  

🚀 **Nithika Perera** – Project Lead  
💡 **Nadeema Jayasingha**   
🔧 **Shanuka Induran**  
📊 **Karindra Gimhan** 

---

## 📞 Contact Us  

📧 For questions, suggestions, or collaborations, reach out at **nithika151@gmail.com**.  

🌍 Follow our journey as we build **DineSwift** into the future of food delivery! 🚀

