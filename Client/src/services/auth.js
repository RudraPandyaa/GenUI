const BASE_URL = "https://genui-9lkq.onrender.com/api/auth";

export const authService = {

  signup: async (username, email, password) => {
    const res = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });
    return await res.json();
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