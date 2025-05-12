// src/components/NotificacionFlotante.tsx
import React from "react";
import { motion } from "framer-motion";

interface Props {
  mensaje: string;
  onClose: () => void;
}

const NotificacionFlotante: React.FC<Props> = ({ mensaje, onClose }) => {
  return (
    <motion.div
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -80, opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50"
    >
      <div className="flex items-center gap-3">
        <span>📬 {mensaje}</span>
        <button
          onClick={onClose}
          className="ml-4 bg-white text-blue-600 px-2 py-1 rounded"
        >
          Cerrar
        </button>
      </div>
    </motion.div>
  );
};

export default NotificacionFlotante;
