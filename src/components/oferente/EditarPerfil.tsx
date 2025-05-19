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
    let idsFinal = [...seleccionadas.filter((id) => id !== "otras")];

    // 1. Si hay una categoría nueva, la añadimos en `categorias` (para postular YA)
    if (mostrarCampoNueva && nuevaCategoria.trim().length > 1) {
      const nombreNormalizado = normalizarTextoCategoria(nuevaCategoria);
      // Busca si existe (ya validada o aceptada)
      const { data: existente } = await supabase
        .from("categorias")
        .select("id")
        .eq("nombre_normalizado", nombreNormalizado)
        .maybeSingle();

      if (existente) {
        nuevaId = existente.id;
      } else {
        const { data: nueva, error: errorInsert } = await supabase
          .from("categorias")
          .insert([
            {
              nombre: nuevaCategoria.trim(),
              nombre_normalizado: nombreNormalizado,
            },
          ])
          .select()
          .single();
        if (errorInsert || !nueva) {
          toast.error("No se pudo crear la nueva categoría.");
          return;
        }
        nuevaId = nueva.id;
        toast.success("¡Categoría creada y añadida a tu perfil!");
      }

      if (nuevaId) {
        idsFinal.push(nuevaId);
      }
    }

    // Elimina duplicados por si acaso
    idsFinal = Array.from(new Set(idsFinal));

    // 🚩 **Límite de 3 categorías**
    if (idsFinal.length > 3) {
      toast.error("Solo puedes seleccionar un máximo de 3 categorías.");
      return;
    }

    // 2. Especialidad principal
    if (idsFinal.length > 0) {
      const cat = todasCategorias.find((c) => c.id === idsFinal[0]);
      especialidad = cat?.nombre || nuevaCategoria.trim();
    }

    // 3. Actualizar usuario
    const { error: updateError } = await supabase
      .from("usuarios")
      .update({ descripcion, especialidad })
      .eq("id", user.id);

    if (updateError) {
      toast.error("Error al guardar los cambios.");
      return;
    }

    // 4. Eliminar y registrar nuevas relaciones
    await supabase
      .from("categorias_oferente")
      .delete()
      .eq("oferente_id", user.id);

    // Crea la relación por cada categoría seleccionada (incluida la nueva)
    const inserts = idsFinal.map((categoriaId) => ({
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
                  const yaSeleccionadas = seleccionadas.filter(
                    (x) => x !== "otras"
                  );
                  const seleccionando = e.target.checked;

                  if (seleccionando) {
                    // Máximo 3 categorías distintas de "otras"
                    if (yaSeleccionadas.length >= 3 && id !== "otras") {
                      toast.error("Máximo 3 categorías.");
                      return;
                    }
                    setSeleccionadas([...seleccionadas, id]);
                    if (id === "otras") setMostrarCampoNueva(true);
                  } else {
                    setSeleccionadas(seleccionadas.filter((x) => x !== id));
                    if (id === "otras") setMostrarCampoNueva(false);
                  }
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
