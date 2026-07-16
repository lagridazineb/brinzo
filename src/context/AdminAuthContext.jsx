import { createContext, useContext, useState, useCallback } from "react";
import { adminLogin as apiAdminLogin, adminLogout as apiAdminLogout } from "../utils/api";

const STORAGE_KEY = "brinzo_admin_token";
const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY) || null);

  const login = useCallback(async (username, password) => {
    const data = await apiAdminLogin(username, password); // throws ApiError on bad creds
    localStorage.setItem(STORAGE_KEY, data.token);
    setToken(data.token);
    return data.token;
  }, []);

  const logout = useCallback(() => {
    const t = token;
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    if (t) apiAdminLogout(t).catch(() => {}); // best-effort, don't block UI on it
  }, [token]);

  return (
    <AdminAuthContext.Provider value={{ token, isLoggedIn: Boolean(token), login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
