import { useAuthLogic } from "@/hooks/use-auth-logic";
import React, { createContext, useContext } from "react";

const AuthContext = createContext<ReturnType<typeof useAuthLogic> | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const value = useAuthLogic();
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
