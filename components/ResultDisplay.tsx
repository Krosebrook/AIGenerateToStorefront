import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DownloadIcon } from './icons/DownloadIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ShopifyIcon } from './icons/ShopifyIcon';
import { GeneratedImage } from '../App';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { MagnifyingGlassPlusIcon } from './icons/MagnifyingGlassPlusIcon';
import { MagnifyingGlassMinusIcon } from './icons/MagnifyingGlassMinusIcon';
import { ArrowUturnLeftIcon } from './icons/ArrowUturnLeftIcon';
import { UpscaleIcon } from './icons/UpscaleIcon';


interface ResultDisplayProps {
  generatedImages: GeneratedImage[];
  isLoading: boolean;
  onPushToShopify: () => void;
  showShopifyButton: boolean;
  activeResultIndex: number;
  setActiveResultIndex: (index: number) => void;
  loadingProgress: { current: number, total: number } | null;
  onUpscale: (index: number) => void;
  upscalingIndex: number | null;
}

const LOADING_MESSAGES = [
    "Warming up the AI's creativity...",
    "Analyzing your image and prompt...",
    "Mixing pixels and imagination...",
    "Consulting with digital muses...",
    "Translating ideas into visuals...",
    "Painting with algorithms...",
    "Applying the finishing touches...",
    "Almost there, creating magic!"
];


export const ResultDisplay: React.FC<ResultDisplayProps> = ({ 
  generatedImages, 
  isLoading, 
  onPushToShopify, 
  showShopifyButton,
  activeResultIndex,
  setActiveResultIndex,
  loadingProgress,
  onUpscale,
  upscalingIndex,
}) => {
  
  const currentImage = generatedImages[activeResultIndex];
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const handleResetView = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    handleResetView();
  }, [currentImage, handleResetView]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only main button
    e.preventDefault();
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    if (imageContainerRef.current) {
      imageContainerRef.current.style.cursor = 'grabbing';
    }
  }, [position.x, position.y]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const newX = e.clientX - dragStartRef.current.x;
    const newY = e.clientY - dragStartRef.current.y;
    setPosition({ x: newX, y: newY });
  }, []);

  const onMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    if (imageContainerRef.current) {
      imageContainerRef.current.style.cursor = 'grab';
    }
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomIntensity = 0.1;
    // deltaY is negative when scrolling up (zoom in), positive when scrolling down (zoom out)
    const newScale = scale - e.deltaY * zoomIntensity * 0.05;
    const clampedScale = Math.max(0.5, Math.min(newScale, 5));
    setScale(clampedScale);
  }, [scale]);

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

    const progressPercentage = loadingProgress 
        ? (loadingProgress.current / loadingProgress.total) * 100
        : 0;

    const progressText = loadingProgress 
        ? `Generating mockup ${loadingProgress.current} of ${loadingProgress.total}...`
        : "Generating Your Image";

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800/50 rounded-2xl p-8 text-center relative overflow-hidden">
            <SparkleBackground />
            <div className="relative z-10 flex flex-col items-center justify-center">
                <SparklesIcon className="w-12 h-12 text-purple-400 mb-4 animate-spin" style={{ animationDuration: '3s' }}/>
                <h3 className="text-xl font-semibold text-gray-200">{progressText}</h3>
                <p className={`text-gray-400 mt-2 h-5 transition-opacity duration-500 ease-in-out ${isFading ? 'opacity-0' : 'opacity-100'}`}>
                    {message}
                </p>
                <div className="w-full max-w-xs mt-8 bg-gray-700/50 rounded-full h-2.5 overflow-hidden">
                    <div 
                        className="h-2.5 rounded-full transition-all duration-300 ease-linear animate-shimmer"
                        style={{
                            width: `${progressPercentage}%`
                        }}
                    />
                </div>
            </div>
        </div>
    );
  };

  // FIX: Explicitly type Sparkle as a React.FC to allow the 'key' prop, which is required when rendering lists.
  const Sparkle: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
    <div 
        className="absolute bg-white rounded-full"
        style={{
            ...style,
            animation: `sparkle-anim ${Math.random() * 3 + 2}s ease-in-out infinite`,
        }}
    />
  );

  const SparkleBackground = () => (
    <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500 rounded-full filter blur-3xl animate-drift-1"></div>
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-cyan-500 rounded-full filter blur-3xl animate-drift-2"></div>
        {Array.from({ length: 15 }).map((_, i) => (
          <Sparkle key={i} style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              animationDelay: `${Math.random() * 4}s`,
          }} />
        ))}
    </div>
  );
  
  const InitialState = () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800/50 rounded-2xl p-8 text-center border border-gray-700">
        <PhotoIcon className="w-16 h-16 text-gray-600 mb-4" />
        <h3 className="text-xl font-semibold text-gray-400">Your generated image will appear here</h3>
        <p className="text-gray-500 mt-2">Upload an image and provide a prompt to get started.</p>
    </div>
  );
  
  const isCurrentlyUpscaling = upscalingIndex === activeResultIndex;

  return (
    <div className="w-full h-full min-h-[40rem] lg:min-h-0 bg-gray-800/30 rounded-2xl p-4 border border-gray-700/50 flex flex-col relative overflow-hidden">
        <div className="flex-grow flex items-center justify-center">
            {isLoading ? <LoadingPlaceholder /> :
             generatedImages.length > 0 && currentImage ? (
                 <div className="w-full h-full flex flex-col">
                     <div 
                        ref={imageContainerRef}
                        className="relative flex-grow w-full flex items-center justify-center overflow-hidden cursor-grab"
                        onMouseDown={onMouseDown}
                        onMouseMove={onMouseMove}
                        onMouseUp={onMouseUp}
                        onMouseLeave={onMouseUp}
                        onWheel={onWheel}
                     >
                        {isCurrentlyUpscaling && (
                          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-lg z-20 animate-fade-in">
                            <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <p className="text-white mt-2 font-semibold">Upscaling Image...</p>
                          </div>
                        )}
                         <img 
                            src={currentImage.url} 
                            alt={currentImage.name} 
                            className="max-w-full max-h-full object-contain rounded-lg transition-transform duration-100"
                            style={{ 
                                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                                touchAction: 'none' // Essential for preventing default touch behaviors
                            }}
                         />
                         
                         {/* Zoom Controls */}
                         <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gray-900/70 backdrop-blur-sm p-2 rounded-full shadow-lg">
                            <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))} className="p-2 text-gray-300 hover:text-white hover:bg-purple-600 rounded-full transition-colors" aria-label="Zoom out">
                                <MagnifyingGlassMinusIcon className="w-5 h-5" />
                            </button>
                            <input
                                type="range"
                                min="0.5"
                                max="5"
                                step="0.01"
                                value={scale}
                                onChange={(e) => setScale(parseFloat(e.target.value))}
                                className="w-32 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer range-slider"
                                aria-label="Zoom slider"
                            />
                            <style>
                                {`
                                    .range-slider::-webkit-slider-thumb {
                                        -webkit-appearance: none;
                                        appearance: none;
                                        width: 16px;
                                        height: 16px;
                                        background: #a855f7;
                                        cursor: pointer;
                                        border-radius: 50%;
                                    }
                                    .range-slider::-moz-range-thumb {
                                        width: 16px;
                                        height: 16px;
                                        background: #a855f7;
                                        cursor: pointer;
                                        border-radius: 50%;
                                        border: none;
                                    }
                                `}
                            </style>
                             <button onClick={() => setScale(s => Math.min(5, s + 0.2))} className="p-2 text-gray-300 hover:text-white hover:bg-purple-600 rounded-full transition-colors" aria-label="Zoom in">
                                <MagnifyingGlassPlusIcon className="w-5 h-5" />
                            </button>
                            <div className="w-px h-5 bg-gray-600 mx-1"></div>
                             <button onClick={handleResetView} className="p-2 text-gray-300 hover:text-white hover:bg-purple-600 rounded-full transition-colors" aria-label="Reset view">
                                <ArrowUturnLeftIcon className="w-5 h-5" />
                            </button>
                         </div>
                         
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
                          onClick={() => onUpscale(activeResultIndex)}
                          disabled={upscalingIndex !== null}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 text-base font-medium bg-blue-600/90 backdrop-blur-sm text-white rounded-lg hover:bg-blue-500 transition-colors duration-200 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                            {isCurrentlyUpscaling ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Upscaling...
                                </>
                            ) : (
                                <>
                                    <UpscaleIcon className="w-5 h-5" />
                                    Upscale
                                </>
                            )}
                        </button>
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