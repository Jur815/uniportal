import axios from "axios";

const http = axios.create({
  // baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  // baseURL: "https://uniportal-8ejm.onrender.com/api/v1",
  // headers: {
  //   "Content-Type": "application/json",
  // },
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
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
