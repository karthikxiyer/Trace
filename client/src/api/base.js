// In dev, VITE_API_URL is empty — Vite proxy forwards /api to localhost:3001
// In production, set VITE_API_URL=https://your-render-url.onrender.com
export const API_BASE = import.meta.env.VITE_API_URL || '';
