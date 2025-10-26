import React, { useState, useEffect, useRef } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { ArrowPathIcon } from './icons/ArrowPathIcon';

interface ControlPanelProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onSubmit: () => void;
  onReset: () => void;
  isLoading: boolean;
  isImageUploaded: boolean;
}

const EDITING_SUGGESTIONS = [
  'Add a retro filter',
  'Remove the background',
  'Change color to blue',
  'Make the image black and white',
  'Apply a cartoon style',
  'Add a neon glow effect to the subject',
  'Place the subject on a beach at sunset',
  'Make the main subject wear a party hat',
];

const MERCH_PRESETS = [
    { name: 'Select a preset...', template: '' },
    { name: 'T-Shirt', template: 'Place this image on a high-quality, realistic white t-shirt mockup, shown flat on a neutral background.' },
    { name: 'Mug', template: 'Place this image on a glossy white ceramic coffee mug. The mug should be on a wooden coffee shop table with soft lighting.' },
    { name: 'Poster', template: 'Create a high-resolution poster mockup featuring this design, hanging on a modern, minimalist apartment wall.' },
];

export const ControlPanel: React.FC<ControlPanelProps> = ({
  prompt,
  setPrompt,
  onSubmit,
  onReset,
  isLoading,
  isImageUploaded,
}) => {
  const canSubmit = isImageUploaded && prompt.trim() !== '' && !isLoading;
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setPrompt(value);

    if (value.trim()) {
      const filtered = EDITING_SUGGESTIONS.filter(s =>
        s.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };
  
  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTemplate = e.target.value;
    setPrompt(selectedTemplate);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
    setShowSuggestions(false);
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-gray-800/50 p-6 rounded-2xl shadow-md border border-gray-700 flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-gray-200">2. Describe Your Mockup or Edit</h2>
       <div>
        <label htmlFor="merch-preset" className="block mb-2 text-sm font-medium text-gray-300">
          Start with a merch preset
        </label>
        <select
            id="merch-preset"
            className="block w-full p-2.5 text-sm text-gray-100 bg-gray-700 rounded-lg border border-gray-600 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 transition"
            onChange={handlePresetChange}
            disabled={!isImageUploaded || isLoading}
            value={MERCH_PRESETS.find(p => p.template === prompt)?.template || ''}
        >
            {MERCH_PRESETS.map((preset) => (
            <option key={preset.name} value={preset.template}>
                {preset.name}
            </option>
            ))}
        </select>
       </div>

        <div className="flex items-center">
            <div className="flex-grow border-t border-gray-600"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase">Or</span>
            <div className="flex-grow border-t border-gray-600"></div>
        </div>

      <div className="relative" ref={containerRef}>
        <label htmlFor="prompt" className="block mb-2 text-sm font-medium text-gray-300">
          Enter a custom prompt
        </label>
        <textarea
          id="prompt"
          rows={4}
          className="block p-2.5 w-full text-sm text-gray-100 bg-gray-700 rounded-lg border border-gray-600 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 transition"
          placeholder="e.g., add a cat wearing a party hat"
          value={prompt}
          onChange={handlePromptChange}
          onFocus={() => {
              if (prompt.trim()) {
                  const filtered = EDITING_SUGGESTIONS.filter(s => s.toLowerCase().includes(prompt.toLowerCase()));
                  if (filtered.length > 0) setShowSuggestions(true);
              }
          }}
          disabled={!isImageUploaded || isLoading}
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-20 w-full bg-gray-700 border border-gray-600 rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="px-4 py-2 text-sm text-gray-200 cursor-pointer hover:bg-purple-600"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSuggestionClick(suggestion);
                }}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mt-2">
        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="flex-grow inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5 mr-2" />
              Generate
            </>
          )}
        </button>
        <button
          onClick={onReset}
          className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-gray-300 bg-gray-700/50 rounded-lg hover:bg-gray-600 focus:ring-4 focus:ring-gray-800 disabled:opacity-50 transition-colors duration-200"
        >
          <ArrowPathIcon className="w-5 h-5 mr-2" />
          Reset
        </button>
      </div>
    </div>
  );
};
