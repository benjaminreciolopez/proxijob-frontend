// src/components/NotificacionFlotante.tsx
import React from "react";
import { motion } from "framer-motion";
import Button from "./ui/Button";

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
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-primary text-white px-6 py-3 rounded-lg shadow-lg"
    >
      <div className="flex items-center gap-3">
        <span className="text-sm">{mensaje}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="!bg-white !text-primary !border-white hover:!bg-grey-100"
        >
          Cerrar
        </Button>
      </div>
    </motion.div>
  );
};

export default NotificacionFlotante;
