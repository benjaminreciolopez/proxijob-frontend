import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { normalizarTextoCategoria } from "../utils/normalizarTextoCategoria";

interface Props {
  usuario: { id: string };
}

const EditarPerfil: React.FC<Props> = ({ usuario }) => {
  const navigate = useNavigate();
  const [descripcion, setDescripcion] = useState("");
  const [todasCategorias, setTodasCategorias] = useState<
    { id: string; nombre: string }[]
  >([]);
  const [seleccionadas, setSeleccionadas] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [mostrarCampoNueva, setMostrarCampoNueva] = useState(false);
  const [categoriasAbierto, setCategoriasAbierto] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      if (!usuario?.id) {
        toast.error("No se pudo obtener el usuario.");
        navigate("/");
        return;
      }

      const { data: datosUsuario } = await supabase
        .from("usuarios")
        .select("descripcion")
        .eq("id", usuario.id)
        .single();

      setDescripcion(datosUsuario?.descripcion || "");

      const { data: categoriasData } = await supabase
        .from("categorias")
        .select("*");

      setTodasCategorias(
        (categoriasData || []).sort((a, b) =>
          a.nombre.localeCompare(b.nombre, "es")
        )
      );

      // 👉 Relación unificada: categorias_usuario
      const { data: asociadas } = await supabase
        .from("categorias_usuario")
        .select("categoria_id")
        .eq("usuario_id", usuario.id);

      const ids = asociadas?.map((c) => c.categoria_id) || [];
      setSeleccionadas(ids);

      setCargando(false);
    };

    cargarDatos();
    // eslint-disable-next-line
  }, [usuario, navigate]);

  const guardarPerfil = async () => {
    if (!usuario?.id) {
      toast.error("No se pudo obtener el usuario.");
      return;
    }

    let especialidad = "";
    let nuevaId: string | null = null;
    let idsFinal = [...seleccionadas.filter((id) => id !== "otras")];

    // 1. Si hay una categoría nueva, añádela
    if (mostrarCampoNueva && nuevaCategoria.trim().length > 1) {
      const nombreNormalizado = normalizarTextoCategoria(nuevaCategoria);
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

    // Elimina duplicados
    idsFinal = Array.from(new Set(idsFinal));
    if (idsFinal.length > 3) {
      toast.error("Solo puedes seleccionar un máximo de 3 categorías.");
      return;
    }

    if (idsFinal.length > 0) {
      const cat = todasCategorias.find((c) => c.id === idsFinal[0]);
      especialidad = cat?.nombre || nuevaCategoria.trim();
    }

    // 2. Actualizar usuario
    const { error: updateError } = await supabase
      .from("usuarios")
      .update({ descripcion, especialidad })
      .eq("id", usuario.id);

    if (updateError) {
      toast.error("Error al guardar los cambios.");
      return;
    }

    // 3. Eliminar y registrar nuevas relaciones
    await supabase
      .from("categorias_usuario")
      .delete()
      .eq("usuario_id", usuario.id);

    const inserts = idsFinal.map((categoriaId) => ({
      usuario_id: usuario.id,
      categoria_id: categoriaId,
    }));

    if (inserts.length > 0) {
      const { error: errorInsert } = await supabase
        .from("categorias_usuario")
        .insert(inserts);

      if (errorInsert) {
        toast.error("❌ Error al guardar las categorías.");
        return;
      }
    }

    toast.success("Perfil actualizado.");
    navigate("/dashboard");
  };

  return (
    <div className="dashboard">
      <h2>✏️ Editar perfil profesional</h2>

      <div className="dashboard-section">
        <div style={{ marginBottom: "1.5rem", marginTop: "1rem" }}>
          <div
            onClick={() => setCategoriasAbierto((a) => !a)}
            style={{
              fontWeight: 600,
              fontSize: "1.08rem",
              cursor: "pointer",
              userSelect: "none",
              display: "flex",
              alignItems: "center",
              color: "#4f46e5",
              marginBottom: categoriasAbierto ? 10 : 0,
            }}
          >
            <span style={{ marginRight: 8 }}>
              {categoriasAbierto ? "▼" : "▶"}
            </span>
            Categorías seleccionadas
          </div>
          {categoriasAbierto && (
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
          )}
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
            onClick={() => navigate("/dashboard")}
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
