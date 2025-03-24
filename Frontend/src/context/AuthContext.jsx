import { createContext, useState, useEffect } from "react";
import axios from "../api/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setUser(res.data))
        .catch(() => logout());
    }
  }, []);

  const login = async (credentials) => {
    const res = await axios.post("/auth/login", credentials);
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
  };

  const signup = async (userData) => {
    await axios.post("/auth/register", userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
