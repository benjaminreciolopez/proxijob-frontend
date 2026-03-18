import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import type { Usuario } from "../types";

interface UseAuthReturn {
  usuario: Usuario | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  logout: () => Promise<void>;
  refreshPerfil: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
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

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("usuario");
    localStorage.removeItem("usuario_admin");
    setUsuario(null);
  };

  return {
    usuario,
    isLoading,
    isLoggedIn: !!usuario,
    logout,
    refreshPerfil: fetchPerfil,
  };
}
