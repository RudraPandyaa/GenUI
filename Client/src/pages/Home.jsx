import React, { useEffect, useState } from "react";
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
  {
    value: "html-css",
    label: "HTML + CSS",
    display: "HTML / CSS",
  },
  {
    value: "html-tailwind",
    label: "HTML + Tailwind CSS",
    display: "HTML / Tailwind CSS",
  },
  {
    value: "html-bootstrap",
    label: "HTML + Bootstrap",
    display: "HTML / Bootstrap",
  },
  {
    value: "html-css-js",
    label: "HTML + CSS + JS",
    display: "HTML / CSS / JS",
  },
  {
    value: "html-tailwind-bootstrap",
    label: "HTML + Tailwind + Bootstrap",
    display: "HTML / Tailwind / Bootstrap",
  },
];

// -------------------- MODEL LABELS --------------------

const MODEL_LABELS = {
  "gemini-3.8-flash": "Gemini 3.8 Flash",
  "gemini-3.6-flash": "Gemini 3.6 Flash",
  "gemini-3.5-flash": "Gemini 3.5 Flash",
  "gemini-3.5-flash-lite": "Gemini 3.5 Flash Lite",
  "gemini-3-flash": "Gemini 3 Flash",
};

// =========================================================
// MAIN COMPONENT
// =========================================================

const Home = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { settings } = useSettings();

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

  // =========================================================
  // API KEY CHECK
  // =========================================================

  useEffect(() => {
    const profileDone = localStorage.getItem("profileComplete");

    if (profileDone !== "true") {
      return;
    }

    const apiKey = localStorage.getItem("GEMINI_API_KEY");

    if (!apiKey) {
      setShowApiKeyModal(true);
    }
  }, []);

  // =========================================================
  // AUTH CHECK
  // =========================================================

  useEffect(() => {
    const token = localStorage.getItem("token");
    const tokenTime = Number(localStorage.getItem("tokenTime"));

    if (!token) {
      navigate("/login");
      return undefined;
    }

    const MAX_TIME = 2 * 60 * 60 * 1000;

    if (!tokenTime || Date.now() - tokenTime > MAX_TIME) {
      authService.logout();
      return undefined;
    }

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
      clearTimeout(timer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, [navigate]);

  // =========================================================
  // MARKDOWN CLEANING
  // =========================================================

  const extractHTMLFromMarkdown = (text) => {
    if (!text) {
      return "";
    }

    const fencedCodeMatch = text.match(
      /```(?:html)?\s*([\s\S]*?)```/i
    );

    if (fencedCodeMatch?.[1]) {
      return fencedCodeMatch[1].trim();
    }

    return text
      .replace(/```html\s*/gi, "")
      .replace(/```/g, "")
      .trim();
  };

  // =========================================================
  // GEMINI API REQUEST
  // =========================================================

  const getResponse = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    const apiKey = localStorage.getItem("GEMINI_API_KEY");

    if (!apiKey) {
      setShowApiKeyModal(true);
      return;
    }

    setLoading(true);

    try {
      const model = settings.model || "gemini-3.6-flash";

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
                  `- Very modern and responsive design\n` +
                  `- Great animations and hover effects\n` +
                  `- Clean, production-ready code\n` +
                  `- Output only the code inside a fenced markdown block\n` +
                  `- Final output must be a single complete HTML file\n`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        },
      };

      const endpoint =
        `https://generativelanguage.googleapis.com/v1beta/models/` +
        `${model}:generateContent?key=${apiKey}`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      console.log("RAW RESPONSE:", data);

      if (!response.ok || data.error) {
        throw new Error(
          data?.error?.message ||
            `Gemini request failed with status ${response.status}`
        );
      }

      const responseText =
        data?.candidates?.[0]?.content?.parts
          ?.map((part) => part.text || "")
          .join("") || "";

      if (!responseText) {
        const finishReason =
          data?.candidates?.[0]?.finishReason;

        throw new Error(
          finishReason
            ? `AI returned no content. Reason: ${finishReason}`
            : "AI returned no content"
        );
      }

      const cleanHTML = extractHTMLFromMarkdown(responseText);

      if (!cleanHTML) {
        throw new Error("Could not extract HTML from AI response");
      }

      setCode(cleanHTML);
      setTab(1);
      setOutputScreen(true);

      toast.success("Code generated successfully");
    } catch (error) {
      console.error("Gemini generation error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Error generating code"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // COPY AND DOWNLOAD
  // =========================================================

  const copyCode = async () => {
    if (!code) {
      toast.error("Nothing to copy");
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      toast.success("Copied!");
    } catch (error) {
      console.error("Copy error:", error);
      toast.error("Unable to copy code");
    }
  };

  const downloadFile = () => {
    if (!code) {
      toast.error("Nothing to download");
      return;
    }

    const blob = new Blob([code], {
      type: "text/html;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "GenUI-Code.html";

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);

    toast.success("Downloaded!");
  };

  // =========================================================
  // RESPONSIVE LAYOUT
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

  // =========================================================
  // REACT SELECT STYLES
  // =========================================================

  const customStyles = {
    control: (base) => ({
      ...base,
      backgroundColor:
        theme === "dark" ? "#09090B" : "#f3f4f6",
      borderColor: theme === "dark" ? "#333" : "#d1d5db",
      color: theme === "dark" ? "#fff" : "#000",
      padding: "5px",
      boxShadow: "none",
    }),

    menu: (base) => ({
      ...base,
      backgroundColor:
        theme === "dark" ? "#141319" : "#fff",
      color: theme === "dark" ? "#fff" : "#000",
      zIndex: 20,
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

      <div
        className={`
          flex flex-col lg:flex-row
          gap-[30px]
          ${getContainerClass()}
          min-h-[calc(100vh-90px)]
        `}
      >
        {/* Left panel */}

        <div className="w-full lg:w-[50%] bg-gray-50 dark:bg-[#09090B] border dark:border-[#1f1f23] rounded-xl p-[20px] mt-5 shadow-sm">
          <h3 className="text-[25px] font-semibold text-black dark:text-white">
            AI Component Generator
          </h3>

          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Powered by{" "}
            {MODEL_LABELS[settings.model] ||
              "Gemini 3.6 Flash"}
          </p>

          <p className="text-[15px] font-[600] mt-6 dark:text-white">
            Framework
          </p>

          <Select
            options={FRAMEWORK_OPTIONS}
            styles={customStyles}
            value={framework}
            onChange={(selected) => {
              if (selected) {
                setFramework(selected);
              }
            }}
          />

          <p className="text-[15px] font-[600] mt-6 dark:text-white">
            Describe your component
          </p>

          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            className="w-full min-h-[200px] rounded-xl bg-white dark:bg-[#141319] text-black dark:text-white border p-[15px] mt-2 resize-none"
            placeholder="E.g., Landing page hero section with animation..."
          />

          <button
            type="button"
            onClick={getResponse}
            disabled={loading}
            className="mt-8 flex items-center p-[12px] rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white gap-[10px] shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <ClipLoader size={18} color="#ffffff" />
            ) : (
              <BsStars />
            )}

            {loading ? "Generating..." : "Generate Code"}
          </button>
        </div>

        {/* Right panel */}

        <div
          className={`
            w-full lg:w-[50%]
            dark:bg-[#09090B]
            rounded-xl
            mt-5
            border border-border
            shadow-sm
            overflow-hidden
            flex flex-col
            min-h-0
            ${
              outputScreen
                ? "grid grid-rows-[auto_auto_1fr] h-[70vh] lg:h-auto"
                : "flex items-center justify-center py-20"
            }
          `}
        >
          {!outputScreen ? (
            <div className="flex flex-col items-center justify-center h-full opacity-60">
              <HiOutlineCode className="text-[35px] text-gray-400 dark:text-gray-500" />

              <p className="text-gray-500 dark:text-gray-400 mt-3">
                Your generated code will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* Tabs */}

              <div className="bg-gray-100 dark:bg-[#141319] border-b dark:border-[#222] flex gap-2 p-2">
                <button
                  type="button"
                  onClick={() => setTab(1)}
                  className={`flex-1 py-2 rounded-lg ${
                    tab === 1
                      ? "bg-white dark:bg-[#222] text-black dark:text-white"
                      : "text-gray-500"
                  }`}
                >
                  Source Code
                </button>

                <button
                  type="button"
                  onClick={() => setTab(2)}
                  className={`flex-1 py-2 rounded-lg ${
                    tab === 2
                      ? "bg-white dark:bg-[#222] text-black dark:text-white"
                      : "text-gray-500"
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
                      <button
                        type="button"
                        onClick={copyCode}
                        aria-label="Copy generated code"
                        className="w-10 h-10 rounded-xl border border-zinc-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-[#333]"
                      >
                        <IoCopy />
                      </button>

                      <button
                        type="button"
                        onClick={downloadFile}
                        aria-label="Download generated code"
                        className="w-10 h-10 rounded-xl border border-zinc-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-[#333]"
                      >
                        <PiExportBold />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setRefreshKey((currentKey) => currentKey + 1)
                        }
                        aria-label="Refresh preview"
                        className="w-10 h-10 rounded-xl border border-zinc-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-[#333]"
                      >
                        <FiRefreshCcw />
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsNewTabOpen(true)}
                        aria-label="Open full-screen preview"
                        className="w-10 h-10 rounded-xl border border-zinc-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-[#333]"
                      >
                        <ImNewTab />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Generated content */}

              <div className="flex-1 min-h-0 overflow-hidden">
                {tab === 1 ? (
                  <Editor
                    height="100%"
                    theme={
                      theme === "dark" ? "vs-dark" : "light"
                    }
                    language="html"
                    value={code}
                    onChange={(updatedCode) =>
                      setCode(updatedCode || "")
                    }
                    options={{
                      minimap: {
                        enabled: false,
                      },
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
                    title="Generated component preview"
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

      {/* Full-screen preview */}

      {isNewTabOpen && (
        <div className="fixed inset-0 bg-white dark:bg-[#141319] z-[100] flex flex-col">
          <div className="h-[60px] flex items-center justify-between px-6 border-b dark:border-[#222]">
            <p className="font-bold text-lg dark:text-white">
              Full Screen Preview
            </p>

            <button
              type="button"
              onClick={() => setIsNewTabOpen(false)}
              aria-label="Close full-screen preview"
              className="dark:text-white"
            >
              <IoCloseSharp size={24} />
            </button>
          </div>

          <iframe
            title="Generated component full-screen preview"
            srcDoc={code}
            className="w-full flex-1 bg-white"
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