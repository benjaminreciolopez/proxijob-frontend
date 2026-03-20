import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import type { Usuario } from "../types";

export type UserRole = "cliente" | "profesional" | "admin";

interface AuthContextType {
  usuario: Usuario | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  rol: UserRole | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string; usuario?: Usuario }>;
  logout: () => Promise<void>;
  switchRole: () => Promise<void>;
  refreshPerfil: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const stored = localStorage.getItem("usuario");
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchPerfil = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setUsuario(null);
      localStorage.removeItem("usuario");
      setIsLoading(false);
      return;
    }

    const { data: perfil } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (perfil) {
      setUsuario(perfil as Usuario);
      localStorage.setItem("usuario", JSON.stringify(perfil));
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPerfil();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchPerfil();
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      return { ok: false, error: "invalidCredentials" };
    }

    const { data: perfil } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (!perfil) {
      return { ok: false, error: "errorProfile" };
    }

    const usr = perfil as Usuario;
    setUsuario(usr);
    localStorage.setItem("usuario", JSON.stringify(usr));
    return { ok: true, usuario: usr };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("usuario");
    localStorage.removeItem("usuario_admin");
    setUsuario(null);
  };

  const switchRole = async () => {
    if (!usuario) return;
    const newRole = usuario.rol === "cliente" ? "profesional" : "cliente";

    const { error } = await supabase
      .from("usuarios")
      .update({ rol: newRole })
      .eq("id", usuario.id);

    if (!error) {
      const updated = { ...usuario, rol: newRole };
      setUsuario(updated);
      localStorage.setItem("usuario", JSON.stringify(updated));
    }
  };

  const rol = (usuario?.rol as UserRole) || null;

  return (
    <AuthContext.Provider value={{
      usuario,
      isLoading,
      isLoggedIn: !!usuario,
      rol,
      login,
      logout,
      switchRole,
      refreshPerfil: fetchPerfil,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
};

export default AuthProvider;
