const BASE_URL = "https://genui-9lkq.onrender.com/api/auth";
// const BASE_URL = "http://localhost:5000/api/auth";

export const authService = {

  signup: async (username, email, password) => {
    const res = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("tokenTime", Date.now());
    }

    return data;
  },

   sendOtp: async (email) => {
    const res = await fetch(`${BASE_URL}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    return res.json();
  },

  // ✅ ADD THIS
  verifyOtpAndResetPassword: async (email, otp, newPassword) => {
    const res = await fetch(`${BASE_URL}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, newPassword })
    });
    return res.json();
  },
  login: async (email, password) => {
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("tokenTime", Date.now());
    }

    return data;
  },

  logout: () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }
};