import React, { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import toast from "react-hot-toast";
import { normalizarTextoCategoria } from "../../../utils/normalizarTextoCategoria";

interface CategoriaPendiente {
  id: string;
  nombre: string;
  usuario_id: string;
  creada_en: string;
}

const CategoriasPendientes: React.FC = () => {
  const [categorias, setCategorias] = useState<CategoriaPendiente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState<string | null>(null);

  const cargarCategorias = async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from("categorias_pendientes")
      .select("*")
      .eq("revisada", false)
      .order("creada_en", { ascending: false });

    if (error) {
      toast.error("Error al cargar categorías");
      setCargando(false);
      return;
    }

    setCategorias(data || []);
    setCargando(false);
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const aprobarCategoria = async (cat: CategoriaPendiente) => {
    setProcesando(cat.id);

    // 1. Normaliza y busca por nombre_normalizado
    const nombre = cat.nombre.trim();
    const nombre_normalizado = normalizarTextoCategoria(nombre);

    const { data: yaExiste } = await supabase
      .from("categorias")
      .select("id")
      .eq("nombre_normalizado", nombre_normalizado)
      .maybeSingle();

    if (!yaExiste) {
      const { error: errorInsert } = await supabase
        .from("categorias")
        .insert([{ nombre, nombre_normalizado }]);

      if (errorInsert) {
        toast.error("Error al aprobar la categoría");
        setProcesando(null);
        return;
      }
    }

    // 2. Marcar como revisada
    await supabase
      .from("categorias_pendientes")
      .update({ revisada: true })
      .eq("id", cat.id);

    toast.success("✅ Categoría aprobada y añadida");
    setProcesando(null);
    cargarCategorias();
  };

  const rechazarCategoria = async (cat: CategoriaPendiente) => {
    setProcesando(cat.id);
    await supabase
      .from("categorias_pendientes")
      .update({ revisada: true })
      .eq("id", cat.id);

    toast("🚫 Categoría rechazada", { icon: "❌" });
    setProcesando(null);
    cargarCategorias();
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h2>🧾 Categorías pendientes</h2>

      {cargando ? (
        <p>Cargando...</p>
      ) : categorias.length === 0 ? (
        <p>No hay categorías pendientes.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {categorias.map((cat) => (
            <li
              key={cat.id}
              style={{
                border: "1px solid #ccc",
                padding: "1rem",
                marginBottom: "1rem",
                borderRadius: "6px",
                background: procesando === cat.id ? "#f6f6f6" : "white",
                opacity: procesando === cat.id ? 0.6 : 1,
              }}
            >
              <strong>{cat.nombre}</strong>
              <br />
              Propuesta por: <code>{cat.usuario_id}</code>
              <br />
              Fecha: {new Date(cat.creada_en).toLocaleString()}
              <br />
              <div style={{ marginTop: "0.5rem" }}>
                <button
                  onClick={() => aprobarCategoria(cat)}
                  style={{
                    marginRight: "1rem",
                    backgroundColor: "#28a745",
                    color: "white",
                    padding: "0.4rem 0.8rem",
                    border: "none",
                    borderRadius: "4px",
                    cursor: procesando ? "not-allowed" : "pointer",
                  }}
                  disabled={!!procesando}
                >
                  ✅ Aprobar
                </button>
                <button
                  onClick={() => rechazarCategoria(cat)}
                  style={{
                    backgroundColor: "#dc3545",
                    color: "white",
                    padding: "0.4rem 0.8rem",
                    border: "none",
                    borderRadius: "4px",
                    cursor: procesando ? "not-allowed" : "pointer",
                  }}
                  disabled={!!procesando}
                >
                  ❌ Rechazar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CategoriasPendientes;
