import React, { useState, useEffect } from "react";
import Select from "react-select";
import { BsStars } from "react-icons/bs";
import { HiOutlineCode } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { Editor } from "@monaco-editor/react";
import { IoCloseSharp, IoCopy } from "react-icons/io5";
import { PiExportBold } from "react-icons/pi";
import { ImNewTab } from "react-icons/im";
import { FiRefreshCcw } from "react-icons/fi";
// import { GoogleGenAI } from "@google/genai";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import { authService  } from '../services/auth.js'
import { useTheme } from "../components/ThemeContext";
import { useSettings } from "../components/SettingsContext.jsx";
import Navbar from "../components/Navbar";

const options = [
  { value: "html-css", label: "HTML + CSS" },
  { value: "html-tailwind", label: "HTML + Tailwind CSS" },
  { value: "html-bootstrap", label: "HTML + Bootstrap" },
  { value: "html-css-js", label: "HTML + CSS + JS" },
  { value: "html-tailwind-bootstrap", label: "HTML + Tailwind + Bootstrap" },
];

const Home = () => {
  useEffect(() => {
  const token = localStorage.getItem("token");
  const tokenTime = localStorage.getItem("tokenTime");
  const MAX_TIME = 2 * 60 * 60 * 1000; // 2 hours
  // const MAX_TIME = 1 * 60 * 1000;
  if (!token) {
    navigate("/login");
    return;
  }

  if (Date.now() - tokenTime > MAX_TIME) {
    authService .logout();
    return;
  }

  // Inactivity auto logout
  let timer;
  const resetTimer = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      authService.logout();
    }, MAX_TIME);
  };

  window.addEventListener("mousemove", resetTimer);
  window.addEventListener("keydown", resetTimer);

  resetTimer();

  return () => {
    window.removeEventListener("mousemove", resetTimer);
    window.removeEventListener("keydown", resetTimer);
    clearTimeout(timer);
  };

}, []);

  const { theme } = useTheme();
  const { settings } = useSettings(); // NEW FEATURE
  const navigate = useNavigate();

  const [outputScreen, setOutputScreen] = useState(false);
  const [tab, setTab] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [isNewTabOpen, setIsNewTabOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [frameWork, setFrameWork] = useState(options[0]);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  // LOGIN PROTECTION (kept as requested)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, []);

  const API_KEY = import.meta.env.VITE_API_KEY;

  // const ai = new GoogleGenAI({
  //   apiKey: API_KEY,
  // });

  function extractCode(response) {
    const match = response.match(/(?:\w+)?\n?([\s\S]*?)/);
    return match ? match[1].trim() : response.trim();
  }

  async function getResponse() {
  if (!prompt.trim()) return toast.error("Please enter a prompt");
  if (!API_KEY) return toast.error("API Key is missing");

  setLoading(true);

    try {
  const modelToUse = settings.model || "gemini-2.0-flash";

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `
                  Generate a UI component for: ${prompt}
                  Framework: ${frameWork.value}
                  Font: ${settings.font}
                  Layout: ${settings.layout}

                  Return ONLY the code in fenced markdown format.
                `
              }
            ]
          }
        ]
      })
    }
  );

  const data = await res.json();

  // If API returns an error
  if (data.error) {
    throw new Error(data.error.message);
  }

  const text =
    data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  if (!text) {
    throw new Error("Empty AI response");
  }

  setCode(extractCode(text));
  setOutputScreen(true);

    } catch (error) {
      console.error("AI Error:", error);
      toast.error(error.message || "AI failed to generate output.");
    }


  const copyCode = async () => {
    if (!code.trim()) return toast.error("No code to copy");
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Copied!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const downnloadFile = () => {
    if (!code.trim()) return toast.error("No code");

    const blob = new Blob([code], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "GenUI-Code.html";
    link.click();

    URL.revokeObjectURL(url);
    toast.success("Downloaded");
  };

  // ⭐ NEW → Dynamic Layout (Default / Wide / Compact)
  const getContainerClass = () => {
    switch (settings.layout) {
      case "Wide":
        return "px-6";
      case "Compact":
        return "max-w-6xl mx-auto px-6";
      default:
        return "px-6 md:px-[100px]";
    }
  };

  // ⭐ NEW → TSX-level React-Select styles
  const customStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: theme === "dark" ? "#09090B" : "#f3f4f6",
      borderColor: theme === "dark" ? "#333" : "#d1d5db",
      color: theme === "dark" ? "#fff" : "#000",
      padding: "5px",
      boxShadow: "none",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: theme === "dark" ? "#141319" : "#fff",
      color: theme === "dark" ? "#fff" : "#000",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? theme === "dark"
          ? "#333"
          : "#e5e7eb"
        : state.isFocused
        ? theme === "dark"
          ? "#222"
          : "#f9fafb"
        : theme === "dark"
        ? "#141319"
        : "#fff",
      color: theme === "dark" ? "#fff" : "#000",
      cursor: "pointer",
    }),
    singleValue: (base) => ({
      ...base,
      color: theme === "dark" ? "#fff" : "#000",
    }),
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#141319] transition-all duration-300">
      <Navbar />

      {/* Layout Wrapper (NEW) */}
      <div className={`flex flex-col lg:flex-row gap-[30px] pb-10 ${getContainerClass()}`}>

        {/* LEFT PANEL */}
        <div className="left w-full lg:w-[50%] bg-gray-50 dark:bg-[#09090B] border dark:border-[#1f1f23] rounded-xl p-[20px] mt-5 shadow-sm">
          <h3 className="text-[25px] font-semibold text-black dark:text-white">
            AI Component Generator
          </h3>

          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Powered by Gemini Flash
          </p>

          <p className="text-[15px] font-[600] mt-6 dark:text-white">Framework</p>

          <Select
            options={options}
            styles={customStyles}
            defaultValue={options[0]}
            onChange={(selected) => setFrameWork(selected)}
          />

          <p className="text-[15px] font-[600] mt-6 dark:text-white">Describe your component</p>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full min-h-[200px] rounded-xl bg-white dark:bg-[#141319] text-black dark:text-white border p-[15px] mt-2 resize-none"
            placeholder="E.g., A landing page hero with animations..."
          ></textarea>

          <div className="flex items-center justify-between mt-8">
            <button
              onClick={getResponse}
              disabled={loading}
              className="generate flex items-center p-[12px] rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white gap-[10px] shadow-lg"
            >
              {loading ? <ClipLoader size={18} color="white" /> : <BsStars />}
              Generate Code
            </button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right w-full lg:w-[50%] bg-gray-50 dark:bg-[#09090B] rounded-xl mt-5 border dark:border-[#1f1f23] shadow-sm flex flex-col">

          {!outputScreen ? (
            <div className="flex flex-col items-center justify-center h-full opacity-60">
              <div className="w-[80px] h-[80px] flex items-center justify-center rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-[#1a1a20] dark:to-[#222]">
                <HiOutlineCode className="text-[35px] text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 mt-3">
                Your generated code will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* TAB SWITCH */}
              <div className="bg-gray-100 dark:bg-[#141319] border-b dark:border-[#222] flex gap-2 p-2">
                <button
                  onClick={() => setTab(1)}
                  className={`flex-1 py-2 rounded-lg ${
                    tab === 1 ? "bg-white dark:bg-[#222] text-black dark:text-white" : "text-gray-500"
                  }`}
                >
                  Source Code
                </button>

                <button
                  onClick={() => setTab(2)}
                  className={`flex-1 py-2 rounded-lg ${
                    tab === 2 ? "bg-white dark:bg-[#222] text-black dark:text-white" : "text-gray-500"
                  }`}
                >
                  Preview UI
                </button>
              </div>

              {/* TOOLBAR */}
              <div className="h-[50px] flex items-center justify-between px-4 border-b dark:border-[#222]">
                <span className="text-xs text-gray-500 uppercase">
                  {tab === 1 ? "HTML / CSS / JS" : "Preview"}
                </span>

                <div className="flex gap-2">
                  {tab === 1 ? (
                    <>
                      <button onClick={copyCode} className="hover:text-purple-500"><IoCopy /></button>
                      <button onClick={downnloadFile} className="hover:text-purple-500"><PiExportBold /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setRefreshKey(prev => prev + 1)}><FiRefreshCcw /></button>
                      <button onClick={() => setIsNewTabOpen(true)}><ImNewTab /></button>
                    </>
                  )}
                </div>
              </div>

              {/* CONTENT */}
              <div className="flex-1 overflow-hidden">
                {tab === 1 ? (
                  <Editor
                    height="100%"
                    theme={theme === "dark" ? "vs-dark" : "light"}
                    language="html"
                    value={code}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      fontFamily: settings.font, // NEW FEATURE
                    }}
                  />
                ) : (
                  <iframe
                    key={refreshKey}
                    srcDoc={code}
                    className="w-full h-full bg-white"
                    sandbox="allow-scripts"
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* FULL SCREEN PREVIEW */}
      {isNewTabOpen && (
        <div className="fixed inset-0 bg-white z-[100] flex flex-col">
          <div className="h-[60px] flex items-center justify-between px-6 border-b dark:border-[#222]">
            <p className="font-bold text-lg dark:text-white">Full Screen Preview</p>
            <button onClick={() => setIsNewTabOpen(false)}>
              <IoCloseSharp size={24} className="text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          <iframe
            srcDoc={code}
            className="w-full flex-1 bg-white dark:bg-[#141319]"
            sandbox="allow-scripts"
          ></iframe>
        </div>
      )}
    </div>
  );
};
}
export default Home;