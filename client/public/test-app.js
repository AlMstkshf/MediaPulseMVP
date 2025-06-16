import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import i18n from "./lib/i18n/index";
import { 
  supportedLanguages,
  addLanguage,
  updateLanguage,
  toggleLanguageActive,
  setDefaultLanguage,
  Language
} from "./lib/i18n/language-registry";

// A minimal app component
const MinimalApp = () => {
  const [languages, setLanguages] = useState<Language[]>([...supportedLanguages]);
  const [currentLang, setCurrentLang] = useState<string>(i18n.language);
  
  // Function to change the language
  const changeLanguage = (code: "en" | "ar") => {
    i18n.changeLanguage(code).then(() => {
      setCurrentLang(code);
    });
  };
  
  // Toggle language active state
  const toggleActive = (code: string) => {
    try {
      const updatedLangs = toggleLanguageActive(code);
      setLanguages([...updatedLangs]);
    } catch (error) {
      console.error("Error toggling language:", error);
    }
  };
  
  // Set language as default
  const makeDefault = (code: string) => {
    try {
      const updatedLangs = setDefaultLanguage(code);
      setLanguages([...updatedLangs]);
      changeLanguage(code as "en" | "ar");
    } catch (error) {
      console.error("Error setting default language:", error);
    }
  };
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Media Intelligence Platform</h1>
      <p className="mb-6">Internationalization (i18n) System Test</p>
      
      <div className="flex mb-4 gap-4">
        <button 
          onClick={() => changeLanguage("en")}
          className={`px-4 py-2 rounded ${currentLang === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          English
        </button>
        <button 
          onClick={() => changeLanguage("ar")}
          className={`px-4 py-2 rounded ${currentLang === 'ar' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          العربية
        </button>
      </div>
      
      <div className="mt-4 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">Language Management</h2>
        <p className="mb-4">Current language: <strong>{currentLang}</strong></p>
        
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border border-gray-300">Code</th>
                <th className="p-2 border border-gray-300">Name (English)</th>
                <th className="p-2 border border-gray-300">Name (Native)</th>
                <th className="p-2 border border-gray-300">RTL</th>
                <th className="p-2 border border-gray-300">Active</th>
                <th className="p-2 border border-gray-300">Default</th>
                <th className="p-2 border border-gray-300">Completeness</th>
                <th className="p-2 border border-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {languages.map(lang => (
                <tr key={lang.code} className={lang.isDefault ? 'bg-blue-50' : ''}>
                  <td className="p-2 border border-gray-300">{lang.code}</td>
                  <td className="p-2 border border-gray-300">{lang.name.english}</td>
                  <td className="p-2 border border-gray-300">{lang.name.native}</td>
                  <td className="p-2 border border-gray-300">{lang.isRTL ? 'Yes' : 'No'}</td>
                  <td className="p-2 border border-gray-300">
                    <input 
                      type="checkbox" 
                      checked={lang.isActive} 
                      onChange={() => toggleActive(lang.code)}
                      disabled={lang.isDefault}
                    />
                  </td>
                  <td className="p-2 border border-gray-300">
                    <input 
                      type="radio" 
                      name="default" 
                      checked={!!lang.isDefault} 
                      onChange={() => makeDefault(lang.code)}
                      disabled={!lang.isActive}
                    />
                  </td>
                  <td className="p-2 border border-gray-300">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${lang.completeness}%` }}
                      ></div>
                    </div>
                    <span className="text-xs">{lang.completeness}%</span>
                  </td>
                  <td className="p-2 border border-gray-300">
                    <button 
                      className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                      onClick={() => changeLanguage(lang.code as "en" | "ar")}
                    >
                      Use
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

try {
  createRoot(rootElement).render(
    <React.StrictMode>
      <MinimalApp />
    </React.StrictMode>
  );
  console.log("MinimalApp rendered successfully");
} catch (error) {
  console.error("Error rendering app:", error);
  
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1>Error Rendering Application</h1>
        <p>There was an error rendering the application.</p>
        <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto;">${error instanceof Error ? error.message : 'Unknown error'}</pre>
        <p>Try the <a href="/test.html">test page</a> to check basic connectivity.</p>
      </div>
    `;
  }
}