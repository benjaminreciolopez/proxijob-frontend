import React from "react";
import type { Pago, EstadoPago } from "../../types";
import { Card, Badge } from "../ui";

interface PagoCardProps {
  pago: Pago;
  tipo: "realizado" | "recibido";
}

const estadoBadgeVariant: Record<EstadoPago, "warning" | "success" | "error" | "info"> = {
  pendiente: "warning",
  completado: "success",
  fallido: "error",
  reembolsado: "info",
};

const estadoLabel: Record<EstadoPago, string> = {
  pendiente: "Pendiente",
  completado: "Completado",
  fallido: "Fallido",
  reembolsado: "Reembolsado",
};

function formatMonto(monto: number, moneda: string): string {
  const symbol = moneda === "EUR" ? "\u20AC" : moneda === "USD" ? "$" : moneda;
  return `${symbol}${monto.toFixed(2)}`;
}

function formatFecha(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const PagoCard: React.FC<PagoCardProps> = ({ pago, tipo }) => {
  const estado = pago.estado as EstadoPago;

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xl font-bold text-grey-800">
          {tipo === "realizado" ? "-" : "+"}
          {formatMonto(pago.monto, pago.moneda)}
        </span>
        <Badge variant={estadoBadgeVariant[estado] ?? "default"}>
          {estadoLabel[estado] ?? pago.estado}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-grey-500">
        {pago.metodo_pago && (
          <span className="flex items-center gap-1">
            <span className="text-grey-400">Metodo:</span>
            <span className="text-grey-600 capitalize">{pago.metodo_pago}</span>
          </span>
        )}
        <span className="flex items-center gap-1">
          <span className="text-grey-400">Moneda:</span>
          <span className="text-grey-600 uppercase">{pago.moneda}</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="text-grey-400">Fecha:</span>
          <span className="text-grey-600">{formatFecha(pago.created_at)}</span>
        </span>
      </div>
    </Card>
  );
};

export default PagoCard;
