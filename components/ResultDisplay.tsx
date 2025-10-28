import React, { useState, useEffect } from 'react';
import { DownloadIcon } from './icons/DownloadIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ShopifyIcon } from './icons/ShopifyIcon';
import { GeneratedImage } from '../App';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';


interface ResultDisplayProps {
  generatedImages: GeneratedImage[];
  isLoading: boolean;
  error: string | null;
  onPushToShopify: () => void;
  showShopifyButton: boolean;
  activeResultIndex: number;
  setActiveResultIndex: (index: number) => void;
  loadingProgress: { current: number, total: number } | null;
}

const LOADING_MESSAGES = [
    "Warming up the AI's creativity...",
    "Analyzing your image and prompt...",
    "Mixing pixels and imagination...",
    "Applying the finishing touches...",
    "Almost there, creating magic!"
];


export const ResultDisplay: React.FC<ResultDisplayProps> = ({ 
  generatedImages, 
  isLoading, 
  error, 
  onPushToShopify, 
  showShopifyButton,
  activeResultIndex,
  setActiveResultIndex,
  loadingProgress,
}) => {
  
  const currentImage = generatedImages[activeResultIndex];

  const handleDownload = () => {
    if (currentImage) {
      const link = document.createElement('a');
      link.href = currentImage.url;
      link.download = `${currentImage.name.replace(/\s+/g, '_')}-mockup.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  const handlePrev = () => {
    setActiveResultIndex(Math.max(0, activeResultIndex - 1));
  };
  
  const handleNext = () => {
    setActiveResultIndex(Math.min(generatedImages.length - 1, activeResultIndex + 1));
  };

  const LoadingPlaceholder = () => {
    const [message, setMessage] = useState(LOADING_MESSAGES[0]);
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        const messageDuration = 2700;
        const fadeDuration = 500; // should match transition-duration

        const intervalId = setInterval(() => {
            setIsFading(true);
            setTimeout(() => {
                setMessage(prevMessage => {
                    const currentIndex = LOADING_MESSAGES.indexOf(prevMessage);
                    const nextIndex = (currentIndex + 1) % LOADING_MESSAGES.length;
                    return LOADING_MESSAGES[nextIndex];
                });
                setIsFading(false);
            }, fadeDuration);
        }, messageDuration);

        return () => clearInterval(intervalId);
    }, []);

    const progressText = loadingProgress 
        ? `Generating mockup ${loadingProgress.current} of ${loadingProgress.total}...`
        : "Generating Your Image";

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800/50 rounded-2xl p-8 text-center relative overflow-hidden">
            <SparkleBackground />
            <SparklesIcon className="w-12 h-12 text-purple-400 mb-4 animate-spin" style={{ animationDuration: '3s' }}/>
            <h3 className="text-xl font-semibold text-gray-200">{progressText}</h3>
            <p className={`text-gray-400 mt-2 h-5 transition-opacity duration-500 ease-in-out ${isFading ? 'opacity-0' : 'opacity-100'}`}>
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
             generatedImages.length > 0 && currentImage ? (
                 <div className="w-full h-full flex flex-col">
                     <div className="relative flex-grow w-full flex items-center justify-center">
                         <img src={currentImage.url} alt={currentImage.name} className="max-w-full max-h-full object-contain rounded-lg" />
                         
                         {/* Carousel controls */}
                         {generatedImages.length > 1 && (
                            <>
                                <button 
                                    onClick={handlePrev} 
                                    disabled={activeResultIndex === 0}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-gray-900/50 rounded-full text-white hover:bg-gray-700 disabled:opacity-0 transition-all"
                                    aria-label="Previous image"
                                >
                                    <ChevronLeftIcon className="w-6 h-6" />
                                </button>
                                <button 
                                    onClick={handleNext} 
                                    disabled={activeResultIndex === generatedImages.length - 1}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gray-900/50 rounded-full text-white hover:bg-gray-700 disabled:opacity-0 transition-all"
                                    aria-label="Next image"
                                >
                                    <ChevronRightIcon className="w-6 h-6" />
                                </button>
                                 <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900/80 backdrop-blur-sm rounded-full text-sm font-semibold">
                                    {currentImage.name} ({activeResultIndex + 1} / {generatedImages.length})
                                 </div>
                            </>
                         )}
                     </div>

                     <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <button
                          onClick={handleDownload}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 text-base font-medium bg-gray-700/80 backdrop-blur-sm text-white rounded-lg hover:bg-purple-600 transition-colors duration-200"
                          >
                          <DownloadIcon className="w-5 h-5" />
                          Download
                        </button>
                        {showShopifyButton && (
                          <button
                            onClick={onPushToShopify}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 text-base font-medium bg-green-600/90 backdrop-blur-sm text-white rounded-lg hover:bg-green-500 transition-colors duration-200"
                          >
                              <ShopifyIcon className="w-5 h-5" />
                              Create Product Listing
                          </button>
                        )}
                     </div>
                 </div>
             ) : (
                <InitialState />
             )}
        </div>
    </div>
  );
};