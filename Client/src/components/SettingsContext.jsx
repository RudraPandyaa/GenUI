import React, { createContext, useContext, useEffect, useState } from 'react';

// Default settings
const defaultSettings = {
  model: 'gemini-2.0-flash',
  font: 'Inter',
  layout: 'Default',
};

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('genui-settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('genui-settings', JSON.stringify(settings));

    // Apply font globally
    const body = document.body;
    body.style.fontFamily =
      settings.font === 'Fira Code'
        ? "'Fira Code', monospace"
        : `'${settings.font}', sans-serif`;
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('genui-settings');
    localStorage.removeItem('theme'); // remove theme if needed
    window.location.reload();
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};