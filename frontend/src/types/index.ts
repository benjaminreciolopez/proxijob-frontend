export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  descripcion?: string;
  especialidad?: string;
  tratamiento?: string;
  rol: string;
  verificado?: boolean;
  avatar_url?: string;
  created_at?: string;
}

export interface Solicitud {
  id: string;
  usuario_id: string;
  descripcion: string;
  categoria: string;
  ubicacion: string;
  requiere_profesional: boolean;
  latitud?: number;
  longitud?: number;
  radio_km?: number;
  estado: string;
  created_at: string;
  // Joined fields
  usuarios?: Pick<Usuario, "nombre" | "tratamiento">;
}

export interface Postulacion {
  id: string;
  solicitud_id: string;
  usuario_id: string;
  mensaje?: string;
  estado: string;
  created_at: string;
  // Joined fields
  usuarios?: Pick<Usuario, "nombre" | "tratamiento" | "email">;
  solicitudes?: Pick<Solicitud, "descripcion" | "categoria" | "ubicacion" | "usuario_id">;
}

export interface Mensaje {
  id: string;
  solicitud_id: string;
  emisor_id: string;
  receptor_id: string;
  contenido: string;
  nombre_emisor: string;
  created_at: string;
}

export interface Documento {
  id: string;
  usuario_id: string;
  tipo: string;
  titulo: string;
  url: string;
  created_at: string;
}

export interface ZonaTrabajo {
  id: string;
  usuario_id: string;
  latitud: number;
  longitud: number;
  radio_km: number;
  nombre_ciudad?: string;
  created_at?: string;
}

export interface Reseña {
  id: string;
  autor_id: string;
  destinatario_id: string;
  solicitud_id: string;
  puntuacion: number;
  comentario: string;
  tipo: string;
  autor_nombre?: string;
  destinatario_n?: string;
  created_at: string;
}

export interface Categoria {
  id: string;
  nombre: string;
  nombre_normalizado?: string;
  revisada?: boolean;
}

export interface CategoriaPendiente {
  id: string;
  nombre: string;
  nombre_normalizado?: string;
  sugerida_por?: string;
  revisada: boolean;
  creada_en?: string;
}

export interface Notificacion {
  id: string;
  usuario_id: string;
  tipo: string;
  titulo: string;
  mensaje?: string;
  leida: boolean;
  referencia_id?: string;
  referencia_tipo?: string;
  created_at: string;
}

export interface Pago {
  id: string;
  solicitud_id?: string;
  pagador_id: string;
  receptor_id: string;
  monto: number;
  moneda: string;
  estado: string;
  metodo_pago?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaccion {
  id: string;
  pago_id: string;
  tipo: string;
  monto: number;
  estado: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export type EstadoPostulacion = "pendiente" | "preseleccionado" | "aceptado" | "rechazado";
export type EstadoSolicitud = "pendiente" | "aceptado" | "completado" | "cancelado";
export type EstadoPago = "pendiente" | "completado" | "fallido" | "reembolsado";

// Role types
export type UserRole = "cliente" | "profesional" | "admin";

// Aliases for renamed concepts (Postulacion -> Propuesta)
export type Propuesta = Postulacion;
export type EstadoPropuesta = EstadoPostulacion;
