import { supabase } from "../supabaseClient";
import type { Pago, Transaccion } from "../types";

export async function fetchPagosRealizados(userId: string): Promise<Pago[]> {
  const { data, error } = await supabase
    .from("pj_pagos")
    .select("*")
    .eq("pagador_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Pago[];
}

export async function fetchPagosRecibidos(userId: string): Promise<Pago[]> {
  const { data, error } = await supabase
    .from("pj_pagos")
    .select("*")
    .eq("receptor_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Pago[];
}

export async function fetchTransacciones(pagoId: string): Promise<Transaccion[]> {
  const { data, error } = await supabase
    .from("pj_transacciones")
    .select("*")
    .eq("pago_id", pagoId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Transaccion[];
}
