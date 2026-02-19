/// <reference types="vite/client" />

declare module 'swiper/css';
declare module 'swiper/css/navigation';
declare module 'swiper/css/pagination';

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
