
import React, { useState, useEffect } from 'react';
import { DownloadIcon } from './icons/DownloadIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface ResultDisplayProps {
  generatedImageUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

const LOADING_MESSAGES = [
    "Warming up the AI's creativity...",
    "Analyzing your image and prompt...",
    "Mixing pixels and imagination...",
    "Applying the finishing touches...",
    "Almost there, creating magic!"
];


export const ResultDisplay: React.FC<ResultDisplayProps> = ({ generatedImageUrl, isLoading, error }) => {
  const handleDownload = () => {
    if (generatedImageUrl) {
      const link = document.createElement('a');
      link.href = generatedImageUrl;
      link.download = 'generated-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const LoadingPlaceholder = () => {
    const [message, setMessage] = useState(LOADING_MESSAGES[0]);

    useEffect(() => {
        let index = 0;
        const intervalId = setInterval(() => {
            index = (index + 1) % LOADING_MESSAGES.length;
            setMessage(LOADING_MESSAGES[index]);
        }, 2500);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800/50 rounded-2xl p-8 text-center relative overflow-hidden">
            <SparkleBackground />
            <SparklesIcon className="w-12 h-12 text-purple-400 mb-4 animate-spin" style={{ animationDuration: '3s' }}/>
            <h3 className="text-xl font-semibold text-gray-200">Generating Your Image</h3>
            <p className="text-gray-400 mt-2 h-5 transition-opacity duration-300 ease-in-out">
                {message}
            </p>
            <div className="w-full max-w-xs mt-8 bg-gray-700/50 rounded-full h-2.5 overflow-hidden">
                <div 
                    className="bg-purple-600 h-2.5 rounded-full animate-progress-stripes"
                    style={{
                        backgroundImage: 'linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent)',
                        backgroundSize: '1rem 1rem',
                        width: '100%'
                    }}
                />
            </div>
        </div>
    );
  };

  const SparkleBackground = () => (
    <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-cyan-500/20 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
    </div>
  );
  
  const InitialState = () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800/50 rounded-2xl p-8 text-center border border-gray-700">
        <PhotoIcon className="w-16 h-16 text-gray-600 mb-4" />
        <h3 className="text-xl font-semibold text-gray-400">Your generated image will appear here</h3>
        <p className="text-gray-500 mt-2">Upload an image and provide a prompt to get started.</p>
    </div>
  );
  
  const ErrorState = () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-red-900/20 border border-red-500/50 rounded-2xl p-8 text-center">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mb-4" />
        <h3 className="text-xl font-semibold text-red-300">An Error Occurred</h3>
        <p className="text-red-400 mt-2">{error}</p>
      </div>
  );

  return (
    <div className="w-full h-full min-h-[40rem] lg:min-h-0 bg-gray-800/30 rounded-2xl p-4 border border-gray-700/50 flex flex-col relative overflow-hidden">
        <div className="flex-grow flex items-center justify-center">
            {isLoading ? <LoadingPlaceholder /> :
             error ? <ErrorState /> :
             generatedImageUrl ? (
                 <div className="relative group w-full h-full flex items-center justify-center">
                     <img src={generatedImageUrl} alt="Generated result" className="max-w-full max-h-full object-contain rounded-lg" />
                     <button
                        onClick={handleDownload}
                        className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-gray-900/70 text-white rounded-lg hover:bg-purple-600 transition-all duration-300 opacity-0 group-hover:opacity-100"
                        >
                        <DownloadIcon className="w-5 h-5" />
                        Download
                    </button>
                 </div>
             ) : (
                <InitialState />
             )}
        </div>
    </div>
  );
};