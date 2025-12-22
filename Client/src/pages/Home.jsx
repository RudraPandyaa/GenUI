import React, { useState, useEffect } from "react";
import Select from "react-select";
import { BsStars } from "react-icons/bs";
import { HiOutlineCode } from "react-icons/hi";
import { IoCloseSharp, IoCopy } from "react-icons/io5";
import { PiExportBold } from "react-icons/pi";
import { ImNewTab } from "react-icons/im";
import { FiRefreshCcw } from "react-icons/fi";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import { Editor } from "@monaco-editor/react";
import { useNavigate } from "react-router-dom";
import ApiKeyModal from "../components/ApiKeyModal";
import Navbar from "../components/Navbar";
import { authService } from "../services/auth.js";
import { useTheme } from "../components/ThemeContext";
import { useSettings } from "../components/SettingsContext.jsx";

// -------------------- FRAMEWORK OPTIONS --------------------
const FRAMEWORK_OPTIONS = [
  { value: "html-css", label: "HTML + CSS", display: "HTML / CSS" },
  { value: "html-tailwind", label: "HTML + Tailwind CSS", display: "HTML / Tailwind CSS" },
  { value: "html-bootstrap", label: "HTML + Bootstrap", display: "HTML / Bootstrap" },
  { value: "html-css-js", label: "HTML + CSS + JS", display: "HTML / CSS / JS" },
  { value: "html-tailwind-bootstrap", label: "HTML + Tailwind + Bootstrap", display: "HTML / Tailwind / Bootstrap" },
];

// =========================================================
//                    MAIN COMPONENT
// =========================================================
const Home = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { settings } = useSettings();

  // const API_KEY = import.meta.env.VITE_API_KEY;

  // -------------------- STATE --------------------
  const [outputScreen, setOutputScreen] = useState(false);
  const [tab, setTab] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [isNewTabOpen, setIsNewTabOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [framework, setFramework] = useState(FRAMEWORK_OPTIONS[0]);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  useEffect(() => {
    const profileDone = localStorage.getItem("profileComplete");

    if (profileDone !== "true") return;

    const apiKey = localStorage.getItem("GEMINI_API_KEY");

    if (!apiKey) {
      setShowApiKeyModal(true);
    }
  }, []);



  // if (userProfileDone === "false") {
  //   navigate("/setup-profile");
  // }

  // =========================================================
  //                     AUTH CHECK
  // =========================================================
  useEffect(() => {
    const token = localStorage.getItem("token");
    const tokenTime = localStorage.getItem("tokenTime");

    if (!token) {
      navigate("/login");
      return;
    }

    const MAX_TIME = 2 * 60 * 60 * 1000; // 2 hr
    if (Date.now() - tokenTime > MAX_TIME) {
      authService.logout();
      return;
    }

    // Auto logout on inactivity
    let timer;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(authService.logout, MAX_TIME);
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    resetTimer();

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, []);

  // =========================================================
  //               GEMINI API REQUEST (CORRECT)
  // =========================================================

  const MODEL_LABELS = {
    "gemini-2.5-flash": "Gemini 2.5 Flash",
    "gemini-2.5-pro": "Gemini 2.5 Pro",
    "gemini-2.0-flash": "Gemini 2.0 Flash",
    "gemini-flash-latest": "Gemini Flash (Latest)",
    "gemini-pro-latest": "Gemini Pro (Latest)",
  };

  const getResponse = async () => {
    if (!prompt.trim()) return toast.error("Please enter a prompt");
    const apiKey = localStorage.getItem("GEMINI_API_KEY");

    if (!apiKey) {
      setShowApiKeyModal(true);
      return;
    }

    // if (!API_KEY) return toast.error("API Key is missing");

    setLoading(true);

    try {
      const model = settings.model || "gemini-2.5-flash";

      const payload = {
        contents: [
          {
            role: "user",
            parts: [
              {
                text:
                  `You are an expert frontend engineer.\n\n` +
                  `Generate a full UI component for:\n"${prompt}"\n\n` +
                  `Framework: ${framework.value}\n` +
                  `Font: ${settings.font}\n` +
                  `Layout: ${settings.layout}\n\n` +
                  `Requirements:\n` +
                  `- Very modern & responsive design\n` +
                  `- Great animations & hover effects\n` +
                  `- Clean, production-ready code\n` +
                  `- Output ONLY the code inside fenced markdown blocks\n` +
                  `- Final output must be a SINGLE full HTML file\n`
              }
            ]
          }
        ]
      };

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      console.log("RAW RESPONSE:", data);

      if (data.error) throw new Error(data.error.message);

      const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!responseText) throw new Error("AI returned no content");

      setCode(responseText);
      setOutputScreen(true);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error generating code");
    }

    setLoading(false);
  };

  // =========================================================
  //               COPY & DOWNLOAD UTILITIES
  // =========================================================
  const copyCode = async () => {
    if (!code) return toast.error("Nothing to copy");
    await navigator.clipboard.writeText(code);
    toast.success("Copied!");
  };

  const downloadFile = () => {
    if (!code) return toast.error("Nothing to download");

    const blob = new Blob([code], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "GenUI-Code.html";
    a.click();

    URL.revokeObjectURL(url);
    toast.success("Downloaded!");
  };

  // =========================================================
  //               LAYOUT HANDLING (Responsive)
  // =========================================================
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

  // =========================================================
  //                     RENDER UI
  // =========================================================
  return (
    <div className="min-h-screen bg-white dark:bg-[#141319] transition-all duration-300">
      <Navbar />

      <div
        className={`
          flex flex-col lg:flex-row
          gap-[30px]
          ${getContainerClass()}
          min-h-[calc(100vh-90px)]
        `}
      >


        {/* -------------------------------- LEFT PANEL ------------------------------- */}
        <div className="w-full lg:w-[50%] bg-gray-50 dark:bg-[#09090B] border dark:border-[#1f1f23] rounded-xl p-[20px] mt-5 shadow-sm">
          <h3 className="text-[25px] font-semibold text-black dark:text-white">AI Component Generator</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Powered by {MODEL_LABELS[settings.model] || "Gemini"}
          </p>

          <p className="text-[15px] font-[600] mt-6 dark:text-white">Framework</p>
          <Select
            options={FRAMEWORK_OPTIONS}
            styles={customStyles}
            defaultValue={FRAMEWORK_OPTIONS[0]}
            onChange={(selected) => setFramework(selected)}
          />


          <p className="text-[15px] font-[600] mt-6 dark:text-white">Describe your component</p>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full min-h-[200px] rounded-xl bg-white dark:bg-[#141319] text-black dark:text-white border p-[15px] mt-2 resize-none"
            placeholder="E.g., Landing page hero section with animation..."
          />

          <button
            onClick={getResponse}
            disabled={loading}
            className="mt-8 flex items-center p-[12px] rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white gap-[10px] shadow-lg"
          >
            {loading ? <ClipLoader size={18} color="white" /> : <BsStars />}
            Generate Code
          </button>
        </div>

        {/* -------------------------------- RIGHT PANEL ------------------------------- */}
        <div
          className={`
            w-full lg:w-[50%]
            bg-background
            rounded-xl
            mt-5
            border border-border
            shadow-sm
            overflow-hidden
            flex flex-col
            min-h-0
            ${outputScreen 
              ? "grid grid-rows-[auto_auto_1fr] h-[70vh] lg:h-auto" 
              : "flex items-center justify-center py-20"
            }
          `}
        >

          {!outputScreen ? (
            <div className="flex flex-col items-center justify-center h-full opacity-60">
              <HiOutlineCode className="text-[35px] text-gray-400 dark:text-gray-500" />
              <p className="text-gray-500 dark:text-gray-400 mt-3">Your generated code will appear here.</p>
            </div>
          ) : (
            <>
              {/* Tabs */}
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

              {/* Toolbar */}
              <div className="h-[50px] flex items-center justify-between px-4 border-b dark:border-[#222]">
                <span className="text-xs text-gray-500 uppercase">
                  {tab === 1 ? framework.display : "Preview"}
                </span>

                <div className="flex gap-2">
                  {tab === 1 ? (
                    <>
                      <button onClick={copyCode} className="w-10 h-10 rounded-xl border border-zinc-800 flex items-center justify-center hover:bg-[#333]"><IoCopy /></button>
                      <button onClick={downloadFile} className="w-10 h-10 rounded-xl border border-zinc-800 flex items-center justify-center hover:bg-[#333]" ><PiExportBold /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setRefreshKey((k) => k + 1)} className="w-10 h-10 rounded-xl border border-zinc-800 flex items-center justify-center hover:bg-[#333]"><FiRefreshCcw /></button>
                      <button onClick={() => setIsNewTabOpen(true)} className="w-10 h-10 rounded-xl border border-zinc-800 flex items-center justify-center hover:bg-[#333]" ><ImNewTab /></button>
                    </>
                  )}
                </div>
              </div>

              {/* Content */}
                <div className="flex-1 min-h-0 overflow-hidden">
                {tab === 1 ? (
                        <Editor
                          height="100%"
                          theme={theme === "dark" ? "vs-dark" : "light"}
                          language="html"
                          value={code}
                          options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            fontFamily: settings.font,
                            wordWrap: "on",
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
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

      {/* Full screen preview */}
      {isNewTabOpen && (
        <div className="fixed inset-0 bg-white dark:bg-[#141319] z-[100] flex flex-col">
          <div className="h-[60px] flex items-center justify-between px-6 border-b dark:border-[#222]">
            <p className="font-bold text-lg dark:text-white">Full Screen Preview</p>
            <button onClick={() => setIsNewTabOpen(false)}>
              <IoCloseSharp size={24} />
            </button>
          </div>

          <iframe
            srcDoc={code}
            className="w-full flex-1"
            sandbox="allow-scripts"
          />
        </div>
      )}
      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
      />
    </div>
  );
};

export default Home;