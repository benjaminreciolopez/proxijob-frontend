import React, { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import toast from "react-hot-toast";
import { normalizarTextoCategoria } from "../../../utils/normalizarTextoCategoria";
import Button from "../../ui/Button";
import EmptyState from "../../ui/EmptyState";
import { SkeletonList } from "../../ui/Skeleton";
import Card from "../../ui/Card";

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
      toast.error("Error al cargar categorias");
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
        toast.error("Error al aprobar la categoria");
        setProcesando(null);
        return;
      }
    }
    await supabase
      .from("categorias_pendientes")
      .update({ revisada: true })
      .eq("id", cat.id);

    toast.success("Categoria aprobada y anadida");
    setProcesando(null);
    cargarCategorias();
  };

  const rechazarCategoria = async (cat: CategoriaPendiente) => {
    setProcesando(cat.id);
    await supabase
      .from("categorias_pendientes")
      .update({ revisada: true })
      .eq("id", cat.id);

    toast("Categoria rechazada");
    setProcesando(null);
    cargarCategorias();
  };

  return (
    <section>
      <Button
        variant="outline"
        className="mb-4"
        onClick={() => setVisible((v) => !v)}
      >
        {visible
          ? "Ocultar categorias pendientes"
          : "Mostrar categorias pendientes"}
      </Button>

      {visible && (
        <div>
          <h3 className="text-lg font-semibold text-grey-800 mb-4">Categorias pendientes</h3>
          {cargando ? (
            <SkeletonList count={3} />
          ) : categorias.length === 0 ? (
            <EmptyState
              icon="🧾"
              title="Sin categorias pendientes"
              description="No hay categorias pendientes de revision."
            />
          ) : (
            <div className="space-y-3">
              {categorias.map((cat) => (
                <Card
                  key={cat.id}
                  className={`transition-opacity ${
                    procesando === cat.id ? "opacity-60" : ""
                  }`}
                >
                  <p className="font-semibold text-grey-800">{cat.nombre}</p>
                  <p className="text-xs text-grey-500 mt-1">
                    Propuesta por: <code className="bg-grey-100 px-1 py-0.5 rounded text-xs">{cat.usuario_id}</code>
                  </p>
                  <p className="text-xs text-grey-400 mt-0.5">
                    Fecha: {new Date(cat.creada_en).toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-grey-200">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => aprobarCategoria(cat)}
                      disabled={!!procesando}
                    >
                      Aprobar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => rechazarCategoria(cat)}
                      disabled={!!procesando}
                    >
                      Rechazar
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default CategoriasPendientes;
