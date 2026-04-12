import API from "../../api/axios";

// 🔑 LOGIN (email + password)
export const login = async (email, password) => {
  
    const res = await API.post("/login/", {
      email , 
      password,
    });

    return res.data;
  }; 


// 👤 GET CURRENT USER
export const getMe = () => {
  return API.get("/me/");
};

// 📝 REGISTER
export const registerUser = (data) => {
  return API.post("/register/", data);
};

// 🔐 CHANGE PASSWORD
export const changePassword = (old_password, new_password) => {
  return API.post("/change-password/", {
    old_password,
    new_password,
  });
};

// 🔄 REFRESH TOKEN (اختیاری - interceptor انجام میده)
export const refreshToken = (refresh) => {
  return API.post("/refresh/", {
    refresh,
  });
};

// 🚪 LOGOUT (اگر backend invalidate کنه)
export const logoutUser = (refresh) => {
  return API.post("/logout/", {
    refresh,
  });
};