import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

interface AdminAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  adminEmail: string | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  const checkAdminStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setIsAuthenticated(false);
        setAdminEmail(null);
        return;
      }

      const { data: perfil } = await supabase
        .from("usuarios")
        .select("rol, email")
        .eq("id", session.user.id)
        .single();

      if (perfil?.rol === "admin") {
        setIsAuthenticated(true);
        setAdminEmail(perfil.email);
      } else {
        setIsAuthenticated(false);
        setAdminEmail(null);
      }
    } catch {
      setIsAuthenticated(false);
      setAdminEmail(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAdminStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdminStatus();
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      return { ok: false, error: "Correo o contraseña incorrectos" };
    }

    const { data: perfil } = await supabase
      .from("usuarios")
      .select("rol, email")
      .eq("id", data.user.id)
      .single();

    if (perfil?.rol !== "admin") {
      await supabase.auth.signOut();
      return { ok: false, error: "No tienes permisos de administrador" };
    }

    setIsAuthenticated(true);
    setAdminEmail(perfil.email);
    return { ok: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("usuario_admin");
    localStorage.removeItem("usuario");
    setIsAuthenticated(false);
    setAdminEmail(null);
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, isLoading, adminEmail, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth debe usarse dentro de AdminAuthProvider");
  }
  return context;
};

export default AdminAuthProvider;
