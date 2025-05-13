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
      setZonaSeleccionada(null);
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

    const yaExiste = zonas.some((zona) => {
      const mismaLat = Math.abs(zona.latitud - lat) < 0.0001;
      const mismaLng = Math.abs(zona.longitud - lng) < 0.0001;
      const mismoRadio = Math.abs(zona.radio_km - radioKm) < 1;
      return mismaLat && mismaLng && mismoRadio;
    });

    if (yaExiste) {
      toast.error("⚠️ Esta zona ya ha sido registrada.");
      return;
    }

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
    <div className="zonas-container">
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
        <button className="zonas-boton" type="button" onClick={guardarZona}>
          💾 Guardar esta zona
        </button>
      )}

      <div style={{ marginTop: "1rem" }}>
        <button
          className="zonas-boton-secundario"
          type="button"
          onClick={() => {
            setZonaActivaId(null);
            setModoEdicion(true);
          }}
        >
          ➕ Crear nueva zona
        </button>
      </div>

      {zonas.length > 0 && (
        <ul className="zonas-lista">
          {zonas.map((zona, i) => (
            <li key={zona.id} className="zonas-item">
              <button
                type="button"
                aria-label={`Ver zona ${i + 1}`}
                onClick={() => {
                  setZonaActivaId(zona.id);
                  setModoEdicion(false);
                }}
              >
                📍 Zona {i + 1} ({zona.ciudad}) — {zona.radio_km} km
              </button>
              <button
                type="button"
                aria-label={`Eliminar zona ${i + 1}`}
                onClick={() => eliminarZona(zona.id)}
                style={{ color: "red" }}
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
