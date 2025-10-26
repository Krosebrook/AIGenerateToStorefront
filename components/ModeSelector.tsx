import React from 'react';
import { PencilSquareIcon } from './icons/PencilSquareIcon';
import { PhotoIcon } from './icons/PhotoIcon';

export type AppMode = 'edit' | 'generate';

interface ModeSelectorProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, setMode }) => {
  const getButtonClasses = (mode: AppMode) => {
    const isActive = currentMode === mode;
    return `flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500
      ${isActive
        ? 'bg-purple-600 text-white'
        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
      }`;
  };

  return (
    <div className="w-full max-w-sm mx-auto p-1 bg-gray-800 rounded-xl flex items-center gap-2">
      <button className={getButtonClasses('edit')} onClick={() => setMode('edit')}>
        <PencilSquareIcon className="w-5 h-5" />
        Edit Image
      </button>
      <button className={getButtonClasses('generate')} onClick={() => setMode('generate')}>
        <PhotoIcon className="w-5 h-5" />
        Generate Image
      </button>
    </div>
  );
};