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
  const [visible, setVisible] = useState(false);

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
    if (visible) {
      cargarCategorias();
    }
    // Solo carga al abrir la lista
    // eslint-disable-next-line
  }, [visible]);

  const aprobarCategoria = async (cat: CategoriaPendiente) => {
    setProcesando(cat.id);
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
    <section className="dashboard-section">
      <button
        className="zonas-boton-secundario"
        style={{ marginBottom: "1rem" }}
        onClick={() => setVisible((v) => !v)}
      >
        {visible
          ? "Ocultar categorías pendientes"
          : "Mostrar categorías pendientes"}
      </button>
      {visible && (
        <div>
          <h3 style={{ marginBottom: "1.2rem" }}>🧾 Categorías pendientes</h3>
          {cargando ? (
            <p>Cargando...</p>
          ) : categorias.length === 0 ? (
            <p>No hay categorías pendientes.</p>
          ) : (
            <ul className="categorias-pendientes-lista">
              {categorias.map((cat) => (
                <li
                  key={cat.id}
                  className={`categorias-pendientes-item${
                    procesando === cat.id ? " procesando" : ""
                  }`}
                >
                  <strong>{cat.nombre}</strong>
                  <br />
                  <span className="cat-propuesta">
                    Propuesta por: <code>{cat.usuario_id}</code>
                  </span>
                  <br />
                  <span className="cat-fecha">
                    Fecha: {new Date(cat.creada_en).toLocaleString()}
                  </span>
                  <div style={{ marginTop: "0.7rem" }}>
                    <button
                      onClick={() => aprobarCategoria(cat)}
                      className="zonas-boton"
                      style={{ marginRight: "0.8rem" }}
                      disabled={!!procesando}
                    >
                      ✅ Aprobar
                    </button>
                    <button
                      onClick={() => rechazarCategoria(cat)}
                      className="zonas-boton-secundario"
                      style={{ backgroundColor: "#dc3545" }}
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
      )}
    </section>
  );
};

export default CategoriasPendientes;
