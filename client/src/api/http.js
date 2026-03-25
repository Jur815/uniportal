import axios from "axios";

// Debug only in development
if (import.meta.env.DEV) {
  console.log("API URL:", import.meta.env.VITE_API_URL);
}

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
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
