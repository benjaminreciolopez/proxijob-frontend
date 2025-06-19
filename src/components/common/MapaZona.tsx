// src/components/common/MapaZona.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Circle,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
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
  const [busqueda, setBusqueda] = useState("");
  const [sugerencias, setSugerencias] = useState<any[]>([]);
  const [volviendo, setVolviendo] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const autocompletarRef = useRef<HTMLDivElement | null>(null);

  // Centrar al usuario (solo al cargar o con botón)
  const volverAMiUbicacion = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUbicacion(coords);
        setVolviendo(true);
        onChange({ ...coords, radioKm });
      },
      (err) => {
        alert("No se pudo obtener tu ubicación: " + err.message);
      }
    );
  };

  // Carga inicial: centra en usuario si no hay zona activa
  useEffect(() => {
    if (!zonaActiva) volverAMiUbicacion();
    // eslint-disable-next-line
  }, []);

  // Cuando cambia el radio, notifica al padre
  useEffect(() => {
    if (ubicacion) onChange({ ...ubicacion, radioKm });
    // eslint-disable-next-line
  }, [radioKm]);

  // Cerrar autocompletar al hacer click fuera
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        autocompletarRef.current &&
        !autocompletarRef.current.contains(e.target as Node)
      ) {
        setSugerencias([]);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Buscar sugerencias por nombre
  useEffect(() => {
    if (busqueda.length < 3) {
      setSugerencias([]);
      return;
    }
    const delay = setTimeout(() => {
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

  // Selección de sugerencia
  const seleccionarSugerencia = (sug: any) => {
    const coords = { lat: parseFloat(sug.lat), lng: parseFloat(sug.lon) };
    setUbicacion(coords);
    setBusqueda(sug.display_name);
    setSugerencias([]);
    setVolviendo(true);
    onChange({ ...coords, radioKm });
  };

  // Click en el mapa
  const ClickHandler = () => {
    useMapEvents({
      click(e) {
        if (!editable) return;
        const coords = { lat: e.latlng.lat, lng: e.latlng.lng };
        setUbicacion(coords);
        setBusqueda("");
        onChange({ ...coords, radioKm });
      },
    });
    return null;
  };

  // Centrar con animación al cambiar ubicación
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

  // Detección del centro de mapa
  const centro: [number, number] = ubicacion
    ? [ubicacion.lat, ubicacion.lng]
    : [37.18817, -3.60667]; // Granada por defecto si no hay ubicación

  // ESTILO PROXIJOB:
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.7rem",
    borderRadius: 8,
    border: "1.5px solid #0095f6",
    fontSize: 16,
    marginBottom: 6,
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontWeight: 600,
    marginBottom: 4,
    display: "block",
    color: "#2a3856",
  };

  return (
    <div style={{ marginTop: "1rem", position: "relative" }}>
      <label style={labelStyle}>
        Radio de búsqueda: {radioKm} km
        <input
          type="range"
          min={1}
          max={50}
          value={radioKm}
          onChange={(e) => setRadioKm(Number(e.target.value))}
          disabled={!editable}
          style={{
            marginLeft: 12,
            verticalAlign: "middle",
            accentColor: "#007be5",
          }}
        />
      </label>

      <div ref={autocompletarRef} style={{ position: "relative" }}>
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar ciudad o calle..."
          style={inputStyle}
          disabled={!editable}
          autoComplete="off"
        />
        {sugerencias.length > 0 && (
          <ul
            className="autocomplete-zonas"
            style={{
              listStyle: "none",
              margin: 0,
              padding: "0.5rem",
              background: "white",
              border: "1.5px solid #007be5",
              borderTop: "none",
              maxHeight: "180px",
              overflowY: "auto",
              position: "absolute",
              zIndex: 1000,
              width: "100%",
              borderRadius: "0 0 8px 8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            {sugerencias.map((s, idx) => (
              <li
                key={idx}
                tabIndex={0}
                onClick={() => seleccionarSugerencia(s)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    seleccionarSugerencia(s);
                  }
                }}
                style={{
                  padding: "0.45rem 0.8rem",
                  cursor: "pointer",
                  fontSize: 15,
                  color: "#234",
                  borderBottom:
                    idx < sugerencias.length - 1 ? "1px solid #eef" : "none",
                  background: "#f8fbff",
                }}
              >
                {s.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {ubicacion && (
        <MapContainer
          center={centro}
          zoom={13}
          scrollWheelZoom={true}
          dragging={editable}
          style={{
            height: 300,
            width: "100%",
            marginTop: 14,
            borderRadius: 12,
            boxShadow: "0 2px 10px #0001",
          }}
          ref={(mapInstance) => {
            if (mapInstance && !mapRef.current) {
              mapRef.current = mapInstance;
            }
          }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Circle
            center={centro}
            radius={radioKm * 1000}
            pathOptions={{ color: "#007be5", fillOpacity: 0.18 }}
          />
          <Marker
            position={[ubicacion.lat, ubicacion.lng]}
            icon={iconoCentro}
          />
          <ClickHandler />
          <FlyToUbicacion />

          {/* Botón para centrar en tu ubicación actual */}
          <CustomControl position="topright">
            <button
              onClick={volverAMiUbicacion}
              aria-label="Centrar en mi ubicación"
              title="Centrar en mi ubicación"
              style={{
                background: "#007be5",
                color: "white",
                border: "none",
                borderRadius: 7,
                padding: "0.35rem 0.7rem",
                fontWeight: 600,
                cursor: "pointer",
                margin: "0.7rem 0.7rem 0 0",
                boxShadow: "0 2px 6px #007be544",
              }}
            >
              📍 Mi ubicación
            </button>
          </CustomControl>
        </MapContainer>
      )}
    </div>
  );
};

export default MapaZona;
