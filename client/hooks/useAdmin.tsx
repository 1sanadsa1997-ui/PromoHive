import React, { createContext, useContext, useState } from "react";

type AdminContextType = {
  isAuthenticated: boolean;
  login: (password: string) => void;
  logout: () => void;
  password: string | null;
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [password, setPassword] = useState<string | null>(() => {
    try {
      return typeof window !== "undefined" ? sessionStorage.getItem("ph_admin_pw") : null;
    } catch {
      return null;
    }
  });

  function login(pw: string) {
    setPassword(pw);
    try { sessionStorage.setItem("ph_admin_pw", pw); } catch (e) {}
  }
  function logout() {
    setPassword(null);
    try { sessionStorage.removeItem("ph_admin_pw"); } catch (e) {}
  }

  return <AdminContext.Provider value={{ isAuthenticated: !!password, login, logout, password }}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
