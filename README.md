# 🍽️ DineSwift - Cloud-Native Food Ordering & Delivery System

DineSwift is a next-gen, cloud-native food ordering and delivery platform inspired by UberEats & PickMe Food. Designed with a scalable microservices architecture, it offers a seamless experience for customers, restaurants, and delivery drivers. 🚀

---

## 🚀 Features at a Glance

- ✅ **Intuitive Web Interface** – Easily browse restaurants, add items to cart, and place orders  
- ✅ **Restaurant Dashboard** – Manage menus, update orders, and track earnings  
- ✅ **Order Tracking** – Real-time status updates with GPS-enabled delivery tracking  
- ✅ **AI-Powered Auto Assignment** – Smart allocation of drivers to optimize deliveries  
- ✅ **Secure Payments** – Supports PayHere, Dialog Genie, and Stripe (Sandbox Mode)  
- ✅ **Instant Notifications** – Get email & SMS updates for every order status change  

---

## 🏗️ Tech Stack

### 🔙 Backend (Microservices)
- 🟢 **Node.js (Express.js)** – API Development  
- 🟢 **MongoDB** – NoSQL Database  
- 🟢 **Kafka** – Asynchronous Messaging  
- 🟢 **Docker & Kubernetes** – Containerized Services & Orchestration  

### 🎨 Frontend
- ⚛️ **React.js** – Modern Web App UI  
- 💅 **Tailwind CSS** – Styling and Components  
- 🔄 **Axios** – API Integration  
- 🎬 **Framer Motion** – Smooth Animations  

### 🛠️ DevOps & Deployment
- 🐳 **Docker** – Microservice Deployment  
- ☸️ **Kubernetes** – Scalable Service Management  
- 🧪 **Postman** – API Testing & Debugging  

---

## 📂 Project Structure

```
DineSwift/
├── Frontend/                  # React.js Frontend
│   ├── src/
│   │   ├── components/        # Reusable UI Components
│   │   ├── pages/             # Page Components
│   │   ├── context/           # React Context Providers
│   │   ├── hooks/             # Custom React Hooks
│   │   └── api/               # API Integration
│   └── public/                # Static Assets
│
├── Services/                  # Backend Microservices
│   ├── ApiGateway/            # API Gateway Service
│   ├── UserService/           # User Management
│   ├── RestaurantService/     # Restaurant Management
│   ├── OrderService/          # Order Processing
│   ├── PaymentService/        # Payment Processing
│   ├── DeliveryService/       # Delivery Management
│   └── NotificationService/   # Email/SMS Notifications
│
├── Kubernetes/                # K8s Deployment Configs
└── Docker/                    # Docker Configurations
```

---

## 🔧 Quick Setup

### ✅ Prerequisites
- Node.js (v16+)
- Docker
- Kubernetes CLI (`kubectl`)
- MongoDB

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/NIKKAvRULZ/DineSwift.git
cd DineSwift
```

### 2️⃣ Frontend Setup
```bash
cd Frontend
npm install
npm run dev
```

### 3️⃣ Backend Services Setup
For each microservice in `Services/`:
```bash
cd Services/<ServiceName>
npm install
npm start
```

### 4️⃣ Docker Deployment
```bash
docker-compose up -d
```

### 5️⃣ Kubernetes Deployment
```bash
kubectl apply -f Kubernetes/
```

---

## 📌 Development Roadmap

- ✅ Phase 1: Repository Setup & Microservices Architecture  
- ✅ Phase 2: Backend API Development  
- ✅ Phase 3: Frontend UI Implementation  
- ⏳ Phase 4: Payment & Notification Integration  
- ⏳ Phase 5: Docker & Kubernetes Deployment  
- ⏳ Phase 6: Testing & Documentation  

---

## 👥 Meet the Team

- 🚀 **Nithika Perera** – Project Lead  
- 💡 **Nadeema Jayasingha**  
- 🔧 **Shanuka Induran**  
- 📊 **Karindra Gimhan**  

---

## 📞 Contact Us

For questions, suggestions, or collaborations, reach out at:  
📧 **nithika151@gmail.com**

---

## 🌍 Follow Our Journey
Stay tuned as we build DineSwift into the future of food delivery! 🚀

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
