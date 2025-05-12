import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";
import MapaZona from "../common/MapaZona";
import { normalizarTextoCategoria } from "../../utils/normalizarTextoCategoria";

interface Props {
  clienteId: string;
  nombre: string;
  setNotificacion: (mensaje: string) => void;
}

const NuevaSolicitud: React.FC<Props> = ({ clienteId, setNotificacion }) => {
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

  useEffect(() => {
    const cargarCategorias = async () => {
      const { data, error } = await supabase
        .from("categorias")
        .select("id, nombre");
      if (error) {
        toast.error("No se pudieron cargar las categorías");
        return;
      }
      setCategorias(data || []);
    };
    cargarCategorias();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target;

    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [target.name]: target.checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [target.name]: target.value,
      }));
    }
  };

  const handleCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const valor = e.target.value;
    setFormData((prev) => ({ ...prev, categoriaId: valor }));
    setMostrarCampoNueva(valor === "otras");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let categoriaFinalId = formData.categoriaId;

    if (categoriaFinalId === "otras" && formData.nuevaCategoria.trim()) {
      const nombreNormalizado = normalizarTextoCategoria(
        formData.nuevaCategoria
      );

      const { data: existente } = await supabase
        .from("categorias")
        .select("id")
        .eq("nombre_normalizado", nombreNormalizado)
        .single();

      if (existente) {
        categoriaFinalId = existente.id;
      } else {
        await supabase.from("categorias_pendientes").insert([
          {
            nombre: formData.nuevaCategoria.trim(),
            nombre_normalizado: nombreNormalizado,
            sugerida_por: clienteId,
          },
        ]);
        toast("Tu categoría será revisada");
      }
    }

    const { error } = await supabase.from("solicitudes").insert([
      {
        cliente_id: clienteId,
        descripcion: formData.descripcion,
        categoria: categoriaFinalId !== "otras" ? categoriaFinalId : null,
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
      setNotificacion("✅ Solicitud publicada con éxito.");
      setTimeout(() => setNotificacion(""), 5000);

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
  const contenedorRef = useRef<HTMLDivElement>(null);

  // Cierre de sugerencias al hacer clic fuera
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

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "2rem" }}>
      <h3>📢 Publicar nueva necesidad</h3>

      <input
        type="text"
        name="descripcion"
        placeholder="Descripción del trabajo"
        value={formData.descripcion}
        onChange={handleChange}
        required
      />

      <label>Categoría:</label>
      <div ref={contenedorRef} style={{ position: "relative" }}>
        <input
          type="text"
          name="nuevaCategoria"
          placeholder="Escribe o selecciona una categoría"
          value={formData.nuevaCategoria}
          onChange={(e) => {
            setFormData((prev) => ({
              ...prev,
              nuevaCategoria: e.target.value,
              categoriaId: "", // Limpiar selección anterior
            }));
            setMostrarCampoNueva(true);
          }}
          autoComplete="off"
          required
        />

        {mostrarCampoNueva && formData.nuevaCategoria.length > 1 && (
          <ul
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 10,
              background: "white",
              border: "1px solid #ccc",
              listStyle: "none",
              margin: 0,
              padding: 0,
              maxHeight: "150px",
              overflowY: "auto",
            }}
          >
            {categorias
              .filter((cat) =>
                cat.nombre
                  .toLowerCase()
                  .includes(formData.nuevaCategoria.toLowerCase())
              )
              .map((cat) => (
                <li
                  key={cat.id}
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      categoriaId: cat.id,
                      nuevaCategoria: cat.nombre,
                    }));
                    setMostrarCampoNueva(false);
                  }}
                  style={{
                    padding: "0.5rem",
                    borderBottom: "1px solid #eee",
                    cursor: "pointer",
                  }}
                >
                  {cat.nombre}
                </li>
              ))}
          </ul>
        )}
      </div>

      <input
        type="text"
        name="ubicacion"
        placeholder="Ubicación o zona"
        value={formData.ubicacion}
        onChange={handleChange}
      />

      <label>
        <input
          type="checkbox"
          name="requiereProfesional"
          checked={formData.requiereProfesional}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              requiereProfesional: e.target.checked,
            }))
          }
        />
        ¿Requiere titulación o acreditación?
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
            console.error("Error al obtener ubicación:", error);
          }
        }}
      />

      {formData.latitud && formData.longitud && (
        <button
          type="submit"
          style={{
            marginTop: "1rem",
            background: "green",
            color: "white",
            padding: "0.5rem 1rem",
          }}
        >
          📍 Guardar ubicación y publicar
        </button>
      )}
    </form>
  );
};

export default NuevaSolicitud;
