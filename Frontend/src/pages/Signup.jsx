import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5001/api/auth/register", formData);
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-lg rounded-lg max-w-sm w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Signup</h2>
        <input name="name" onChange={handleChange} placeholder="Name" className="border p-2 w-full mb-2 rounded" />
        <input name="email" type="email" onChange={handleChange} placeholder="Email" className="border p-2 w-full mb-2 rounded" />
        <input name="password" type="password" onChange={handleChange} placeholder="Password" className="border p-2 w-full mb-2 rounded" />
        <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">Register</button>
      </form>
    </div>
  );
};

export default Signup;
