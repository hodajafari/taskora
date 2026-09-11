import axios from "axios";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://127.0.0.1:8000/api/"
    : "https://taskora-rzc2.onrender.com/api/";

const API = axios.create({
  baseURL: BASE_URL,
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("access");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

API.interceptors.response.use(
  (res) => res,

  async (error) => {
    const originalRequest = error.config;

    // اگر خود refresh/ خطا داده، دوباره refresh نکن
    if (originalRequest?.url?.includes("refresh/")) {
      return Promise.reject(error);
    }

    if (
      (error.response?.status === 401 ||
        error.response?.data?.code === "token_not_valid") &&
      !originalRequest?._retry
    ) {
      originalRequest._retry = true;

      const refresh = localStorage.getItem("refresh");

      // اگر refresh token نداریم، refresh request نفرست
      if (!refresh) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        return Promise.reject(error);
      }

      try {
        const res = await API.post("refresh/", { refresh });

        const newAccess = res.data.access;

        localStorage.setItem("access", newAccess);

        originalRequest.headers.Authorization = `Bearer ${newAccess}`;

        return API(originalRequest);
      } catch (err) {
        console.log("Refresh failed", err);

        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        window.location.replace("/login");

        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default API;