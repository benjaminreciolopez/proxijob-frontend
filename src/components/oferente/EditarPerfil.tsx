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

    if (seleccionadas.length > 0 && seleccionadas[0] !== "otras") {
      const primeraCategoria = todasCategorias.find(
        (cat) => cat.id === seleccionadas[0]
      );
      if (primeraCategoria) {
        especialidad = primeraCategoria.nombre;
      }
    }

    await supabase
      .from("categorias_oferente")
      .delete()
      .eq("oferente_id", user.id);

    let nuevaId: string | null = null;

    if (nuevaCategoria.trim().length > 1) {
      const nombreNormalizado = normalizarTextoCategoria(nuevaCategoria);

      const { data: existente } = await supabase
        .from("categorias")
        .select("id")
        .eq("nombre_normalizado", nombreNormalizado)
        .single();

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

      if (nuevaId) {
        seleccionadas.push(nuevaId);
        especialidad = nuevaCategoria.trim();
      }
    }

    const inserts = seleccionadas
      .filter((id) => id !== "otras")
      .map((categoriaId) => ({
        oferente_id: user.id,
        categoria_id: categoriaId,
      }));

    if (inserts.length > 0) {
      const { error: errorInsert } = await supabase
        .from("categorias_oferente")
        .insert(inserts);

      if (errorInsert) {
        console.error(
          "❌ Error al insertar en categorias_oferente:",
          errorInsert
        );
        toast.error("❌ No se ha podido asociar las categorías.");
      }
    }

    const { error: updateError } = await supabase
      .from("usuarios")
      .update({ descripcion, especialidad })
      .eq("id", user.id);

    if (updateError) {
      toast.error("Error al guardar los cambios.");
      return;
    }

    toast.success("Perfil actualizado.");
    navigate("/dashboard/oferente");
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h2>✏️ Editar perfil profesional</h2>
      <div style={{ marginTop: "1rem" }}>
        <label>Categorías seleccionadas:</label>
        <select
          multiple
          value={seleccionadas}
          onChange={(e) => {
            const valores = Array.from(
              e.target.selectedOptions,
              (opt) => opt.value
            );
            setSeleccionadas(valores);
            setMostrarCampoNueva(valores.includes("otras"));
          }}
          style={{ display: "block", width: "100%", marginBottom: "1rem" }}
        >
          {todasCategorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
          <option value="otras">🆕 Otra (especificar)</option>
        </select>
        {mostrarCampoNueva && (
          <input
            type="text"
            value={nuevaCategoria}
            onChange={(e) => setNuevaCategoria(e.target.value)}
            placeholder="Escribe tu categoría personalizada"
            style={{ display: "block", width: "100%", marginBottom: "1rem" }}
          />
        )}

        <label>Descripción:</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Describe tu experiencia, habilidades o proyectos destacados."
          rows={5}
          style={{ display: "block", width: "100%", marginBottom: "1rem" }}
        />

        <button
          onClick={guardarPerfil}
          style={{
            padding: "0.6rem 1.2rem",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          💾 Guardar
        </button>

        <button
          onClick={() => navigate("/dashboard/oferente")}
          style={{
            marginLeft: "1rem",
            padding: "0.6rem 1.2rem",
            backgroundColor: "#ccc",
            color: "#333",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          ⬅️ Cancelar
        </button>
      </div>
    </div>
  );
};

export default EditarPerfil;
