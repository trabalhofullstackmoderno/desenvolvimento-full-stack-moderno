import { jwtDecode } from "jwt-decode";
import axios from "./axios";

export const isValidToken = (accessToken: string | null) => {
  if (!accessToken) return false;
  const decoded: any = jwtDecode(accessToken);
  const currentTime = Date.now() / 1000;
  return decoded.exp > currentTime;
};

export const setSessionJWT = (accessToken: string | null) => {
  if (typeof window === "undefined") return;

  if (accessToken) {
    localStorage.setItem("accessToken", accessToken);
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    localStorage.removeItem("accessToken");
    delete axios.defaults.headers.common.Authorization;
  }
};

// Interceptor de resposta
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Token JWT expirado. Deslogando usuário...");
      setSessionJWT(null);
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);
