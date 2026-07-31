import { createContext, useEffect, useState } from "react";
import * as api from "../services/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("jn_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("jn_token") || null);

  useEffect(() => {
    if (user) localStorage.setItem("jn_user", JSON.stringify(user));
    else localStorage.removeItem("jn_user");
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem("jn_token", token);
    else localStorage.removeItem("jn_token");
  }, [token]);

  async function signup(data) {
    const res = await api.signup(data);
    setToken(res.token);
    setUser(res.user);
    return res;
  }

  async function login(credentials) {
    const res = await api.login(credentials);
    setToken(res.token);
    setUser(res.user);
    return res;
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
