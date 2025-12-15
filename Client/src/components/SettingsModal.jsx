import React, { useState } from 'react';
import { IoKey, IoTrashBin, IoClose, IoRefresh } from 'react-icons/io5';
import { FaLaptopCode, FaDatabase, FaInfoCircle } from 'react-icons/fa';
import { useTheme } from './ThemeContext.jsx';
import { useSettings } from './SettingsContext.jsx';
import { toast } from 'react-toastify';

const SettingsModal = ({ isOpen, onClose }) => {
  const { theme, toggleTheme } = useTheme();
  const { settings, updateSetting, resetSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('General');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");

  if (!isOpen) return null;

  const handleClearCode = () => {
    toast.success("Code history cleared (Simulation)");
  };

  const handleSaveApiKey = () => {
    if (!apiKeyInput.trim()) {
      toast.error("API key cannot be empty");
      return;
    }

    localStorage.setItem("GEMINI_API_KEY", apiKeyInput.trim());
    toast.success("API key updated successfully");
    setApiKeyInput("");
    setShowApiKeyInput(false);
  };

  const handleResetApiKey = () => {
    localStorage.removeItem("GEMINI_API_KEY");
    setShowApiKeyInput(true);
    toast.info("Please enter a new API key");
  };

  const tabs = [
    { id: 'General', icon: <FaLaptopCode />, label: 'General' },
    { id: 'Storage', icon: <FaDatabase />, label: 'Storage' },
    { id: 'About', icon: <FaInfoCircle />, label: 'About' },
  ];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl h-[550px] bg-white dark:bg-[#141319] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-200 dark:border-gray-800 transition-colors">

        {/* Sidebar */}
        <div className="w-full md:w-1/3 bg-gray-50 dark:bg-[#09090B] border-r border-gray-200 dark:border-gray-800 p-4 flex flex-col">
          <h2 className="text-lg font-bold text-black dark:text-white mb-6 px-2">Settings</h2>
          <div className="flex flex-col gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                  activeTab === tab.id
                    ? 'bg-purple-100 dark:bg-[#222] text-purple-700 dark:text-purple-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1f1f23]'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#141319]">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-semibold text-black dark:text-white">{activeTab}</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
            >
              <IoClose size={20} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6">

            {activeTab === 'General' && (
              <div className="space-y-6">

                {/* AI Model */}
                <select
                  value={settings.model}
                  onChange={(e) => updateSetting("model", e.target.value)}
                  className="w-full p-3 rounded-xl bg-gray-50 dark:bg-[#09090B]"
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended)</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro (High Quality)</option>
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                  <option value="gemini-flash-latest">Gemini Flash Latest</option>
                  <option value="gemini-pro-latest">Gemini Pro Latest</option>
                </select>

                
                {/* <select
                value={settings.model}
                onChange={(e) => updateSetting('model', e.target.value)}
              >
                <option value="gemini-2.5-flash">Gemini Flash (Fastest)</option>
              </select> */}


                <div className="h-px bg-gray-100 dark:bg-gray-800 my-2"></div>

                {/* Website Style */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Website Style</h4>

                  {/* Color Scheme */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Color Scheme</span>
                    <button
                      onClick={toggleTheme}
                      className="px-4 py-2 bg-gray-100 dark:bg-[#222] rounded-lg text-sm text-black dark:text-white border border-gray-200 dark:border-[#333] hover:border-purple-500 transition-colors"
                    >
                      {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                    </button>
                  </div>

                  {/* Font Style */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Font Style</span>
                    <select
                      value={settings.font}
                      onChange={(e) => updateSetting('font', e.target.value)}
                      className="text-sm text-black dark:text-white text-right cursor-pointer rounded-lg 
                                bg-transparent dark:bg-[#222] border border-gray-300 dark:border-[#333] px-3 py-2"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Fira Code">Fira Code</option>
                    </select>
                  </div>


                  {/* Layout Type */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Layout Type</span>
                    <select
                      value={settings.layout}
                      onChange={(e) => updateSetting('layout', e.target.value)}
                      className="text-sm text-black dark:text-white text-right cursor-pointer rounded-lg 
                                bg-transparent dark:bg-[#222] border border-gray-300 dark:border-[#333] px-2 py-2"
                    >
                      <option value="Default">Default</option>
                      <option value="Wide">Wide Screen</option>
                      <option value="Compact">Compact</option>
                    </select>
                  </div>

                </div>
              </div>
            )}

            {activeTab === 'Storage' && (
              <div className="space-y-6">
                {/* Manage API Key */}
                <div className="p-4 bg-gray-50 dark:bg-[#09090B] rounded-xl border border-gray-200 dark:border-[#222] space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-black dark:text-white">
                        Gemini API Key
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {localStorage.getItem("GEMINI_API_KEY")
                          ? "Your API key is saved in this browser."
                          : "No API key found."}
                      </p>
                    </div>

                    {localStorage.getItem("GEMINI_API_KEY") && !showApiKeyInput && (
                      <button
                        onClick={handleResetApiKey}
                        className="text-sm px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-[#222] text-black dark:text-white hover:bg-gray-300 dark:hover:bg-[#333] transition"
                      >
                        Update
                      </button>
                    )}
                  </div>

                  {showApiKeyInput && (
                    <div className="space-y-3">
                      <input
                        type="password"
                        placeholder="Enter new API key"
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#141319] border border-gray-300 dark:border-[#333] focus:outline-none focus:border-purple-500"
                      />

                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveApiKey}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition"
                        >
                          Save
                        </button>

                        <button
                          onClick={() => {
                            setShowApiKeyInput(false);
                            setApiKeyInput("");
                          }}
                          className="px-4 py-2 bg-gray-200 dark:bg-[#222] text-black dark:text-white rounded-lg text-sm"
                        >
                          Cancel
                        </button>
                      </div>

                      <p className="text-xs text-gray-400">
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
                    </div>
                  )}
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-xl">
                  <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-500 mb-1">Warning</h4>
                  <p className="text-xs text-yellow-700 dark:text-yellow-600">
                    Clearing storage will remove all your saved preferences.
                  </p>
                </div>

                <div className="space-y-4">

                  {/* Clear Generated Code */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#09090B] rounded-xl border border-gray-200 dark:border-[#222]">
                    <div>
                      <h4 className="text-sm font-medium text-black dark:text-white">Clear Generated Code</h4>
                      <p className="text-xs text-gray-500 mt-1">Removes temporary code cache.</p>
                    </div>
                    <button
                      onClick={handleClearCode}
                      className="text-red-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <IoTrashBin size={20} />
                    </button>
                  </div>

                  {/* Reset App */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#09090B] rounded-xl border border-gray-200 dark:border-[#222]">
                    <div>
                      <h4 className="text-sm font-medium text-black dark:text-white">Reset App</h4>
                      <p className="text-xs text-gray-500 mt-1">Restores all settings to default.</p>
                    </div>
                    <button
                      onClick={resetSettings}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors flex items-center gap-2"
                    >
                      <IoRefresh /> Reset
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'About' && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-tr from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  G
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-black dark:text-white">GenUI</h3>
                  <p className="text-gray-500">AI Component Generator</p>
                </div>

                <div className="w-full max-w-xs space-y-3 pt-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Version</span>
                    <span className="text-black dark:text-white font-medium">1.1.0</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Creator</span>
                    <span className="text-black dark:text-white font-medium">Rudra Pandya</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">License</span>
                    <span className="text-black dark:text-white font-medium">Rudra Pandya</span>
                  </div>
                </div>

                <div className="pt-8">
                  <a
                      href="mailto:viralpandya079@gmail.com?subject=Feedback"
                      target='_blank'
                      onClick={(e) => {
                        // Prevent extension-injected scripts from hijacking it
                        e.stopPropagation();
                      }}
                      className="text-purple-500 hover:underline text-sm"
                    >
                      Send Feedback
                    </a>

                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;