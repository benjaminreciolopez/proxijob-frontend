import React, { useState, useEffect } from "react";
import MapaZona from "./common/MapaZona";
import { supabase } from "./../supabaseClient";
import toast from "react-hot-toast";
import Button from "./ui/Button";
import EmptyState from "./ui/EmptyState";

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

const ZonasTrabajo: React.FC<Props> = ({ usuarioId }) => {
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

    // Verificar duplicados aproximados
    const yaExiste = zonas.some((zona) => {
      const mismaLat = Math.abs(zona.latitud - lat) < 0.0001;
      const mismaLng = Math.abs(zona.longitud - lng) < 0.0001;
      const mismoRadio = Math.abs(zona.radio_km - radioKm) < 1;
      return mismaLat && mismaLng && mismoRadio;
    });

    if (yaExiste) {
      toast.error("Esta zona ya ha sido registrada.");
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
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-grey-800">Mis zonas de trabajo</h3>

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

      <div className="flex items-center gap-3">
        {modoEdicion && zonaSeleccionada && (
          <Button variant="success" type="button" onClick={guardarZona}>
            Guardar esta zona
          </Button>
        )}

        <Button
          variant="outline"
          type="button"
          onClick={() => {
            setZonaActivaId(null);
            setModoEdicion(true);
          }}
        >
          Crear nueva zona
        </Button>
      </div>

      {zonas.length === 0 ? (
        <EmptyState
          icon="📍"
          title="Sin zonas de trabajo"
          description="No has registrado ninguna zona de trabajo todavia."
        />
      ) : (
        <ul className="space-y-2">
          {zonas.map((zona, i) => (
            <li
              key={zona.id}
              className={`flex items-center justify-between gap-3 bg-white rounded-lg border border-grey-200 shadow-sm p-3 transition-all ${
                zonaActivaId === zona.id ? "ring-2 ring-primary/20" : ""
              }`}
            >
              <button
                type="button"
                aria-label={`Ver zona ${i + 1}`}
                onClick={() => {
                  setZonaActivaId(zona.id);
                  setModoEdicion(false);
                }}
                className="flex-1 text-left text-sm text-grey-700 hover:text-primary transition-colors cursor-pointer"
              >
                📍 Zona {i + 1} ({zona.ciudad}) - {zona.radio_km} km
              </button>
              <Button
                variant="danger"
                size="sm"
                type="button"
                aria-label={`Eliminar zona ${i + 1}`}
                onClick={() => eliminarZona(zona.id)}
              >
                Eliminar
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ZonasTrabajo;
