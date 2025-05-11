// src/api/categoriasApi.ts
import { supabase } from "../supabaseClient";

export async function buscarCategoriasSimilares(termino: string) {
  const { data, error } = await supabase
    .from("categorias")
    .select("nombre")
    .ilike("nombre", `%${termino.trim().toLowerCase()}%`)
    .limit(5);

  if (error) {
    console.error("Error buscando categorías:", error.message);
    return [];
  }

  return data?.map((c) => c.nombre) || [];
}
