import axios from "axios";

// Use a relative `/api` first so the Next.js dev server can proxy requests to the backend.
// If NEXT_PUBLIC_API_URL is set it will be used (useful when you want to force LAN IP).
const baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
  baseURL,
});

export default api;
