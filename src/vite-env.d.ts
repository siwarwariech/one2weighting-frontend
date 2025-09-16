/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // ➜ ajoute ici d'autres VITE_... si besoin
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
