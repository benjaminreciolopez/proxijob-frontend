import React, { useState, useEffect } from "react";
import MapaZona from "../common/MapaZona";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";

interface Props {
  usuarioId: string;
}

async function obtenerCiudad(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );
    const data = await res.json();
    return (
      data.address.city ||
      data.address.town ||
      data.address.village ||
      "Desconocido"
    );
  } catch (error) {
    console.error("Error obteniendo ciudad:", error);
    return "Desconocido";
  }
}

const ZonasOferente: React.FC<Props> = ({ usuarioId }) => {
  const [zonaActivaId, setZonaActivaId] = useState<string | null>(null);
  const [modoEdicion, setModoEdicion] = useState(true);
  const [zonas, setZonas] = useState<any[]>([]);
  const [zonaSeleccionada, setZonaSeleccionada] = useState<{
    lat: number;
    lng: number;
    radioKm: number;
  } | null>(null);

  const zonaActiva = zonas.find((z) => z.id === zonaActivaId) ?? null;

  const cargarZonas = async () => {
    const { data, error } = await supabase
      .from("zonas_trabajo")
      .select("*")
      .eq("usuario_id", usuarioId);

    if (error) {
      toast.error("Error al cargar zonas");
      console.error(error.message);
    } else {
      const zonasConCiudad = await Promise.all(
        data.map(async (zona) => {
          const ciudad = await obtenerCiudad(zona.latitud, zona.longitud);
          return { ...zona, ciudad };
        })
      );
      setZonas(zonasConCiudad);
    }
  };

  useEffect(() => {
    cargarZonas();
  }, [usuarioId]);

  useEffect(() => {
    if (zonaActivaId) {
      setZonaSeleccionada(null); // ← elimina la selección activa
    }
  }, [zonaActivaId]);

  const eliminarZona = async (id: string) => {
    const { error } = await supabase
      .from("zonas_trabajo")
      .delete()
      .eq("id", id);
    if (error) {
      toast.error("Error al eliminar zona");
    } else {
      toast.success("Zona eliminada");
      cargarZonas();
      setZonaActivaId(null);
    }
  };

  const guardarZona = async () => {
    if (!zonaSeleccionada) return;

    const { lat, lng, radioKm } = zonaSeleccionada;
    const { error } = await supabase.from("zonas_trabajo").insert([
      {
        usuario_id: usuarioId,
        latitud: lat,
        longitud: lng,
        radio_km: radioKm,
      },
    ]);

    if (error) {
      toast.error("Error al guardar la zona");
    } else {
      toast.success("Zona guardada correctamente");
      setZonaSeleccionada(null);
      cargarZonas();
    }
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <h3>📍 Mis Zonas de Trabajo</h3>

      <MapaZona
        onChange={setZonaSeleccionada}
        zonaActiva={
          !modoEdicion && zonaActiva
            ? {
                lat: zonaActiva.latitud,
                lng: zonaActiva.longitud,
                radioKm: zonaActiva.radio_km,
              }
            : undefined
        }
        editable={modoEdicion}
      />

      {modoEdicion && zonaSeleccionada && (
        <button
          onClick={guardarZona}
          style={{
            marginTop: "1rem",
            background: "green",
            color: "white",
            padding: "0.5rem 1rem",
          }}
        >
          💾 Guardar esta zona
        </button>
      )}

      <div style={{ marginTop: "1rem" }}>
        <button
          onClick={() => {
            setZonaActivaId(null);
            setModoEdicion(true);
          }}
        >
          ➕ Crear nueva zona
        </button>
      </div>

      {zonas.length > 0 && (
        <ul style={{ marginTop: "1rem" }}>
          {zonas.map((zona, i) => (
            <li key={zona.id}>
              <button
                onClick={() => {
                  setZonaActivaId(zona.id);
                  setModoEdicion(false);
                }}
              >
                📍 Zona {i + 1} ({zona.ciudad}) — {zona.radio_km} km
              </button>
              <button
                onClick={() => eliminarZona(zona.id)}
                style={{ marginLeft: "1rem", color: "red" }}
              >
                ❌ Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ZonasOferente;
