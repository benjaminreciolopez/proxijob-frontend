import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { normalizarTextoCategoria } from "../utils/normalizarTextoCategoria";
import Button from "./ui/Button";

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

    // 1. Si hay una categoria nueva, anadela
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
          toast.error("No se pudo crear la nueva categoria.");
          return;
        }
        nuevaId = nueva.id;
        toast.success("Categoria creada y anadida a tu perfil!");
      }
      if (nuevaId) {
        idsFinal.push(nuevaId);
      }
    }

    // Elimina duplicados
    idsFinal = Array.from(new Set(idsFinal));
    if (idsFinal.length > 3) {
      toast.error("Solo puedes seleccionar un maximo de 3 categorias.");
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
        toast.error("Error al guardar las categorias.");
        return;
      }
    }

    toast.success("Perfil actualizado.");
    navigate("/dashboard");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-grey-800 mb-6">Editar perfil profesional</h2>

      <div className="bg-white rounded-lg border border-grey-200 shadow-sm p-6 space-y-6">
        {/* Categorias */}
        <div>
          <div
            onClick={() => setCategoriasAbierto((a) => !a)}
            className="flex items-center gap-2 font-semibold text-primary cursor-pointer select-none hover:text-primary-dark transition-colors"
          >
            <span className="text-xs">{categoriasAbierto ? "▼" : "▶"}</span>
            Categorias seleccionadas
          </div>
          {categoriasAbierto && (
            <div className="mt-3 space-y-1.5 max-h-64 overflow-y-auto border border-grey-200 rounded-md p-3">
              {[
                ...todasCategorias,
                { id: "otras", nombre: "Otra (especificar)" },
              ].map((cat) => (
                <label
                  key={cat.id}
                  className="flex items-center gap-2 cursor-pointer py-0.5 hover:bg-grey-50 px-1 rounded"
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
                          toast.error("Maximo 3 categorias.");
                          return;
                        }
                        setSeleccionadas([...seleccionadas, id]);
                        if (id === "otras") setMostrarCampoNueva(true);
                      } else {
                        setSeleccionadas(seleccionadas.filter((x) => x !== id));
                        if (id === "otras") setMostrarCampoNueva(false);
                      }
                    }}
                    className="rounded border-grey-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-grey-700">{cat.nombre}</span>
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
            placeholder="Escribe tu categoria personalizada"
            className="w-full rounded-md border border-grey-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        )}

        {/* Descripcion */}
        <div>
          <label className="block text-sm font-medium text-grey-700 mb-1">Descripcion:</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Describe tu experiencia, habilidades o proyectos destacados."
            rows={5}
            className="w-full rounded-md border border-grey-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <Button variant="primary" onClick={guardarPerfil}>
            Guardar
          </Button>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditarPerfil;
