import axios from "axios";

export const api = axios.create({
  baseURL: "/api", // ถ้าใช้ proxy ของ Vite
});

// แนบ Bearer token ทุกคำขอ
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ถ้า 401 → ลบ token แล้วเด้งไปหน้า Login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      // หลีกเลี่ยง loop หากอยู่ที่ / หรือ /register อยู่แล้ว
      const p = window.location.pathname;
      if (!/^\/($|register)/.test(p)) {
        window.location.replace("/"); // หน้า Login
      }
    }
    return Promise.reject(err);
  }
);
