
import React, { useCallback, useState } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  sourceImageUrl: string | null;
  onReset: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, sourceImageUrl, onReset }) => {
  const [isDragging, setIsDragging] = useState(false);

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
    <div className="bg-gray-800/50 p-6 rounded-2xl shadow-md border border-gray-700">
      <h2 className="text-lg font-semibold text-gray-200 mb-4">1. Upload Your Image</h2>
      <div className="relative">
        {sourceImageUrl ? (
          <div className="relative group">
            <img src={sourceImageUrl} alt="Source preview" className="w-full h-auto max-h-80 object-contain rounded-lg" />
            <button
              onClick={onReset}
              className="absolute top-2 right-2 p-1.5 bg-gray-900/70 rounded-full text-gray-300 hover:text-white hover:bg-red-600/80 transition-all duration-200 opacity-0 group-hover:opacity-100"
              aria-label="Remove image"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>
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
