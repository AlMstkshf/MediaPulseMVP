import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// A basic app without any dependencies
function BasicApp() {
  const [language, setLanguage] = React.useState<"en" | "ar">("en");
  
  const changeLanguage = (lang: "en" | "ar") => {
    setLanguage(lang);
    // Update document direction
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Media Intelligence Platform</h1>
      <p className="mb-4">Current Language: {language}</p>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => changeLanguage("en")}
          className={`px-3 py-2 rounded ${language === "en" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          English
        </button>
        <button
          onClick={() => changeLanguage("ar")}
          className={`px-3 py-2 rounded ${language === "ar" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          العربية
        </button>
      </div>
      
      <div className="mt-4 p-4 border rounded">
        <h2 className="text-xl mb-2">Internationalization System</h2>
        <p>This is a basic demonstration of language switching with RTL support.</p>
        
        <h3 className="mt-3 font-medium">Features Implemented:</h3>
        <ul className="list-disc pl-5 mt-2">
          <li>Language registry with metadata</li>
          <li>RTL support for Arabic</li>
          <li>Corrected translation file syntax</li>
          <li>Language management functionality</li>
        </ul>
        
        <p className="mt-3">For a more comprehensive demonstration, visit the <a href="/i18n-test.html" className="text-blue-500 underline">i18n test page</a>.</p>
      </div>
    </div>
  );
}

// Initialize the app
const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <BasicApp />
  </React.StrictMode>
);