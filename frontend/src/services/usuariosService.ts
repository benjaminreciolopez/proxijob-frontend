import { supabase } from "../supabaseClient";
import type { Usuario } from "../types";

export async function fetchPerfil(userId: string) {
  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data as Usuario;
}

export async function updatePerfil(
  userId: string,
  updates: Partial<Pick<Usuario, "nombre" | "descripcion" | "especialidad" | "tratamiento" | "avatar_url">>
) {
  const { data, error } = await supabase
    .from("usuarios")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data as Usuario;
}

export async function fetchCategoriasUsuario(userId: string) {
  const { data, error } = await supabase
    .from("categorias_usuario")
    .select("categoria_id")
    .eq("usuario_id", userId);

  if (error) throw error;
  return data?.map((c) => c.categoria_id as string) ?? [];
}

export async function updateCategoriasUsuario(
  userId: string,
  categoriaIds: string[]
) {
  // Remove existing associations
  const { error: deleteError } = await supabase
    .from("categorias_usuario")
    .delete()
    .eq("usuario_id", userId);

  if (deleteError) throw deleteError;

  if (categoriaIds.length === 0) return;

  // Insert new associations
  const inserts = categoriaIds.map((categoriaId) => ({
    usuario_id: userId,
    categoria_id: categoriaId,
  }));

  const { error: insertError } = await supabase
    .from("categorias_usuario")
    .insert(inserts);

  if (insertError) throw insertError;
}
