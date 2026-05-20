interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_API_URL_UPLOADS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}