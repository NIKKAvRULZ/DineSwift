import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { OrderProvider } from "./context/OrderContext";
import Navbar from "./components/NavBar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Orders from "./pages/Orders";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Restaurants from "./pages/Restaurants";
import Delivery from "./pages/Delivery";
import AssignDelivery from "./pages/AssignDelivery";
import Payment from "./pages/Payment";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import OrderTracking from "./pages/OrderTracking";
import Cart from "./pages/Cart";
import ProtectedRoute from "./components/ProtectedRoute";
import OrderConfirmation from "./pages/OrderConfirmation"; // Import OrderConfirmation page

function App() {
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
                <Route path="/about-us" element={<AboutUs />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/contact" element={<Contact />} />
             
                
                {/* Protected Routes */}
                <Route
                  path="/restaurants"
                  element={
                    <ProtectedRoute element={<Restaurants />} />
                  }
                />
                <Route
                  path="/restaurants/:id/menu"
                  element={
                    <ProtectedRoute element={<Menu />} />
                  }
                />
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute element={<Cart />} />
                  }
                />
                
                {/* Additional Protected Routes */}
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute element={<Orders />} />
                  }
                />
                <Route path="/delivery" element={<Delivery />} /> {/* Unprotected */}
                <Route path="/assign-delivery" element={<AssignDelivery />} /> {/* Unprotected */}
                <Route path="/payment" element={<Payment />} /> {/* Unprotected */}
                <Route path="/profile" element={<Profile />} /> {/* Unprotected */}
                <Route path="/notifications" element={<Notifications />} /> {/* Unprotected */}
                <Route
                  path="/tracking/:orderId"
                  element={
                    <ProtectedRoute element={<OrderTracking />} />
                  }
                />
                <Route path="/tracking" element={<OrderTracking />} /> {/* Unprotected */}
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <OrderConfirmation />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </OrderProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;