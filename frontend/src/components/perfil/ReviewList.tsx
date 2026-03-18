import React from "react";
import Card from "../ui/Card";
import { Skeleton } from "../ui/Skeleton";
import EmptyState from "../ui/EmptyState";

interface Review {
  id: string;
  puntuacion: number;
  comentario: string;
  autor_nombre: string;
  created_at: string;
}

interface ReviewListProps {
  reviews: Review[];
  isLoading: boolean;
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMin < 1) return "Justo ahora";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} dias`;
  if (diffWeeks < 5) return `Hace ${diffWeeks} semana${diffWeeks > 1 ? "s" : ""}`;
  if (diffMonths < 12) return `Hace ${diffMonths} mes${diffMonths > 1 ? "es" : ""}`;
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`text-lg ${n <= rating ? "text-warning" : "text-grey-300"}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => (
  <Card className="mb-3">
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <StarRating rating={review.puntuacion} />
          <span className="text-xs text-grey-400">
            {formatRelativeDate(review.created_at)}
          </span>
        </div>
        {review.comentario && (
          <p className="text-sm text-grey-700 mt-1">{review.comentario}</p>
        )}
        <p className="text-xs text-grey-500 mt-2 font-medium">
          {review.autor_nombre || "Usuario anonimo"}
        </p>
      </div>
    </div>
  </Card>
);

const ReviewListSkeleton: React.FC = () => (
  <div className="space-y-3">
    {Array.from({ length: 3 }).map((_, i) => (
      <Card key={i}>
        <Skeleton lines={2} />
        <div className="mt-2">
          <div className="h-3 w-24 bg-grey-200 rounded-sm animate-pulse" />
        </div>
      </Card>
    ))}
  </div>
);

const ReviewList: React.FC<ReviewListProps> = ({ reviews, isLoading }) => {
  if (isLoading) {
    return <ReviewListSkeleton />;
  }

  if (reviews.length === 0) {
    return (
      <EmptyState
        icon="📝"
        title="Sin resenas todavia"
        description="Este usuario aun no ha recibido resenas."
      />
    );
  }

  return (
    <div className="space-y-0">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
};

export default ReviewList;
