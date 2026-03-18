import { supabase } from "../supabaseClient";
import type { Categoria, CategoriaPendiente } from "../types";

export async function fetchCategorias() {
  const { data, error } = await supabase
    .from("categorias")
    .select("*");

  if (error) throw error;
  return data as Categoria[];
}

export async function searchCategorias(term: string) {
  const { data, error } = await supabase
    .from("categorias")
    .select("nombre")
    .ilike("nombre", `%${term.trim().toLowerCase()}%`)
    .order("nombre", { ascending: true })
    .limit(5);

  if (error) throw error;
  return data?.map((c) => c.nombre) ?? [];
}

export async function createCategoriaPendiente(categoriaPendiente: {
  nombre: string;
  nombre_normalizado: string;
  sugerida_por: string;
}) {
  const { data, error } = await supabase
    .from("categorias_pendientes")
    .insert([categoriaPendiente])
    .select()
    .single();

  if (error) throw error;
  return data as CategoriaPendiente;
}

export async function fetchCategoriasPendientes() {
  const { data, error } = await supabase
    .from("categorias_pendientes")
    .select("*")
    .eq("revisada", false)
    .order("creada_en", { ascending: false });

  if (error) throw error;
  return data as CategoriaPendiente[];
}

export async function aprobarCategoria(id: string, nombre: string, nombreNormalizado: string) {
  // Check if already exists in categorias
  const { data: existing } = await supabase
    .from("categorias")
    .select("id")
    .eq("nombre_normalizado", nombreNormalizado)
    .maybeSingle();

  if (!existing) {
    const { error: insertError } = await supabase
      .from("categorias")
      .insert([{ nombre, nombre_normalizado: nombreNormalizado }]);

    if (insertError) throw insertError;
  }

  const { error } = await supabase
    .from("categorias_pendientes")
    .update({ revisada: true })
    .eq("id", id);

  if (error) throw error;
}

export async function rechazarCategoria(id: string) {
  const { error } = await supabase
    .from("categorias_pendientes")
    .update({ revisada: true })
    .eq("id", id);

  if (error) throw error;
}
