import React, { useCallback, useState } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { PaintBrushIcon } from './icons/PaintBrushIcon';
import { StyleIcon } from './icons/StyleIcon';
import { ExpandIcon } from './icons/ExpandIcon';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  sourceImageUrl: string | null;
  onReset: () => void;
}

const ToolbarButton: React.FC<{label: string, onClick: () => void, children: React.ReactNode}> = ({ label, onClick, children }) => (
    <button
        onClick={onClick}
        className="p-2 rounded-full text-gray-300 bg-gray-800/80 hover:bg-purple-600 hover:text-white transition-all duration-200"
        aria-label={label}
    >
        {children}
    </button>
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

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, sourceImageUrl, onReset }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);

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

  return (
    <div className={`bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700 transition-transform duration-300 ease-in-out ${sourceImageUrl ? 'scale-[1.02]' : 'scale-100'}`}>
      <h2 className="text-lg font-semibold text-gray-200 mb-4">1. Upload Your Image</h2>
      <div className="relative">
        {sourceImageUrl ? (
          <div className="relative group rounded-lg overflow-hidden max-h-80 flex items-center justify-center bg-black">
            <div
              className="absolute inset-0 bg-cover bg-center filter blur-lg scale-110 opacity-50"
              style={{ backgroundImage: `url(${sourceImageUrl})` }}
              aria-hidden="true"
            />
            <img 
              src={sourceImageUrl} 
              alt="Source preview" 
              className="relative w-full h-auto max-h-80 object-contain" 
            />
            <button
              onClick={onReset}
              className="absolute top-2 right-2 p-1.5 bg-gray-900/70 rounded-full text-gray-300 hover:text-white hover:bg-red-600/80 transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
              aria-label="Remove image"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>

            {/* Contextual Toolbar */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gray-900/70 backdrop-blur-sm p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="relative">
                    <ToolbarButton label="Edit with Brush" onClick={() => setActivePanel(activePanel === 'brush' ? null : 'brush')}>
                        <PaintBrushIcon className="w-6 h-6" />
                    </ToolbarButton>
                    {activePanel === 'brush' && <SubPanel title="Brush Tools" options={['Remove Object', 'Replace Object', 'Recolor Area']} onClose={() => setActivePanel(null)} />}
                </div>
                <div className="relative">
                    <ToolbarButton label="Apply Style" onClick={() => setActivePanel(activePanel === 'style' ? null : 'style')}>
                        <StyleIcon className="w-6 h-6" />
                    </ToolbarButton>
                    {activePanel === 'style' && <SubPanel title="Style Transfer" options={['Photorealistic', 'Vector Art', 'Vintage', 'Watercolor']} onClose={() => setActivePanel(null)} />}
                </div>
                 <div className="relative">
                    <ToolbarButton label="Expand Image" onClick={() => setActivePanel(activePanel === 'expand' ? null : 'expand')}>
                        <ExpandIcon className="w-6 h-6" />
                    </ToolbarButton>
                    {activePanel === 'expand' && <SubPanel title="Outpainting" options={['Expand 25%', 'Expand 50%', 'Fill Canvas']} onClose={() => setActivePanel(null)} />}
                </div>
            </div>
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
    </div>
  );
};