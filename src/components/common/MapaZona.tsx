import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Circle, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface Props {
  onChange: (coords: { lat: number; lng: number; radioKm: number }) => void;
  zonaActiva?: { lat: number; lng: number; radioKm: number };
  editable?: boolean;
}

const MapaZona: React.FC<Props> = ({
  onChange,
  zonaActiva,
  editable = true,
}) => {
  const [ubicacion, setUbicacion] = useState<{
    lat: number;
    lng: number;
  } | null>(zonaActiva ? { lat: zonaActiva.lat, lng: zonaActiva.lng } : null);

  const [radioKm, setRadioKm] = useState(zonaActiva?.radioKm || 10);

  // Volver a ubicación del navegador
  const volverAMiUbicacion = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUbicacion(coords);
        onChange({ ...coords, radioKm });
      },
      (err) => {
        console.error("Ubicación denegada:", err.message);
      }
    );
  };

  useEffect(() => {
    if (!zonaActiva) {
      volverAMiUbicacion();
    }
  }, []);

  useEffect(() => {
    if (ubicacion) {
      onChange({ ...ubicacion, radioKm });
    }
  }, [radioKm]);

  const ClickHandler = () => {
    useMapEvents({
      click(e) {
        if (!editable) return;
        const coords = { lat: e.latlng.lat, lng: e.latlng.lng };
        setUbicacion(coords);
        onChange({ ...coords, radioKm });
      },
    });
    return null;
  };

  const centro = zonaActiva
    ? [zonaActiva.lat, zonaActiva.lng]
    : ubicacion
    ? [ubicacion.lat, ubicacion.lng]
    : [0, 0];

  return (
    <div style={{ marginTop: "1rem", position: "relative" }}>
      <label>
        Radio de búsqueda: {radioKm} km
        <input
          type="range"
          min={1}
          max={500}
          value={radioKm}
          onChange={(e) => setRadioKm(parseInt(e.target.value))}
          disabled={!editable}
        />
      </label>

      {/* Botón fuera del mapa, pero superpuesto */}
      <button
        onClick={volverAMiUbicacion}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          zIndex: 1000,
          background: "white",
          border: "1px solid #ccc",
          borderRadius: "4px",
          padding: "4px 8px",
          cursor: "pointer",
        }}
      >
        Volver a mi ubicación
      </button>

      {ubicacion && (
        <MapContainer
          center={centro as [number, number]}
          zoom={12}
          scrollWheelZoom={true}
          dragging={editable}
          style={{ height: "300px", width: "100%", marginTop: "1rem" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Circle
            center={centro as [number, number]}
            radius={radioKm * 1000}
            pathOptions={{ color: "blue" }}
          />
          <ClickHandler />
        </MapContainer>
      )}
    </div>
  );
};

export default MapaZona;
