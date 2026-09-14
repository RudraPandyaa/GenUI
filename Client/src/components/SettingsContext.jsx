import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

const validModels = [
  'gemini-3.8-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3-flash',
];

const defaultSettings = {
  model: 'gemini-3.6-flash',
  font: 'Inter',
  layout: 'Default',
};

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('genui-settings');
      const parsed = saved ? JSON.parse(saved) : defaultSettings;

      // Automatically replace removed or unsupported saved models
      if (!validModels.includes(parsed.model)) {
        return {
          ...parsed,
          model: defaultSettings.model,
        };
      }

      return parsed;
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    localStorage.setItem(
      'genui-settings',
      JSON.stringify(settings)
    );

    document.body.style.fontFamily =
      settings.font === 'Fira Code'
        ? "'Fira Code', monospace"
        : `'${settings.font}', sans-serif`;
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings((previousSettings) => ({
      ...previousSettings,
      [key]: value,
    }));
  };

  const resetSettings = () => {
    localStorage.removeItem('genui-settings');
    localStorage.removeItem('theme');
    setSettings(defaultSettings);
    window.location.reload();
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSetting,
        resetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error(
      'useSettings must be used within a SettingsProvider'
    );
  }

  return context;
};