import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// Direct import of i18n and language registry
import i18n from "./lib/i18n";
import { supportedLanguages } from "./lib/i18n/language-registry";

// A simple app just to verify the app loads correctly
function SimpleApp() {
  const [currentLanguage, setCurrentLanguage] = React.useState<"en" | "ar">(i18n.language as "en" | "ar");

  const changeLanguage = (lang: "en" | "ar") => {
    i18n.changeLanguage(lang).then(() => {
      setCurrentLanguage(lang);
      // Update the document direction based on the language
      const isRtl = lang === 'ar';
      document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Media Intelligence Platform</h1>
      <p className="mb-4">Language: {currentLanguage}</p>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => changeLanguage('en')}
          className={`px-3 py-2 rounded ${currentLanguage === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          English
        </button>
        <button
          onClick={() => changeLanguage('ar')}
          className={`px-3 py-2 rounded ${currentLanguage === 'ar' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          العربية
        </button>
      </div>
      
      <div className="mt-4 border border-gray-300 rounded-md p-4">
        <h2 className="text-xl font-semibold mb-2">Supported Languages</h2>
        <ul className="space-y-2">
          {supportedLanguages.map(lang => (
            <li key={lang.code} className="flex items-center">
              <span className="font-medium mr-2">{lang.code}</span>
              <span>{lang.name.english} ({lang.name.native})</span>
              {lang.isRTL && <span className="ml-2 text-sm bg-yellow-100 px-2 py-0.5 rounded">RTL</span>}
              {lang.isDefault && <span className="ml-2 text-sm bg-green-100 px-2 py-0.5 rounded">Default</span>}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="mt-4">
        <p>This is a simplified version that verifies the i18n system is working correctly.</p>
        <p>For a more comprehensive interface, please visit the <a href="/i18n-test.html" className="text-blue-500 underline">i18n test page</a>.</p>
      </div>
    </div>
  );
}

// Initialize the app
const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <SimpleApp />
  </React.StrictMode>
);