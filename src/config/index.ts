// src/config/index.ts
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || '',
  environment: import.meta.env.VITE_ENVIRONMENT || 'development',
}
