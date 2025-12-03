import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "./components/ThemeContext.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider>
      <App />

      {/* Toast Container Added */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </ThemeProvider>
  </StrictMode>
);