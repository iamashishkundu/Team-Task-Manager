import axios from "axios";

const rawBase = import.meta.env.VITE_API_URL || "http://localhost:4000";
const apiBase = rawBase.endsWith("/") ? rawBase.slice(0, -1) : rawBase;

const api = axios.create({
  baseURL: `${apiBase}/api`,
  withCredentials: true
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    const ignoreAuthPaths = ["/auth/me", "/auth/login", "/auth/register"];
    const shouldIgnore = ignoreAuthPaths.some((path) => url.includes(path));

    if (error.response && error.response.status === 401 && !shouldIgnore) {
      localStorage.removeItem("ttm_user");
      window.dispatchEvent(new Event("auth:logout"));
    }
    return Promise.reject(error);
  }
);

export default api;
