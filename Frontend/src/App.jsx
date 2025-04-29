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
import Checkout from "./pages/Checkout"; // Import Checkout page
import AboutUs from "./pages/AboutUs";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import ClientMenu from "./pages/ClientMenu"; // Import ClientMenu page

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
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  }
                />
                
                {/* Additional Protected Routes */}
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
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
                    <ProtectedRoute>
                      <OrderTracking />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/tracking" element={<OrderTracking />} /> {/* Unprotected */}
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                {/* New route for client restaurant view */}
                <Route path="/restaurant-menu" element={<Restaurants isClientView={true} />} />
                <Route path="/restaurant-menu/:id" element={<ClientMenu />} />
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