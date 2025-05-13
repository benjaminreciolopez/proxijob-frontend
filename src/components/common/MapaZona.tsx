import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Circle,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Marker, Icon } from "leaflet";
import { Marker as RLMarker } from "react-leaflet";
import L from "leaflet";

const iconoCentro = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

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
  const [volviendo, setVolviendo] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [sugerencias, setSugerencias] = useState<any[]>([]);

  const volverAMiUbicacion = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUbicacion(coords);
        onChange({ ...coords, radioKm });
        setVolviendo(true);
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

  useEffect(() => {
    const delay = setTimeout(() => {
      if (busqueda.length < 3) {
        setSugerencias([]);
        return;
      }

      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          busqueda
        )}`
      )
        .then((res) => res.json())
        .then((data) => setSugerencias(data.slice(0, 5)))
        .catch(() => setSugerencias([]));
    }, 400);

    return () => clearTimeout(delay);
  }, [busqueda]);

  const seleccionarSugerencia = (sug: any) => {
    const coords = { lat: parseFloat(sug.lat), lng: parseFloat(sug.lon) };
    setUbicacion(coords);
    setBusqueda(sug.display_name);
    setSugerencias([]);
    onChange({ ...coords, radioKm });
    setVolviendo(true);
  };

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

  const FlyToUbicacion = () => {
    const map = useMap();
    useEffect(() => {
      if (ubicacion && volviendo) {
        map.flyTo([ubicacion.lat, ubicacion.lng], 13);
        setVolviendo(false);
      }
    }, [ubicacion, volviendo]);
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
      {busqueda && (
        <p style={{ fontSize: "0.9rem", marginTop: "0.5rem", color: "#555" }}>
          📍 Ubicación seleccionada: <strong>{busqueda}</strong>
        </p>
      )}

      <div style={{ marginTop: "0.5rem", position: "relative" }}>
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar ciudad o calle..."
          style={{ width: "100%", padding: "0.5rem" }}
          disabled={!editable}
        />
        {sugerencias.length > 0 && (
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: "0.5rem",
              background: "white",
              border: "1px solid #ccc",
              maxHeight: "150px",
              overflowY: "auto",
              position: "absolute",
              zIndex: 1000,
              width: "100%",
            }}
          >
            {sugerencias.map((s, idx) => (
              <li
                key={idx}
                onClick={() => seleccionarSugerencia(s)}
                style={{
                  padding: "0.3rem 0",
                  cursor: "pointer",
                }}
              >
                {s.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

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
          zoom={13}
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
          {ubicacion && (
            <RLMarker
              position={[ubicacion.lat, ubicacion.lng]}
              icon={iconoCentro}
            />
          )}

          <ClickHandler />
          <FlyToUbicacion />
        </MapContainer>
      )}
    </div>
  );
};

export default MapaZona;
