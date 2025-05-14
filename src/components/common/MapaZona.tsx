import React, { useEffect, useRef, useState } from "react";
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
import CustomControl from "react-leaflet-custom-control";

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
  const mapRef = useRef<L.Map | null>(null);

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

  const handleCentrarUbicacion = () => {
    if (navigator.geolocation && mapRef.current) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        mapRef.current!.flyTo([latitude, longitude], 15); // o setView
      });
    }
  };

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

  const centro: [number, number] = zonaActiva
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

      <CustomControl position="topright">
        <button
          onClick={volverAMiUbicacion}
          className="leaflet-control-ubicacion"
          aria-label="Centrar ubicación"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="20"
            width="20"
            viewBox="0 0 24 24"
            fill="#4285f4"
          >
            <path d="M0 0h24v24H0z" fill="none" />
            <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0-5c.6 0 1 .4 1 1v2.1c3.4.5 6 3.1 6.5 6.5H21c.6 0 1 .4 1 1s-.4 1-1 1h-2.1c-.5 3.4-3.1 6-6.5 6.5V21c0 .6-.4 1-1 1s-1-.4-1-1v-2.1c-3.4-.5-6-3.1-6.5-6.5H3c-.6 0-1-.4-1-1s.4-1 1-1h2.1c.5-3.4 3.1-6 6.5-6.5V4c0-.6.4-1 1-1z" />
          </svg>
        </button>
      </CustomControl>

      {ubicacion && (
        <MapContainer
          center={centro}
          zoom={13}
          scrollWheelZoom={true}
          dragging={editable}
          style={{ height: "300px", width: "100%", marginTop: "1rem" }}
          ref={(mapInstance) => {
            if (mapInstance && !mapRef.current) {
              mapRef.current = mapInstance;
            }
          }}
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
