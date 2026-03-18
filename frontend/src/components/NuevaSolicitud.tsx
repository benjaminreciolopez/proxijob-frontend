import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../supabaseClient";
import toast from "react-hot-toast";
import MapaZona from "./common/MapaZona";
import { normalizarTextoCategoria } from "../utils/normalizarTextoCategoria";
import Button from "./ui/Button";

interface Props {
  usuarioId: string;
  nombre: string;
  setNotificacion: (mensaje: string) => void;
  setActualizarHistorial: React.Dispatch<React.SetStateAction<number>>;
}

const NuevaSolicitud: React.FC<Props> = ({
  usuarioId,
  setNotificacion,
  setActualizarHistorial,
}) => {
  const [formData, setFormData] = useState({
    descripcion: "",
    categoriaId: "",
    nuevaCategoria: "",
    ubicacion: "",
    requiereProfesional: false,
    latitud: null as number | null,
    longitud: null as number | null,
    radioKm: 10,
  });

  const [categorias, setCategorias] = useState<
    { id: string; nombre: string }[]
  >([]);
  const [mostrarCampoNueva, setMostrarCampoNueva] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cargarCategorias = async () => {
      const { data, error } = await supabase
        .from("categorias")
        .select("id, nombre");
      if (error) {
        toast.error("No se pudieron cargar las categorias");
        return;
      }
      setCategorias(data || []);
    };
    cargarCategorias();
  }, []);

  // Cierre del autocompletado al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(event.target as Node)
      ) {
        setMostrarCampoNueva(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Gestiona cambios de input
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as any;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Enviar solicitud
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validacion basica
    if (!formData.descripcion.trim()) {
      toast.error("La descripcion es obligatoria.");
      return;
    }
    if (!formData.categoriaId && formData.nuevaCategoria.trim().length < 3) {
      toast.error("Selecciona o escribe una categoria valida.");
      return;
    }

    let categoriaFinalId = formData.categoriaId;

    // Si es una nueva categoria (sin id), busca o crea en categorias_pendientes
    if (!categoriaFinalId && formData.nuevaCategoria.trim().length > 1) {
      const nombreNormalizado = normalizarTextoCategoria(
        formData.nuevaCategoria
      );
      const { data: existente } = await supabase
        .from("categorias")
        .select("id")
        .eq("nombre_normalizado", nombreNormalizado)
        .maybeSingle();

      if (existente) {
        categoriaFinalId = existente.id;
      } else {
        await supabase.from("categorias_pendientes").insert([
          {
            nombre: formData.nuevaCategoria.trim(),
            nombre_normalizado: nombreNormalizado,
            sugerida_por: usuarioId,
          },
        ]);
        toast("Tu categoria sera revisada.");
      }
    }

    // Inserta la solicitud (cambiado a usuario_id)
    const { error } = await supabase.from("solicitudes").insert([
      {
        usuario_id: usuarioId,
        descripcion: formData.descripcion,
        categoria: categoriaFinalId || null,
        ubicacion: formData.ubicacion,
        requiere_profesional: formData.requiereProfesional,
        latitud: formData.latitud,
        longitud: formData.longitud,
        radio_km: formData.radioKm,
      },
    ]);
    if (error) {
      toast.error("Error al guardar la solicitud.");
    } else {
      setNotificacion("Solicitud publicada con exito.");
      setTimeout(() => setNotificacion(""), 4000);
      setActualizarHistorial((prev: number) => prev + 1);
      setFormData({
        descripcion: "",
        categoriaId: "",
        nuevaCategoria: "",
        ubicacion: "",
        requiereProfesional: false,
        latitud: null,
        longitud: null,
        radioKm: 10,
      });
      setMostrarCampoNueva(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      autoComplete="off"
    >
      <h3 className="text-lg font-semibold text-grey-800">Publicar nueva necesidad</h3>

      <input
        type="text"
        name="descripcion"
        placeholder="Descripcion del trabajo"
        value={formData.descripcion}
        onChange={handleChange}
        required
        className="w-full rounded-md border border-grey-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
      />

      <div>
        <label className="block text-sm font-medium text-grey-700 mb-1">Categoria:</label>
        <div ref={contenedorRef} className="relative">
          <input
            type="text"
            name="nuevaCategoria"
            placeholder="Escribe o selecciona una categoria"
            value={formData.nuevaCategoria}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                nuevaCategoria: e.target.value,
                categoriaId: "", // limpia id si esta escribiendo
              }));
              setMostrarCampoNueva(true);
            }}
            autoComplete="off"
            required
            className="w-full rounded-md border border-grey-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          {mostrarCampoNueva && formData.nuevaCategoria.length > 1 && (
            <ul className="absolute z-20 left-0 right-0 mt-1 bg-white border border-grey-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
              {categorias
                .filter(
                  (cat) =>
                    cat.nombre
                      .toLowerCase()
                      .includes(formData.nuevaCategoria.toLowerCase()) &&
                    cat.nombre.toLowerCase() !==
                      formData.nuevaCategoria.toLowerCase()
                )
                .slice(0, 5)
                .map((cat) => (
                  <li
                    key={cat.id}
                    tabIndex={0}
                    className="px-3 py-2 text-sm text-grey-700 hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        categoriaId: cat.id,
                        nuevaCategoria: cat.nombre,
                      }));
                      setMostrarCampoNueva(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setFormData((prev) => ({
                          ...prev,
                          categoriaId: cat.id,
                          nuevaCategoria: cat.nombre,
                        }));
                        setMostrarCampoNueva(false);
                      }
                    }}
                  >
                    {cat.nombre}
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>

      <input
        type="text"
        name="ubicacion"
        placeholder="Ubicacion o zona"
        value={formData.ubicacion}
        onChange={handleChange}
        className="w-full rounded-md border border-grey-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
      />

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          name="requiereProfesional"
          checked={formData.requiereProfesional}
          onChange={handleChange}
          className="rounded border-grey-300 text-primary focus:ring-primary"
        />
        <span className="text-sm text-grey-700">Requiere titulacion o acreditacion?</span>
      </label>

      <MapaZona
        onChange={async ({ lat, lng, radioKm }) => {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
            );
            const data = await res.json();
            const ciudad =
              data.address.city ||
              data.address.town ||
              data.address.village ||
              "Desconocido";
            setFormData((prev) => ({
              ...prev,
              latitud: lat,
              longitud: lng,
              radioKm,
              ubicacion: ciudad,
            }));
          } catch (error) {
            console.error("Error al obtener ubicacion:", error);
          }
        }}
      />

      <Button
        type="submit"
        variant="primary"
        disabled={!formData.descripcion.trim()}
      >
        Publicar solicitud
      </Button>
    </form>
  );
};

export default NuevaSolicitud;
