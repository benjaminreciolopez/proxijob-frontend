import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";

interface CategoriaPendiente {
  id: string;
  nombre: string;
  usuario_id: string;
  creada_en: string;
}

const CategoriasPendientes: React.FC = () => {
  const [categorias, setCategorias] = useState<CategoriaPendiente[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarCategorias = async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from("categorias_pendientes")
      .select("*")
      .eq("revisada", false)
      .order("creada_en", { ascending: false });

    if (error) {
      toast.error("Error al cargar categorías");
      return;
    }

    setCategorias(data || []);
    setCargando(false);
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const aprobarCategoria = async (cat: CategoriaPendiente) => {
    // 1. Insertar en la tabla principal (si no existe)
    const nombre = cat.nombre.trim().toLowerCase();

    const { data: yaExiste } = await supabase
      .from("categorias")
      .select("id")
      .eq("nombre", nombre)
      .single();

    if (!yaExiste) {
      const { error: errorInsert } = await supabase
        .from("categorias")
        .insert([{ nombre }]);

      if (errorInsert) {
        toast.error("Error al aprobar la categoría");
        return;
      }
    }

    // 2. Marcar como revisada
    await supabase
      .from("categorias_pendientes")
      .update({ revisada: true })
      .eq("id", cat.id);

    toast.success("✅ Categoría aprobada");
    cargarCategorias();
  };

  const rechazarCategoria = async (cat: CategoriaPendiente) => {
    await supabase
      .from("categorias_pendientes")
      .update({ revisada: true })
      .eq("id", cat.id);

    toast("🚫 Categoría rechazada");
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
                    cursor: "pointer",
                  }}
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
                    cursor: "pointer",
                  }}
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
