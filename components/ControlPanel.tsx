import React, { useEffect, useState } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { ArrowPathIcon } from './icons/ArrowPathIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { PackageIcon } from './icons/PackageIcon';
import { AppMode } from './ModeSelector';
import { BrandKit, BrandKitPanel } from './BrandKitPanel';
import { PaintBrushIcon } from './icons/PaintBrushIcon';
import { CustomTemplateModal } from './CustomTemplateModal';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';

export interface MerchPreset {
    id: string;
    name: string;
    template: string;
    isCustom?: boolean;
}

interface ControlPanelProps {
  mode: AppMode;
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerateEdit: () => void;
  onGenerateNew: () => void;
  onGenerateBatch: (presets: MerchPreset[]) => void;
  onReset: () => void;
  isLoading: boolean;
  isImageUploaded: boolean;
  onSuggest: () => void;
  isSuggesting: boolean;
  suggestions: string[];
  selectedPresets: MerchPreset[];
  onSelectedPresetsChange: (presets: MerchPreset[]) => void;
  negativePrompt: string;
  setNegativePrompt: (p: string) => void;
  variations: number;
  setVariations: (v: number) => void;
  aspectRatio: string;
  setAspectRatio: (ar: string) => void;
  brandKit: BrandKit;
  onUpdateBrandKit: (kit: BrandKit) => void;
  useBrandKit: boolean;
  setUseBrandKit: (use: boolean) => void;
  customPresets: MerchPreset[];
  onUpdateCustomPresets: (presets: MerchPreset[]) => void;
}

const MERCH_PRESETS: MerchPreset[] = [
    { id: 't-shirt', name: 'T-Shirt', template: 'Create a photorealistic mockup of this design on the chest of a premium, soft cotton white t-shirt. The t-shirt should be laid flat on a clean, light gray surface with subtle, natural shadows.' },
    { id: 'mug', name: 'Mug', template: 'Render this design on a glossy white ceramic coffee mug. The mockup should be photorealistic, placed on a dark wooden coffee shop table next to a window with soft, morning light creating gentle reflections.' },
    { id: 'poster', name: 'Poster', template: 'Generate a photorealistic mockup of this design as a high-resolution poster inside a thin, matte black frame. The poster should be hanging on a lightly textured, off-white wall in a modern, minimalist apartment setting. The lighting should be soft and indirect, coming from a large window just out of frame. Include a softly blurred background with a hint of a vibrant green potted plant on a wooden floor, adding a touch of life to the scene.' },
    { id: 'hoodie', name: 'Hoodie', template: 'Display this design on the front of a comfortable, slightly wrinkled black pullover hoodie. The mockup should show realistic fabric texture and be laid flat on a neutral, concrete-textured background.'},
    { id: 'stickers', name: 'Stickers', template: 'Create a mockup of multiple die-cut vinyl stickers of this design. The stickers should have a clean white border and a glossy finish, scattered realistically on a simple, pastel-colored background.'},
    { id: 'phone-case', name: 'Phone Case', template: 'Generate a mockup of this design on a sleek, matte black smartphone case (similar to an iPhone). The phone should be resting at a slight angle on a clean, minimalist desk surface next to a pair of wireless earbuds.'},
    { id: 'hat', name: 'Hat', template: 'Create a photorealistic mockup of this design embroidered on the front of a classic black baseball cap. The cap should be shown from a slight front-angle view on a clean, neutral background to emphasize the design.' },
    { id: 'notebook', name: 'Notebook', template: 'Generate a mockup of this design on the cover of a spiral-bound notebook. The notebook should be lying on a wooden desk next to a pen, with soft, natural lighting.' },
    { id: 'tote-bag', name: 'Tote Bag', template: 'Create a photorealistic mockup of this design on a simple, minimalist canvas tote bag. The bag should be held by a person against a clean, light-colored wall, showcasing the design in a natural, lifestyle context.' },
    { id: 'coloring-book', name: 'Adult Coloring Book', template: 'Convert this image into a detailed, black-and-white line art page for an adult coloring book. The final image should be presented as a crisp page in an open coloring book, with colored pencils resting nearby.' }
];

const VARIATIONS_OPTIONS = [1, 2, 3, 4];
const ASPECT_RATIO_OPTIONS = ['1:1', '16:9', '9:16', '4:3', '3:4'];

export const ControlPanel: React.FC<ControlPanelProps> = ({
  mode,
  prompt,
  setPrompt,
  onGenerateEdit,
  onGenerateNew,
  onGenerateBatch,
  onReset,
  isLoading,
  isImageUploaded,
  onSuggest,
  isSuggesting,
  suggestions,
  selectedPresets,
  onSelectedPresetsChange,
  negativePrompt,
  setNegativePrompt,
  variations,
  setVariations,
  aspectRatio,
  setAspectRatio,
  brandKit,
  onUpdateBrandKit,
  useBrandKit,
  setUseBrandKit,
  customPresets,
  onUpdateCustomPresets,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const allPresets = [...MERCH_PRESETS, ...customPresets];

  const canSubmit = mode === 'edit' 
    ? isImageUploaded && (selectedPresets.length > 0 || prompt.trim() !== '') && !isLoading
    : prompt.trim() !== '' && !isLoading;

  const handlePresetClick = (preset: MerchPreset) => {
    const isCurrentlySelected = selectedPresets.some(p => p.id === preset.id);
    let newSelection;
    if (isCurrentlySelected) {
        newSelection = selectedPresets.filter(p => p.id !== preset.id);
    } else {
        newSelection = [...selectedPresets, preset];
    }
    onSelectedPresetsChange(newSelection);
  };
  
  const handleStarterPack = () => {
    if (isLoading || !isImageUploaded) return;
    const starterPackIds = ['t-shirt', 'mug', 'hoodie'];
    const starterPackPresets = MERCH_PRESETS.filter(p => starterPackIds.includes(p.id));
    onGenerateBatch(starterPackPresets);
  };

  const handleSubmit = () => {
    if (isLoading) return;
    if (mode === 'edit') {
      onGenerateEdit();
    } else {
      onGenerateNew();
    }
  }
  
  useEffect(() => {
    if (mode === 'edit') {
      if (selectedPresets.length === 1) {
        setPrompt(selectedPresets[0].template);
      } else {
        setPrompt('');
      }
    }
  }, [selectedPresets, mode, setPrompt]);

  const getGenerateButtonText = () => {
    if (mode === 'generate') {
      return variations > 1 ? `Generate ${variations} Variations` : 'Generate Image';
    }
    if (selectedPresets.length > 1) return `Generate ${selectedPresets.length} Mockups`;
    return 'Generate';
  };
  
  const handleSaveCustomPreset = (newPreset: { name: string; template: string }) => {
    const presetToAdd: MerchPreset = {
      ...newPreset,
      id: `custom-${Date.now()}`,
      isCustom: true
    };
    onUpdateCustomPresets([...customPresets, presetToAdd]);
    setIsModalOpen(false);
  };

  const handleDeleteCustomPreset = (idToDelete: string) => {
    const updatedPresets = customPresets.filter(p => p.id !== idToDelete);
    onSelectedPresetsChange(selectedPresets.filter(p => p.id !== idToDelete));
    onUpdateCustomPresets(updatedPresets);
  };


  return (
    <>
      <div className="bg-gray-800/50 p-6 rounded-2xl shadow-md border border-gray-700 flex flex-col gap-4 h-full">
        <h2 className="text-lg font-semibold text-gray-200">
          {mode === 'edit' ? '2. Describe Your Mockup or Edit' : '1. Describe The Image You Want'}
        </h2>
        
        {mode === 'edit' && (
          <>
            <div className="flex flex-col gap-3">
              <label className="block text-sm font-medium text-gray-300">
                Start with a product (select one or more)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {allPresets.map((preset) => {
                      const isSelected = selectedPresets.some(p => p.id === preset.id);
                      const isSuggested = suggestions.map(s => s.toLowerCase()).includes(preset.name.toLowerCase());
                      return (
                        <div key={preset.id} className="relative group">
                          <button
                              onClick={() => handlePresetClick(preset)}
                              disabled={!isImageUploaded || isLoading}
                              className={`w-full h-full p-2 text-xs font-semibold text-center rounded-md transition-all duration-200 border-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95
                                  ${isSelected ? 'bg-purple-600 border-purple-400 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-purple-500 hover:bg-gray-600 hover:scale-105'}
                                  ${isSuggested && !isSelected ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-cyan-400' : ''}
                                  ${preset.isCustom ? 'border-dashed' : ''}
                              `}
                          >
                            {preset.name}
                          </button>
                          {preset.isCustom && (
                               <button
                                  onClick={() => handleDeleteCustomPreset(preset.id)}
                                  className="absolute -top-1.5 -right-1.5 p-0.5 bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                  aria-label={`Delete ${preset.name}`}
                              >
                                  <XCircleIcon className="w-4 h-4" />
                              </button>
                          )}
                        </div>
                      )
                  })}
                  <button
                    onClick={() => setIsModalOpen(true)}
                    disabled={!isImageUploaded || isLoading}
                    className="p-2 flex flex-col items-center justify-center text-xs font-semibold text-center rounded-md transition-all duration-200 border-2 border-dashed bg-gray-700/50 border-gray-600 text-gray-400 hover:border-purple-500 hover:text-white hover:bg-gray-700 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                    <PlusCircleIcon className="w-5 h-5 mb-1" />
                    Create New
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={handleStarterPack}
                    disabled={!isImageUploaded || isLoading || isSuggesting}
                    className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-center text-purple-200 bg-purple-900/50 rounded-lg hover:bg-purple-800/50 focus:ring-4 focus:ring-purple-700 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                      <PackageIcon className="w-4 h-4 mr-2" />
                      Generate Starter Pack
                  </button>
                  <button
                    onClick={onSuggest}
                    disabled={!isImageUploaded || isLoading || isSuggesting}
                    className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-center text-cyan-200 bg-cyan-900/50 rounded-lg hover:bg-cyan-800/50 focus:ring-4 focus:ring-cyan-700 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isSuggesting ? (
                      <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Suggesting...
                      </>
                    ) : (
                      <>
                        <LightbulbIcon className="w-4 h-4 mr-2" />
                        Smart Suggest Products
                      </>
                    )}
                  </button>
              </div>
            </div>

            <div className="flex items-center">
                <div className="flex-grow border-t border-gray-600"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase">Or</span>
                <div className="flex-grow border-t border-gray-600"></div>
            </div>
          </>
        )}

        <div className="flex-grow flex flex-col">
          <label htmlFor="prompt" className="block mb-2 text-sm font-medium text-gray-300">
            {mode === 'edit' ? 'Enter a custom prompt' : 'Prompt'}
          </label>
          <textarea
            id="prompt"
            rows={mode === 'edit' ? 3 : 5}
            className="block p-2.5 w-full text-sm text-gray-100 bg-gray-700 rounded-lg border border-gray-600 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 transition disabled:bg-gray-700/50"
            placeholder={
              mode === 'edit' 
                ? selectedPresets.length > 1
                  ? 'Using selected product templates...'
                  : 'e.g., place this design on a tote bag made of canvas' 
                : 'e.g., A cute cat astronaut floating in space, digital art'
            }
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={(mode === 'edit' && (!isImageUploaded || selectedPresets.length > 1)) || isLoading}
          />
        </div>
        
        <div className="border-t border-gray-700 pt-4 flex flex-col gap-4">
            
            {mode === 'edit' && (
               <details className="group bg-gray-900/30 rounded-lg">
                  <summary className="p-3 cursor-pointer text-sm font-medium text-gray-300 list-none flex items-center justify-between hover:bg-gray-700/50 rounded-t-lg">
                      <span className='flex items-center gap-2'>
                        <PaintBrushIcon className="w-5 h-5 text-purple-400" />
                        Brand Kit (Optional)
                      </span>
                      <span className="transition-transform duration-200 group-open:rotate-90">▶</span>
                  </summary>
                  <div className="p-4 border-t border-gray-700">
                      <BrandKitPanel brandKit={brandKit} onUpdateBrandKit={onUpdateBrandKit} />
                  </div>
              </details>
            )}

            <div className="relative">
              <label htmlFor="negative-prompt" className="block mb-2 text-sm font-medium text-gray-300">
                Negative Prompt (what to avoid)
              </label>
              <textarea
                id="negative-prompt"
                rows={2}
                className="block p-2.5 w-full text-sm text-gray-100 bg-gray-700 rounded-lg border border-gray-600 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 transition disabled:bg-gray-700/50"
                placeholder="e.g., text, logos, blurry, poorly lit, extra limbs"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {mode === 'generate' && (
              <>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">Variations</label>
                  <div className="grid grid-cols-4 gap-2">
                    {VARIATIONS_OPTIONS.map(v => (
                      <button
                        key={v}
                        onClick={() => setVariations(v)}
                        disabled={isLoading}
                        className={`p-2 text-sm font-semibold text-center rounded-md transition-all duration-200 border-2 disabled:opacity-50 disabled:cursor-not-allowed
                          ${variations === v ? 'bg-purple-600 border-purple-400 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-purple-500'}
                        `}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">Aspect Ratio</label>
                  <div className="grid grid-cols-5 gap-2">
                    {ASPECT_RATIO_OPTIONS.map(ar => (
                      <button
                        key={ar}
                        onClick={() => setAspectRatio(ar)}
                        disabled={isLoading}
                        className={`py-2 px-1 text-sm font-semibold text-center rounded-md transition-all duration-200 border-2 disabled:opacity-50 disabled:cursor-not-allowed
                          ${aspectRatio === ar ? 'bg-purple-600 border-purple-400 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-purple-500'}
                        `}
                      >
                        {ar}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
        </div>

         {mode === 'edit' && (
           <div className="flex items-center justify-start bg-gray-700/50 p-3 rounded-lg">
              <label htmlFor="use-brand-kit" className="flex items-center cursor-pointer">
                <div className="relative">
                  <input 
                    id="use-brand-kit" 
                    type="checkbox" 
                    className="sr-only" 
                    checked={useBrandKit} 
                    onChange={(e) => setUseBrandKit(e.target.checked)} 
                    disabled={isLoading || !isImageUploaded}
                  />
                  <div className={`block w-10 h-6 rounded-full transition ${useBrandKit ? 'bg-purple-600' : 'bg-gray-600'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${useBrandKit ? 'transform translate-x-4' : ''}`}></div>
                </div>
                <div className="ml-3 text-sm font-medium text-gray-300">
                  Apply Brand Kit
                </div>
              </label>
            </div>
         )}

        <div className="flex flex-col sm:flex-row gap-4 mt-auto pt-4">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex-grow inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <SparklesIcon className="w-5 h-5 mr-2" />
                {getGenerateButtonText()}
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
      <CustomTemplateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCustomPreset}
      />
    </>
  );
};