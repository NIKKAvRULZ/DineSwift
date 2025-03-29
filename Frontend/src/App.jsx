import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Orders from "./pages/Orders";
import Navbar from "./components/Navbar";
import Payment from "./pages/Payment";
import Admin from "./pages/Admin";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/paymnet" element={<Payment />} />
        <Route path="/Admin" element={<Admin/>} />

      </Routes>
    </Router>
  );
}

export default App;
