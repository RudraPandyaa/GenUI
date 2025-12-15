import { useState } from "react";
import { toast } from "react-toastify";

const ApiKeyModal = ({ isOpen, onClose }) => {
  const [key, setKey] = useState("");

  if (!isOpen) return null;

  const saveKey = () => {
    if (!key.trim()) {
      toast.error("API key is required");
      return;
    }

    localStorage.setItem("GEMINI_API_KEY", key.trim());
    toast.success("API key saved");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#0b0b10] text-white w-full max-w-md rounded-2xl p-6 border border-gray-800">
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Enter your Gemini API Key</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <input
          type="password"
          placeholder="Paste your API key here"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-[#141319] border border-gray-700 focus:outline-none focus:border-purple-500"
        />

        <p className="text-xs text-gray-400 mt-3">
          Your API key is stored only in your browser.
        </p>

        <p className="text-xs text-gray-400 mt-2">
          Don’t know how to generate API key?{" "}
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noreferrer"
            className="text-purple-400 hover:underline"
          >
            Click here
          </a>
        </p>

        <button
          onClick={saveKey}
          className="mt-5 w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 transition font-medium"
        >
          Save API Key
        </button>
      </div>
    </div>
  );
};

export default ApiKeyModal;