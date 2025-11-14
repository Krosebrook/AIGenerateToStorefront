import React from 'react';
import { PaintBrushIcon } from './icons/PaintBrushIcon';
import { WandIcon } from './icons/WandIcon';

export type AppMode = 'edit' | 'generate';

interface ModeSelectorProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, setMode }) => {
  const getButtonClasses = (mode: AppMode) => {
    const isActive = currentMode === mode;
    return `flex-1 inline-flex items-center justify-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500
      ${isActive
        ? 'bg-purple-600 text-white border-2 border-purple-400'
        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 border-2 border-transparent'
      }`;
  };

  return (
    <div className="w-full max-w-sm mx-auto p-1 bg-gray-800 rounded-xl flex items-center gap-2">
      <button className={getButtonClasses('edit')} onClick={() => setMode('edit')}>
        <PaintBrushIcon className="w-5 h-5" />
        Edit Image
      </button>
      <button className={getButtonClasses('generate')} onClick={() => setMode('generate')}>
        <WandIcon className="w-5 h-5" />
        Generate Image
      </button>
    </div>
  );
};
