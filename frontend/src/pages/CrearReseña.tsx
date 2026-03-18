import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";

const CrearReseña: React.FC = () => {
  const [searchParams] = useSearchParams();
  const solicitud_id = searchParams.get("solicitud_id");
  const autor_id = searchParams.get("usuario_id");
  const destinatario_id = searchParams.get("destinatario_id");
  const nombre_destinatario =
    searchParams.get("nombre") || "Usuario desconocido";
  const tipo = searchParams.get("tipo"); // "cliente", "oferente", etc.
  const autor_nombre = searchParams.get("autor_nombre") || ""; // puede venir vacío

  const [puntuacion, setPuntuacion] = useState<number>(0);
  const [hoverStar, setHoverStar] = useState<number>(0);
  const [comentario, setComentario] = useState("");
  const [enviada, setEnviada] = useState(false);
  const [yaExiste, setYaExiste] = useState(false);
  const navigate = useNavigate();

  // Comprobación: ¿faltan parámetros críticos?
  if (!tipo || !autor_id || !destinatario_id) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl text-error mb-2">Error</h2>
          <p className="text-grey-600 mb-6">
            Faltan datos para dejar una reseña. Vuelve a intentarlo desde la
            plataforma.
          </p>
          <Button variant="primary" onClick={() => navigate(-1)}>
            Volver atrás
          </Button>
        </div>
      </div>
    );
  }

  // ¿Ya existe reseña?
  useEffect(() => {
    if (!tipo || !autor_id || !destinatario_id) return;
    let filtro: any = { autor_id, tipo, destinatario_id };
    if (solicitud_id) filtro.solicitud_id = solicitud_id;
    async function checkExistente() {
      const { data } = await supabase
        .from("reseñas")
        .select("id")
        .match(filtro)
        .maybeSingle();
      setYaExiste(!!data);
    }
    checkExistente();
    // eslint-disable-next-line
  }, [tipo, autor_id, destinatario_id, solicitud_id]);

  const handleEnviar = async () => {
    if (!puntuacion) {
      toast.error("Selecciona una puntuación.");
      return;
    }
    if (puntuacion >= 4 && comentario.trim() === "") {
      toast.error("Por favor, añade un comentario si la puntuación es alta.");
      return;
    }
    if (yaExiste) {
      toast.error("Ya has dejado una reseña.");
      return;
    }

    const nuevaReseña: any = {
      tipo,
      autor_id,
      autor_nombre,
      solicitud_id: solicitud_id || null,
      destinatario_id,
      destinatario_n: nombre_destinatario,
      puntuacion,
      comentario,
    };

    const { error } = await supabase.from("reseñas").insert([nuevaReseña]);
    if (error) {
      toast.error("Error al guardar la reseña.");
      console.error(error);
    } else {
      setEnviada(true);
      toast.success("¡Gracias por tu reseña!");
      setTimeout(() => navigate(-1), 1200);
    }
  };

  if (yaExiste) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl text-warning mb-2">Reseña ya enviada</h2>
          <p className="text-grey-600 mb-6">
            Ya has dejado una reseña para {nombre_destinatario}.
          </p>
          <Button variant="primary" onClick={() => navigate(-1)}>
            Volver atrás
          </Button>
        </div>
      </div>
    );
  }

  if (enviada) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl text-success mb-2">¡Reseña enviada!</h2>
          <p className="text-grey-600">Gracias por tu valoración.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl text-grey-800 mb-1">Deja tu reseña</h2>
        <p className="text-grey-500 mb-6">
          Para: <span className="font-semibold text-grey-700">{nombre_destinatario}</span>
        </p>

        {/* Star rating */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-grey-700 mb-2">
            Puntuación
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPuntuacion(n)}
                onMouseEnter={() => setHoverStar(n)}
                onMouseLeave={() => setHoverStar(0)}
                className={`text-3xl transition-transform duration-150 hover:scale-110 cursor-pointer
                  ${
                    n <= (hoverStar || puntuacion)
                      ? "text-warning drop-shadow-sm"
                      : "text-grey-300"
                  }
                `}
                aria-label={`${n} estrella${n > 1 ? "s" : ""}`}
              >
                ★
              </button>
            ))}
          </div>
          {puntuacion > 0 && (
            <p className="text-xs text-grey-500 mt-1">
              {puntuacion} de 5 estrellas
            </p>
          )}
        </div>

        {/* Comment */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-grey-700 mb-2">
            Comentario
            {puntuacion >= 4 && (
              <span className="text-error ml-1">*</span>
            )}
          </label>
          <textarea
            placeholder="Comentario (obligatorio si das 4 o 5 estrellas)"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 text-sm border border-grey-300 rounded-md
              bg-white text-grey-800 placeholder:text-grey-400 resize-y
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
              transition-colors"
          />
        </div>

        <Button
          variant="success"
          size="lg"
          fullWidth
          onClick={handleEnviar}
        >
          Enviar reseña
        </Button>
      </div>
    </div>
  );
};

export default CrearReseña;
