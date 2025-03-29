import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-green-800 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">DineSwift</h1>
      
      <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
        ☰
      </button>

      <div className={`md:flex space-x-4 ${isOpen ? "block" : "hidden"} md:block`}>
        <Link to="/">Home</Link>
        <Link to="/orders">Orders</Link>
        {localStorage.getItem("token") ? (
          <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded">Logout</button>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
