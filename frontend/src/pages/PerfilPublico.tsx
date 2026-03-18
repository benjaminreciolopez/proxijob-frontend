import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import { Skeleton, SkeletonCard } from "../components/ui/Skeleton";
import ReviewList from "../components/perfil/ReviewList";

interface Usuario {
  id: string;
  nombre: string;
  tratamiento: string;
  descripcion: string;
  verificado: boolean;
}

interface Categoria {
  id: string;
  nombre: string;
}

interface Review {
  id: string;
  puntuacion: number;
  comentario: string;
  autor_nombre: string;
  created_at: string;
}

function getInitials(nombre: string): string {
  return nombre
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getAvatarColor(nombre: string): string {
  const colors = [
    "bg-primary",
    "bg-indigo",
    "bg-success",
    "bg-warning",
    "bg-error",
    "bg-navy",
    "bg-primary-dark",
  ];
  let hash = 0;
  for (let i = 0; i < nombre.length; i++) {
    hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function StarRatingDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 items-center">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`text-lg ${n <= Math.round(rating) ? "text-warning" : "text-grey-300"}`}
        >
          ★
        </span>
      ))}
      <span className="text-sm text-grey-600 ml-1 font-medium">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

const PerfilPublico: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchPerfil() {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch user data
        const { data: userData, error: userError } = await supabase
          .from("usuarios")
          .select("id, nombre, tratamiento, descripcion, verificado")
          .eq("id", id)
          .single();

        if (userError || !userData) {
          setError("No se pudo encontrar este perfil.");
          setIsLoading(false);
          return;
        }
        setUsuario(userData);

        // Fetch categories
        const { data: catData } = await supabase
          .from("categorias_usuario")
          .select("categoria_id, categorias(id, nombre)")
          .eq("usuario_id", id);

        if (catData) {
          const cats: Categoria[] = catData
            .map((c: any) => c.categorias)
            .filter(Boolean);
          setCategorias(cats);
        }

        // Fetch reviews
        const { data: reviewData } = await supabase
          .from("reseñas")
          .select("id, puntuacion, comentario, autor_nombre, created_at")
          .eq("destinatario_id", id)
          .order("created_at", { ascending: false });

        if (reviewData) {
          setReviews(reviewData);
        }
      } catch {
        setError("Error al cargar el perfil.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPerfil();
  }, [id]);

  // Calculate stats
  const reviewCount = reviews.length;
  const avgRating =
    reviewCount > 0
      ? reviews.reduce((sum, r) => sum + r.puntuacion, 0) / reviewCount
      : 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-grey-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="h-8 w-24 bg-grey-200 rounded-md animate-pulse" />
          </div>
          <SkeletonCard className="mb-6" />
          <div className="flex gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 flex-1 bg-grey-200 rounded-lg animate-pulse" />
            ))}
          </div>
          <Skeleton lines={2} className="mb-6" />
          <SkeletonCard />
          <SkeletonCard className="mt-4" />
        </div>
      </div>
    );
  }

  // Error or not found
  if (error || !usuario) {
    return (
      <div className="min-h-screen bg-grey-50 flex items-center justify-center px-4">
        <div className="text-center">
          <EmptyState
            icon="😕"
            title="Perfil no encontrado"
            description={error || "Este usuario no existe o no esta disponible."}
            action={{
              label: "Volver",
              onClick: () => navigate(-1),
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-grey-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            ← Volver
          </Button>
        </div>

        {/* Header card */}
        <Card className="mb-6">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0 ${getAvatarColor(usuario.nombre)}`}
            >
              {getInitials(usuario.nombre)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-grey-800">
                  {usuario.nombre}
                </h1>
                {usuario.verificado && (
                  <Badge variant="success">Verificado</Badge>
                )}
              </div>
              {usuario.tratamiento && (
                <p className="text-sm text-primary font-medium mt-0.5">
                  {usuario.tratamiento}
                </p>
              )}
              {usuario.descripcion && (
                <p className="text-sm text-grey-600 mt-2 leading-relaxed">
                  {usuario.descripcion}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="text-center !p-4">
            <div className="flex flex-col items-center">
              {reviewCount > 0 ? (
                <StarRatingDisplay rating={avgRating} />
              ) : (
                <span className="text-grey-400 text-sm">Sin rating</span>
              )}
              <span className="text-xs text-grey-500 mt-1">Valoracion</span>
            </div>
          </Card>
          <Card className="text-center !p-4">
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-grey-800">{reviewCount}</span>
              <span className="text-xs text-grey-500 mt-1">
                {reviewCount === 1 ? "Resena" : "Resenas"}
              </span>
            </div>
          </Card>
          <Card className="text-center !p-4">
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-grey-800">{categorias.length}</span>
              <span className="text-xs text-grey-500 mt-1">
                {categorias.length === 1 ? "Categoria" : "Categorias"}
              </span>
            </div>
          </Card>
        </div>

        {/* Categories */}
        {categorias.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-grey-700 mb-2">Categorias</h2>
            <div className="flex flex-wrap gap-2">
              {categorias.map((cat) => (
                <Badge key={cat.id} variant="info">
                  {cat.nombre}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div>
          <h2 className="text-sm font-semibold text-grey-700 mb-3">
            Resenas ({reviewCount})
          </h2>
          <ReviewList reviews={reviews} isLoading={false} />
        </div>
      </div>
    </div>
  );
};

export default PerfilPublico;
