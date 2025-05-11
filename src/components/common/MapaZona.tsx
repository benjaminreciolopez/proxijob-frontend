import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Circle,
  useMapEvents,
  useMap,
} from "react-leaflet";
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
  const [ubicacionInicial, setUbicacionInicial] = useState<{
    lat: number;
    lng: number;
  } | null>(zonaActiva ? { lat: zonaActiva.lat, lng: zonaActiva.lng } : null);

  const [radioKm, setRadioKm] = useState(zonaActiva?.radioKm || 10);

  useEffect(() => {
    if (!zonaActiva) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setUbicacion(coords);
          setUbicacionInicial(coords);
        },
        (err) => {
          console.error("Ubicación denegada:", err.message);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (ubicacion) {
      onChange({ ...ubicacion, radioKm });
    }
  }, [ubicacion, radioKm]);

  const ClickHandler = () => {
    useMapEvents({
      click(e) {
        if (!editable) return;
        const coords = { lat: e.latlng.lat, lng: e.latlng.lng };
        setUbicacion(coords);
      },
    });
    return null;
  };

  const BotonVolver = ({
    coords,
  }: {
    coords: { lat: number; lng: number };
  }) => {
    const map = useMap();
    return (
      <button
        onClick={() => map.setView([coords.lat, coords.lng], 12)}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 1000,
          backgroundColor: "#fff",
          border: "1px solid #ccc",
          borderRadius: "6px",
          padding: "5px 10px",
          cursor: "pointer",
        }}
      >
        Volver a mi ubicación
      </button>
    );
  };

  const centro = ubicacion
    ? [ubicacion.lat, ubicacion.lng]
    : zonaActiva
    ? [zonaActiva.lat, zonaActiva.lng]
    : [0, 0];

  return (
    <div style={{ marginTop: "1rem" }}>
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
          {ubicacionInicial && <BotonVolver coords={ubicacionInicial} />}
          <ClickHandler />
        </MapContainer>
      )}
    </div>
  );
};

export default MapaZona;
