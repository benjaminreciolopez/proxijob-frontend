/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MODO_MANTENIMIENTO: string;
  // puedes añadir más variables si lo necesitas
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
