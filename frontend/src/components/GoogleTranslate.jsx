import React, { useEffect, useState, useRef } from 'react';
import { Search, ChevronDown, Globe } from 'lucide-react';

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi (हिन्दी)' },
  { code: 'es', name: 'Spanish (Español)' },
  { code: 'fr', name: 'French (Français)' },
  { code: 'de', name: 'German (Deutsch)' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
  { code: 'ja', name: 'Japanese (日本語)' },
  { code: 'ko', name: 'Korean (한국어)' },
  { code: 'ar', name: 'Arabic (العربية)' },
  { code: 'ru', name: 'Russian (Русский)' },
  { code: 'pt', name: 'Portuguese (Português)' },
  { code: 'it', name: 'Italian (Italiano)' },
  { code: 'bn', name: 'Bengali (বাংলা)' },
  { code: 'ur', name: 'Urdu (اردو)' },
  { code: 'mr', name: 'Marathi (मराठी)' },
  { code: 'te', name: 'Telugu (తెలుగు)' },
  { code: 'ta', name: 'Tamil (தமிழ்)' },
  { code: 'gu', name: 'Gujarati (ગુજરાતી)' },
  { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
];

const GoogleTranslate = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentLang, setCurrentLang] = useState(SUPPORTED_LANGUAGES[0]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Check if the script is already loaded to avoid duplicates
    let addScript = true;
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      if (scripts[i].src.includes('translate.google.com')) {
        addScript = false;
        break;
      }
    }

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { 
          pageLanguage: 'en', 
          includedLanguages: SUPPORTED_LANGUAGES.map(l => l.code).join(','),
          autoDisplay: false
        },
        'google_translate_element'
      );
    };

    if (addScript) {
      const script = document.createElement('script');
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    } else {
      const translateElement = document.getElementById('google_translate_element');
      if (translateElement && translateElement.innerHTML === '') {
        try {
          if (window.google && window.google.translate) {
            new window.google.translate.TranslateElement(
              { 
                pageLanguage: 'en',
                includedLanguages: SUPPORTED_LANGUAGES.map(l => l.code).join(','),
                autoDisplay: false
              },
              'google_translate_element'
            );
          }
        } catch (e) {
          console.error("Google Translate error:", e);
        }
      }
    }

    // Check if a language is currently selected by google (e.g., from cookies)
    const currentCookie = document.cookie.split('; ').find(row => row.startsWith('googtrans='));
    if (currentCookie) {
      const code = currentCookie.split('=')[1].split('/').pop();
      const selected = SUPPORTED_LANGUAGES.find(l => l.code === code);
      if (selected) setCurrentLang(selected);
    }
  }, []);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageSelect = (lang) => {
    const selectEl = document.querySelector('.goog-te-combo');
    if (selectEl) {
      selectEl.value = lang.code;
      // Google translate requires the change event to bubble
      selectEl.dispatchEvent(new Event('change', { bubbles: true }));
      setCurrentLang(lang);
      setIsOpen(false);
      setSearchTerm('');
    } else {
      console.warn("Google Translate select element not found.");
    }
  };

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(lang => 
    lang.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    lang.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent any default form submission behavior
      if (filteredLanguages.length > 0) {
        handleLanguageSelect(filteredLanguages[0]);
      }
    }
  };

  return (
    <div className="relative notranslate" ref={dropdownRef}>
      {/* Hidden Native Google Translate Element - using absolute/opacity instead of display:none to ensure Google scripts can interact with it */}
      <div id="google_translate_element" className="absolute opacity-0 pointer-events-none w-0 h-0 overflow-hidden"></div>

      {/* Custom Dropdown Trigger */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-sm text-slate-700 font-medium hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/20"
      >
        <Globe size={16} className="text-slate-500" />
        <span className="max-w-[100px] truncate hidden sm:inline-block">{currentLang.name.split(' ')[0]}</span>
        <ChevronDown size={14} className="text-slate-400 ml-1 hidden sm:inline-block" />
      </button>

      {/* Custom Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden flex flex-col max-h-[320px]">
          {/* Search Input */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search language..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 placeholder:text-slate-400"
                autoFocus
              />
            </div>
          </div>

          {/* Language List */}
          <div className="overflow-y-auto p-1 custom-scrollbar">
            {filteredLanguages.length === 0 ? (
              <div className="text-center py-4 text-sm text-slate-500">No languages found</div>
            ) : (
              filteredLanguages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    currentLang.code === lang.code 
                      ? 'bg-green-50 text-green-700 font-medium' 
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {lang.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleTranslate;
