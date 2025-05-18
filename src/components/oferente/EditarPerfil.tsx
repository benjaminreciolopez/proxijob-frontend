import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { normalizarTextoCategoria } from "../../utils/normalizarTextoCategoria";

const EditarPerfil: React.FC = () => {
  const navigate = useNavigate();
  const [descripcion, setDescripcion] = useState("");
  const [todasCategorias, setTodasCategorias] = useState<
    { id: string; nombre: string }[]
  >([]);
  const [seleccionadas, setSeleccionadas] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [mostrarCampoNueva, setMostrarCampoNueva] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        toast.error("No se pudo obtener el usuario.");
        navigate("/");
        return;
      }

      const { data: datosUsuario } = await supabase
        .from("usuarios")
        .select("descripcion")
        .eq("id", user.id)
        .single();

      setDescripcion(datosUsuario?.descripcion || "");

      const { data: categoriasData } = await supabase
        .from("categorias")
        .select("*");

      setTodasCategorias(categoriasData || []);

      const { data: asociadas } = await supabase
        .from("categorias_oferente")
        .select("categoria_id")
        .eq("oferente_id", user.id);

      const ids = asociadas?.map((c) => c.categoria_id) || [];
      setSeleccionadas(ids);

      setCargando(false);
    };

    cargarDatos();
  }, [navigate]);

  const guardarPerfil = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      toast.error("No se pudo obtener el usuario.");
      return;
    }

    let especialidad = "";
    let nuevaId: string | null = null;

    // 1. Si se ha escrito una nueva categoría personalizada
    if (nuevaCategoria.trim().length > 1) {
      const nombreNormalizado = normalizarTextoCategoria(nuevaCategoria);

      const { data: existente } = await supabase
        .from("categorias")
        .select("id")
        .eq("nombre_normalizado", nombreNormalizado)
        .maybeSingle();

      if (existente) {
        nuevaId = existente.id;
      } else {
        const { error: errorPendiente } = await supabase
          .from("categorias_pendientes")
          .insert([
            {
              nombre: nuevaCategoria.trim(),
              nombre_normalizado: nombreNormalizado,
              sugerida_por: user.id,
            },
          ]);

        if (errorPendiente) {
          toast.error("No se pudo registrar la nueva categoría (pendiente).");
        } else {
          toast.success("Tu categoría será revisada por el equipo.");
        }
      }
    }

    // 2. Preparar lista final (sin duplicados)
    const finalSeleccionadas = Array.from(
      new Set([
        ...seleccionadas.filter((id) => id !== "otras"),
        ...(nuevaId ? [nuevaId] : []),
      ])
    );

    // 3. Especialidad principal (la primera)
    if (finalSeleccionadas.length > 0) {
      const cat = todasCategorias.find((c) => c.id === finalSeleccionadas[0]);
      especialidad = cat?.nombre || nuevaCategoria.trim();
    }

    // 4. Actualizar `usuarios` (descripcion + especialidad)
    const { error: updateError } = await supabase
      .from("usuarios")
      .update({ descripcion, especialidad })
      .eq("id", user.id);

    if (updateError) {
      toast.error("Error al guardar los cambios.");
      return;
    }

    // 5. Eliminar relaciones anteriores y registrar las nuevas
    await supabase
      .from("categorias_oferente")
      .delete()
      .eq("oferente_id", user.id);

    const inserts = finalSeleccionadas.map((categoriaId) => ({
      oferente_id: user.id,
      categoria_id: categoriaId,
    }));

    if (inserts.length > 0) {
      const { error: errorInsert } = await supabase
        .from("categorias_oferente")
        .insert(inserts);

      if (errorInsert) {
        toast.error("❌ Error al guardar las categorías.");
        return;
      }
    }

    toast.success("Perfil actualizado.");
    navigate("/dashboard/oferente");
  };

  return (
    <div className="dashboard">
      <h2>✏️ Editar perfil profesional</h2>

      <div className="dashboard-section">
        <label>Categorías seleccionadas:</label>
        <div className="lista-categorias" style={{ marginBottom: "1rem" }}>
          {[
            ...todasCategorias,
            { id: "otras", nombre: "🆕 Otra (especificar)" },
          ].map((cat) => (
            <label
              key={cat.id}
              style={{
                display: "block",
                marginBottom: "0.3rem",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                value={cat.id}
                checked={seleccionadas.includes(cat.id)}
                onChange={(e) => {
                  const id = e.target.value;
                  const nuevaLista = e.target.checked
                    ? [...seleccionadas, id]
                    : seleccionadas.filter((x) => x !== id);
                  setSeleccionadas(nuevaLista);
                  setMostrarCampoNueva(nuevaLista.includes("otras"));
                }}
                style={{ marginRight: "0.5rem" }}
              />
              {cat.nombre}
            </label>
          ))}
        </div>

        {/* Chips visuales */}
        <div
          style={{
            marginBottom: "1rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          {seleccionadas
            .filter((id) => id !== "otras")
            .map((id) => {
              const nombre =
                todasCategorias.find((c) => c.id === id)?.nombre || id;
              return (
                <span
                  key={id}
                  style={{
                    background: "#e0e0e0",
                    borderRadius: "12px",
                    padding: "0.4rem 0.8rem",
                    fontSize: "0.9rem",
                  }}
                >
                  {nombre}
                </span>
              );
            })}
        </div>

        {mostrarCampoNueva && (
          <input
            type="text"
            value={nuevaCategoria}
            onChange={(e) => setNuevaCategoria(e.target.value)}
            placeholder="Escribe tu categoría personalizada"
            className="campo-texto"
          />
        )}

        <label>Descripción:</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Describe tu experiencia, habilidades o proyectos destacados."
          rows={5}
          className="campo-texto"
        />

        <div style={{ marginTop: "1rem" }}>
          <button className="zonas-boton" onClick={guardarPerfil}>
            💾 Guardar
          </button>
          <button
            className="zonas-boton-secundario"
            onClick={() => navigate("/dashboard/oferente")}
            style={{ marginLeft: "0.5rem" }}
          >
            ⬅️ Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditarPerfil;
