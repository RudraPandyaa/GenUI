import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup.jsx";
import ForgotPassword from "./pages/ForgotPassword";
import NoPage from "./pages/NoPage";
import SetupProfile from "./pages/SetupProfile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { SettingsProvider } from "./components/SettingsContext.jsx";

const App = () => {
  return (
    <SettingsProvider>
      <BrowserRouter>
            <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          pauseOnFocusLoss={false}
          pauseOnHover={true}
          theme="colored"
        />
        <Routes>

          {/* Main Pages */}
          <Route path="/" element={<Home />} />

          {/* Auth Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/setup-profile" element={<SetupProfile />} />

          {/* 404 Page */}
          <Route path="*" element={<NoPage />} />

        </Routes>
      </BrowserRouter>
    </SettingsProvider>
  );
};

export default App;