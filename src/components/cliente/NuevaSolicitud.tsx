import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";
import MapaZona from "../common/MapaZona";
import { normalizarTextoCategoria } from "../../utils/normalizarTextoCategoria";

interface Props {
  clienteId: string;
  nombre: string;
}

const NuevaSolicitud: React.FC<Props> = ({ clienteId }) => {
  const [formData, setFormData] = useState({
    descripcion: "",
    categoria: "",
    ubicacion: "",
    requiereProfesional: false,
    latitud: null as number | null,
    longitud: null as number | null,
    radioKm: 10,
  });

  const [categoriasExistentes, setCategoriasExistentes] = useState<string[]>(
    []
  );

  useEffect(() => {
    const cargarCategorias = async () => {
      const { data } = await supabase.from("categorias").select("nombre");
      if (data) {
        setCategoriasExistentes(data.map((c) => c.nombre));
      }
    };
    cargarCategorias();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.categoria.trim()) {
      toast.error("Debes introducir una categoría.");
      return;
    }

    const nombreNormalizado = normalizarTextoCategoria(formData.categoria);
    const categoriaExiste = categoriasExistentes.some(
      (c) => normalizarTextoCategoria(c) === nombreNormalizado
    );

    if (!categoriaExiste) {
      const { error: errorPendiente } = await supabase
        .from("categorias_pendientes")
        .insert([
          {
            nombre: formData.categoria.trim(),
            nombre_normalizado: nombreNormalizado,
            sugerida_por: clienteId,
          },
        ]);

      if (errorPendiente) {
        toast.error("No se pudo registrar la nueva categoría (pendiente).");
        return;
      } else {
        toast.success("Categoría sugerida. Será revisada por el equipo.");
      }
    }

    const { error } = await supabase.from("solicitudes").insert([
      {
        cliente_id: clienteId,
        descripcion: formData.descripcion,
        categoria: formData.categoria,
        ubicacion: formData.ubicacion,
        requiere_profesional: formData.requiereProfesional,
        latitud: formData.latitud,
        longitud: formData.longitud,
        radio_km: formData.radioKm,
      },
    ]);

    if (error) {
      toast.error("Error al guardar la solicitud.");
      console.error(error.message);
    } else {
      toast.success("Solicitud publicada con éxito.");
      setFormData({
        descripcion: "",
        categoria: "",
        ubicacion: "",
        requiereProfesional: false,
        latitud: null,
        longitud: null,
        radioKm: 10,
      });
    }
  };

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

      <input
        type="text"
        name="categoria"
        placeholder="Categoría (ej: fontanería, cámara...)"
        value={formData.categoria}
        onChange={handleChange}
        required
      />

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
          onChange={handleChange}
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
