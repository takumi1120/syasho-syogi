import axios from "axios";

const resolvedApiBaseUrl = import.meta.env.VITE_API_URL?.trim()
    ? import.meta.env.VITE_API_URL.trim().replace(/\/$/, "")
    : import.meta.env.DEV
        ? "http://localhost:3000"
        : "/api";

export const api = axios.create({
    baseURL: resolvedApiBaseUrl,
});
