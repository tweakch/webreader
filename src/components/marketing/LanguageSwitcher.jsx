import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <div className="flex items-center gap-1 bg-amber-100 rounded-lg p-0.5">
      <button
        onClick={() => handleLanguageChange('en')}
        className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
          i18n.language === 'en'
            ? 'bg-amber-800 text-amber-50'
            : 'text-amber-700 hover:bg-amber-200'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => handleLanguageChange('de')}
        className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
          i18n.language === 'de'
            ? 'bg-amber-800 text-amber-50'
            : 'text-amber-700 hover:bg-amber-200'
        }`}
      >
        DE
      </button>
    </div>
  );
}
