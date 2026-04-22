// src/config/index.ts
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || '',
  clerkPublishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '',
  environment: import.meta.env.VITE_ENVIRONMENT || 'development',
}
