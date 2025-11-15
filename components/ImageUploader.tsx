import React, { useCallback, useState } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { PaintBrushIcon } from './icons/PaintBrushIcon';
import { StyleIcon } from './icons/StyleIcon';
import { ExpandIcon } from './icons/ExpandIcon';
import { UpscaleIcon } from './icons/UpscaleIcon';
import { AdjustmentsIcon } from './icons/AdjustmentsIcon';
import { CropIcon } from './icons/CropIcon';
import { RotateIcon } from './icons/RotateIcon';
import { ArrowUturnLeftIcon } from './icons/ArrowUturnLeftIcon';
import { FilterIcon } from './icons/FilterIcon';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  sourceImageUrl: string | null;
  onReset: () => void;
  onUpscale: () => void;
  isUpscaling: boolean;
  onApplyStyle: (styleName: string) => void;
  isApplyingStyle: boolean;
  isSimple?: boolean;
  title?: string;
}

const ToolbarButton: React.FC<{label: string, onClick: () => void, children: React.ReactNode, isActive?: boolean}> = ({ label, onClick, children, isActive = false }) => (
    <div className="relative group">
        <button
            onClick={onClick}
            className={`p-2.5 rounded-full text-gray-300 transition-all duration-200 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900
                ${isActive ? 'bg-purple-600 text-white' : 'bg-gray-800/80 hover:bg-purple-600 hover:text-white'}
            `}
            aria-label={label}
        >
            {children}
        </button>
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            {label}
        </div>
    </div>
);


const SubPanel: React.FC<{title: string, options: string[], onClose: () => void}> = ({ title, options, onClose }) => (
    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-48 bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-lg shadow-2xl p-3 animate-fade-in">
        <div className="flex justify-between items-center mb-2">
            <h4 className="text-xs font-bold text-white">{title}</h4>
            <button onClick={onClose} className="text-gray-400 hover:text-white"><XCircleIcon className="w-4 h-4" /></button>
        </div>
        <div className="flex flex-col gap-1.5">
            {options.map(opt => (
                <button key={opt} className="w-full text-left text-xs text-gray-300 hover:bg-purple-500/50 p-1.5 rounded-md transition-colors">{opt}</button>
            ))}
        </div>
    </div>
);

const initialEdits = {
    rotation: 0,
    brightness: 100,
    contrast: 100,
    aspectRatio: 'free',
    filter: 'None',
    hue: 0,
    saturation: 100,
    colorBalance: {
      shadows: '#000000', // Neutral for 'screen' blend mode
      midtones: '#808080', // Neutral for 'overlay' blend mode
      highlights: '#ffffff', // Neutral for 'multiply' blend mode
    }
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageUpload, 
  sourceImageUrl, 
  onReset, 
  onUpscale, 
  isUpscaling, 
  onApplyStyle, 
  isApplyingStyle,
  isSimple = false,
  title
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [edits, setEdits] = useState(initialEdits);

  const STYLE_OPTIONS = ['Photorealistic', 'Vector Art', 'Vintage', 'Watercolor', 'Cyberpunk', 'Pop Art'];
  const FILTER_OPTIONS = ['None', 'Sepia', 'Grayscale', 'Invert', 'Vintage', 'Technicolor'];

  const FILTER_MAP: Record<string, string> = {
    'None': '',
    'Sepia': 'sepia(100%)',
    'Grayscale': 'grayscale(100%)',
    'Invert': 'invert(100%)',
    'Vintage': 'sepia(60%) saturate(120%)',
    'Technicolor': 'contrast(150%) saturate(150%)'
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };

  const handleDragEvents = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageUpload(e.dataTransfer.files[0]);
    }
  }, [onImageUpload]);

  const handleRotate = () => {
    setEdits(prev => ({ ...prev, rotation: (prev.rotation + 90) % 360 }));
  };

  const handleAdjustmentsChange = (type: 'brightness' | 'contrast' | 'hue' | 'saturation', value: number) => {
    setEdits(prev => ({ ...prev, [type]: value }));
  };
  
  const handleColorBalanceChange = (type: 'shadows' | 'midtones' | 'highlights', value: string) => {
    setEdits(prev => ({
        ...prev,
        colorBalance: {
            ...prev.colorBalance,
            [type]: value,
        },
    }));
  };

  const handleAspectRatioChange = (ratio: string) => {
    setEdits(prev => ({ ...prev, aspectRatio: ratio }));
    setActivePanel(null);
  };
  
  const handleFilterChange = (filterName: string) => {
    setEdits(prev => ({ ...prev, filter: filterName }));
  };

  const handleResetEdits = () => {
    setEdits(initialEdits);
    setActivePanel(null);
  }

  const isProcessing = !isSimple && (isUpscaling || isApplyingStyle);
  const processingMessage = isUpscaling ? 'Upscaling Image...' : isApplyingStyle ? 'Applying Style...' : '';

  const aspectRatioClass = {
    'free': '',
    '1:1': 'aspect-[1/1]',
    '16:9': 'aspect-[16/9]',
    '9:16': 'aspect-[9/16]',
  }[edits.aspectRatio] || '';

  const imageContainerClasses = `relative group rounded-lg overflow-hidden flex items-center justify-center bg-black/30 transition-all duration-300 ${aspectRatioClass}`;
  const imageClasses = `relative transition-all duration-300 isolate ${edits.aspectRatio === 'free' ? 'object-contain max-h-80' : 'w-full h-full object-cover'}`;

  const imageStyle = isSimple ? {} : {
    transform: `rotate(${edits.rotation}deg)`,
    filter: `
      ${FILTER_MAP[edits.filter] || ''} 
      brightness(${edits.brightness}%) 
      contrast(${edits.contrast}%)
      hue-rotate(${edits.hue}deg)
      saturate(${edits.saturation}%)
    `.trim(),
  };

  return (
    <div className={`bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700 transition-transform duration-300 ease-in-out ${sourceImageUrl && !isSimple ? 'scale-[1.02]' : 'scale-100'}`}>
      <h2 className="text-lg font-semibold text-gray-200 mb-4">{title || '1. Upload & Edit Your Image'}</h2>
      <div className="relative">
        {sourceImageUrl ? (
          <div className={imageContainerClasses}>
            {!isSimple && (
              <div
                className="absolute inset-0 bg-cover bg-center filter blur-lg scale-110 opacity-30"
                style={{ backgroundImage: `url(${sourceImageUrl})` }}
                aria-hidden="true"
              />
            )}
            {isProcessing && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-lg z-20 animate-fade-in">
                <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <p className="text-white mt-2 font-semibold">{processingMessage}</p>
              </div>
            )}
            
            {!isSimple && (
              <>
                <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: edits.colorBalance.highlights, mixBlendMode: 'multiply' }} />
                <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: edits.colorBalance.midtones, mixBlendMode: 'overlay' }} />
                <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: edits.colorBalance.shadows, mixBlendMode: 'screen' }} />
              </>
            )}

            <img 
              src={sourceImageUrl} 
              alt="Source preview" 
              className={imageClasses}
              style={imageStyle}
            />
            <button
              onClick={onReset}
              className="absolute top-2 right-2 p-1.5 bg-gray-900/70 rounded-full text-gray-300 hover:text-white hover:bg-red-600/80 transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
              aria-label="Remove image"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>

            {/* Contextual Toolbar */}
            {!isSimple && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gray-900/70 backdrop-blur-sm p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white/10">
                  <div className="relative">
                      <ToolbarButton
                          label="Crop Image"
                          onClick={() => setActivePanel(activePanel === 'crop' ? null : 'crop')}
                          isActive={activePanel === 'crop'}
                      >
                          <CropIcon className="w-6 h-6" />
                      </ToolbarButton>
                      {activePanel === 'crop' && (
                          <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-48 bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-lg shadow-2xl p-3 animate-fade-in">
                              <div className="flex justify-between items-center mb-2">
                                  <h4 className="text-xs font-bold text-white">Crop Aspect Ratio</h4>
                                  <button onClick={() => setActivePanel(null)} className="text-gray-400 hover:text-white"><XCircleIcon className="w-4 h-4" /></button>
                              </div>
                              <div className="grid grid-cols-2 gap-1.5">
                                  {['Free', '1:1', '16:9', '9:16'].map(ratio => (
                                      <button
                                          key={ratio}
                                          onClick={() => handleAspectRatioChange(ratio)}
                                          className={`w-full text-center text-xs p-1.5 rounded-md transition-colors ${edits.aspectRatio === ratio ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-purple-500/50'}`}
                                      >
                                          {ratio}
                                      </button>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>
                  
                  <ToolbarButton label="Rotate Image" onClick={handleRotate}>
                      <RotateIcon className="w-6 h-6" />
                  </ToolbarButton>
                  
                  <div className="relative">
                      <ToolbarButton
                          label="Color & Tone"
                          onClick={() => setActivePanel(activePanel === 'adjust' ? null : 'adjust')}
                          isActive={activePanel === 'adjust'}
                      >
                          <AdjustmentsIcon className="w-6 h-6" />
                      </ToolbarButton>
                      {activePanel === 'adjust' && (
                          <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-72 bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-lg shadow-2xl p-4 animate-fade-in">
                              <div className="flex justify-between items-center mb-3">
                                  <h4 className="text-sm font-bold text-white">Color & Tone Adjustments</h4>
                                  <button onClick={() => setActivePanel(null)} className="text-gray-400 hover:text-white"><XCircleIcon className="w-4 h-4" /></button>
                              </div>
                              <div className="flex flex-col gap-4">
                                  {/* Basic Tone */}
                                  <div>
                                      <h5 className="text-xs font-semibold text-gray-400 mb-2">Basic Tone</h5>
                                      <div className="grid grid-cols-3 items-center gap-2 mb-2">
                                          <label htmlFor="brightness" className="text-xs text-gray-300 col-span-1">Brightness</label>
                                          <input id="brightness" type="range" min="50" max="150" value={edits.brightness} onChange={(e) => handleAdjustmentsChange('brightness', parseInt(e.target.value))} className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer col-span-2 range-slider" />
                                      </div>
                                      <div className="grid grid-cols-3 items-center gap-2">
                                          <label htmlFor="contrast" className="text-xs text-gray-300 col-span-1">Contrast</label>
                                          <input id="contrast" type="range" min="50" max="150" value={edits.contrast} onChange={(e) => handleAdjustmentsChange('contrast', parseInt(e.target.value))} className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer col-span-2 range-slider" />
                                      </div>
                                  </div>

                                  {/* Color */}
                                  <div>
                                      <h5 className="text-xs font-semibold text-gray-400 mb-2">Color</h5>
                                      <div className="grid grid-cols-3 items-center gap-2 mb-2">
                                          <label htmlFor="hue" className="text-xs text-gray-300 col-span-1">Hue</label>
                                          <input id="hue" type="range" min="-180" max="180" value={edits.hue} onChange={(e) => handleAdjustmentsChange('hue', parseInt(e.target.value))} className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer col-span-2 range-slider" />
                                      </div>
                                      <div className="grid grid-cols-3 items-center gap-2">
                                          <label htmlFor="saturation" className="text-xs text-gray-300 col-span-1">Saturation</label>
                                          <input id="saturation" type="range" min="0" max="200" value={edits.saturation} onChange={(e) => handleAdjustmentsChange('saturation', parseInt(e.target.value))} className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer col-span-2 range-slider" />
                                      </div>
                                  </div>

                                  {/* Color Balance */}
                                  <div>
                                      <h5 className="text-xs font-semibold text-gray-400 mb-2">Color Balance</h5>
                                      <div className="grid grid-cols-3 gap-2 text-center">
                                          <label className="text-xs text-gray-300">Shadows</label>
                                          <label className="text-xs text-gray-300">Midtones</label>
                                          <label className="text-xs text-gray-300">Highlights</label>
                                          <input type="color" value={edits.colorBalance.shadows} onChange={(e) => handleColorBalanceChange('shadows', e.target.value)} className="w-full h-8 bg-transparent border-none rounded-md cursor-pointer" />
                                          <input type="color" value={edits.colorBalance.midtones} onChange={(e) => handleColorBalanceChange('midtones', e.target.value)} className="w-full h-8 bg-transparent border-none rounded-md cursor-pointer" />
                                          <input type="color" value={edits.colorBalance.highlights} onChange={(e) => handleColorBalanceChange('highlights', e.target.value)} className="w-full h-8 bg-transparent border-none rounded-md cursor-pointer" />
                                      </div>
                                  </div>
                              </div>
                              <button onClick={handleResetEdits} className="mt-4 w-full flex items-center justify-center gap-2 text-center text-xs text-white bg-gray-600 hover:bg-gray-500 p-1.5 rounded-md transition-colors">
                                  <ArrowUturnLeftIcon className="w-4 h-4" /> Reset Edits
                              </button>
                          </div>
                      )}
                  </div>
                  <div className="relative">
                      <ToolbarButton
                          label="Apply Filter"
                          onClick={() => setActivePanel(activePanel === 'filter' ? null : 'filter')}
                          isActive={activePanel === 'filter'}
                      >
                          <FilterIcon className="w-6 h-6" />
                      </ToolbarButton>
                      {activePanel === 'filter' && (
                          <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-48 bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-lg shadow-2xl p-3 animate-fade-in">
                              <div className="flex justify-between items-center mb-2">
                                  <h4 className="text-xs font-bold text-white">Apply Filter</h4>
                                  <button onClick={() => setActivePanel(null)} className="text-gray-400 hover:text-white"><XCircleIcon className="w-4 h-4" /></button>
                              </div>
                              <div className="grid grid-cols-2 gap-1.5">
                                  {FILTER_OPTIONS.map(filterName => (
                                      <button
                                          key={filterName}
                                          onClick={() => handleFilterChange(filterName)}
                                          className={`w-full text-center text-xs p-1.5 rounded-md transition-colors ${edits.filter === filterName ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-purple-500/50'}`}
                                      >
                                          {filterName}
                                      </button>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>
                  <div className="w-px h-6 bg-gray-700 mx-1"></div>
                  <div className="relative">
                      <ToolbarButton
                          label="Apply Style"
                          onClick={() => setActivePanel(activePanel === 'style' ? null : 'style')}
                          isActive={activePanel === 'style'}
                      >
                          <StyleIcon className="w-6 h-6" />
                      </ToolbarButton>
                      {activePanel === 'style' && (
                        <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-48 bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-lg shadow-2xl p-3 animate-fade-in">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-xs font-bold text-white">Style Transfer</h4>
                                <button onClick={() => setActivePanel(null)} className="text-gray-400 hover:text-white"><XCircleIcon className="w-4 h-4" /></button>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                {STYLE_OPTIONS.map(style => (
                                    <button
                                        key={style}
                                        onClick={() => { onApplyStyle(style); setActivePanel(null); }}
                                        disabled={isProcessing}
                                        className="w-full text-left text-xs text-gray-300 hover:bg-purple-500/50 p-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-wait"
                                    >
                                        {style}
                                    </button>
                                ))}
                            </div>
                        </div>
                      )}
                  </div>
                   <div className="relative">
                      <ToolbarButton
                          label="Expand Image"
                          onClick={() => setActivePanel(activePanel === 'expand' ? null : 'expand')}
                          isActive={activePanel === 'expand'}
                      >
                          <ExpandIcon className="w-6 h-6" />
                      </ToolbarButton>
                      {activePanel === 'expand' && <SubPanel title="Outpainting" options={['Expand 25%', 'Expand 50%', 'Fill Canvas']} onClose={() => setActivePanel(null)} />}
                  </div>
                  <div className="relative">
                      <ToolbarButton
                          label="Upscale Image"
                          onClick={() => setActivePanel(activePanel === 'upscale' ? null : 'upscale')}
                          isActive={activePanel === 'upscale'}
                      >
                          <UpscaleIcon className="w-6 h-6" />
                      </ToolbarButton>
                      {activePanel === 'upscale' && 
                          <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-48 bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-lg shadow-2xl p-3 animate-fade-in">
                              <div className="flex justify-between items-center mb-2">
                                  <h4 className="text-xs font-bold text-white">Enhance Resolution</h4>
                                  <button onClick={() => setActivePanel(null)} className="text-gray-400 hover:text-white"><XCircleIcon className="w-4 h-4" /></button>
                              </div>
                              <p className="text-xs text-gray-400 mb-2">Improve image quality for printing.</p>
                              <button
                                  onClick={() => { onUpscale(); setActivePanel(null); }}
                                  disabled={isProcessing}
                                  className="w-full text-center text-xs text-white bg-purple-600 hover:bg-purple-700 p-1.5 rounded-md transition-colors disabled:bg-gray-500"
                              >
                                  {isUpscaling ? 'Processing...' : 'Start Upscaling'}
                              </button>
                          </div>
                      }
                  </div>
                   <div className="relative">
                      <ToolbarButton
                          label="Edit with Brush"
                          onClick={() => setActivePanel(activePanel === 'brush' ? null : 'brush')}
                          isActive={activePanel === 'brush'}
                      >
                          <PaintBrushIcon className="w-6 h-6" />
                      </ToolbarButton>
                      {activePanel === 'brush' && <SubPanel title="Brush Tools" options={['Remove Object', 'Replace Object', 'Recolor Area']} onClose={() => setActivePanel(null)} />}
                  </div>
              </div>
            )}
          </div>
        ) : (
          <label
            className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ${
              isDragging ? 'border-purple-400 bg-gray-700' : 'border-gray-600 bg-gray-800 hover:bg-gray-700/50'
            }`}
            onDragEnter={handleDragEvents}
            onDragLeave={handleDragEvents}
            onDragOver={handleDragEvents}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadIcon className="w-10 h-10 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, or WEBP</p>
            </div>
            <input id="dropzone-file" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
          </label>
        )}
      </div>
       <style>
          {`
              .range-slider::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  appearance: none;
                  width: 12px;
                  height: 12px;
                  background: #c084fc;
                  cursor: pointer;
                  border-radius: 50%;
                  margin-top: -5px;
              }
              .range-slider::-moz-range-thumb {
                  width: 12px;
                  height: 12px;
                  background: #c084fc;
                  cursor: pointer;
                  border-radius: 50%;
                  border: none;
              }
              input[type="color"]::-webkit-color-swatch-wrapper {
                  padding: 0;
              }
              input[type="color"]::-webkit-color-swatch {
                  border: none;
                  border-radius: 0.375rem; /* rounded-md */
              }
              input[type="color"]::-moz-color-swatch {
                  border: none;
                  border-radius: 0.375rem; /* rounded-md */
              }
          `}
      </style>
    </div>
  );
};
