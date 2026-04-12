import { createContext, useState, useEffect } from "react";
import * as authApi from "../auth/authApi";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  
  useEffect(() => {
  const token = localStorage.getItem("access");
  if (!token) return;

  authApi
    .getMe()
    .then((res) => setUser(res.data))
    .catch(() => setUser(null));
}, []);
  // ✅ login
  const login = async (email, password) => {
  try {
    const data = await authApi.login(email, password);
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);

    
    const userRes = await authApi.getMe();
    setUser(userRes.data);

    return true;
  } catch (err){
    console.log("LOGIN ERROR:",  err.response?.data || err.message);
    return false;
  }
};
  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};