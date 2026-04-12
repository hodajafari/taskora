import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

// 🔹 request interceptor
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("access");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

// 🔥 response interceptor (مهم‌ترین بخش)
API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // اگر توکن expire شده
    if (
      error.response?.status === 401 ||
      error.response?.data?.code === "token_not_valid"
    ) {
      try {
        const refresh = localStorage.getItem("refresh");

        const res = await axios.post(
          "https://taskora-rzc2.onrender.com/api/token/refresh/",
          { refresh }
        );

        const newAccess = res.data.access;

        localStorage.setItem("access", newAccess);

        // 🔁 retry request قبلی
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return API(originalRequest);
      } catch (err) {
        console.log("Refresh failed", err);

        // 🔴 logout
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default API;