import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const Signup = () => {
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate(); // ✅ Move useNavigate inside a Router-wrapped component
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signup(form);
    navigate("/login"); // ✅ Navigate after signup
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-md shadow-md w-1/3">
        <h2 className="text-xl font-bold mb-4">Sign Up</h2>
        <input type="text" name="name" placeholder="Name" onChange={handleChange} className="w-full p-2 border rounded mb-2" required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} className="w-full p-2 border rounded mb-2" required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} className="w-full p-2 border rounded mb-4" required />
        <button className="bg-green-600 text-white px-4 py-2 rounded w-full">Sign Up</button>
      </form>
    </div>
  );
};

export default Signup;
  