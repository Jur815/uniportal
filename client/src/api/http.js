import axios from "axios";

// Debug only in development
if (import.meta.env.DEV) {
  console.log("API URL:", import.meta.env.VITE_API_URL);
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:5000/api/v1" : "");

if (!API_BASE_URL) {
  throw new Error("VITE_API_URL is required for production builds");
}

const http = axios.create({
  baseURL: API_BASE_URL,
});

// Attach token automatically
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default http;
