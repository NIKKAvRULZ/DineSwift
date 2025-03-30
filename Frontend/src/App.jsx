import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { OrderProvider } from "./context/OrderContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Orders from "./pages/Orders";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Restaurants from "./pages/Restaurants";
import Delivery from "./pages/Delivery";
import Payment from "./pages/Payment";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import OrderTracking from "./pages/OrderTracking";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <OrderProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route
                  path="/restaurants"
                  element={
                    <ProtectedRoute>
                      <Restaurants />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/restaurants/:id/menu"
                  element={
                    <ProtectedRoute>
                      <Menu />
                    </ProtectedRoute>
                  }
                />
                
                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/delivery" element={<Delivery />} />
                  <Route path="/payment" element={<Payment />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/tracking" element={<OrderTracking />} />
                </Route>
              </Routes>
            </main>
            <Footer />
          </div>
        </OrderProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
