import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ControlPanel, MerchPreset } from './components/ControlPanel';
import { ResultDisplay } from './components/ResultDisplay';
import { ShopifyModal } from './components/ShopifyModal';
import { ModeSelector, AppMode } from './components/ModeSelector';
import { editImageWithPrompt, suggestProductsForImage, generateProductDetails, generateImageFromPrompt } from './services/geminiService';
import { fileToBase64, dataURLtoFile } from './utils/fileUtils';

export interface ShopifyProductDetails {
  title: string;
  description: string;
}

export interface GeneratedImage {
  name: string;
  url: string;
}

export default function App(): React.ReactElement {
  const [mode, setMode] = useState<AppMode>('edit');
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [sourceImageUrl, setSourceImageUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [negativePrompt, setNegativePrompt] = useState<string>('');
  const [variations, setVariations] = useState<number>(1);
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [productSuggestions, setProductSuggestions] = useState<string[]>([]);
  const [isShopifyModalOpen, setIsShopifyModalOpen] = useState(false);
  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const [selectedPresets, setSelectedPresets] = useState<MerchPreset[]>([]);
  const [loadingProgress, setLoadingProgress] = useState<{ current: number, total: number } | null>(null);


  const handleImageUpload = useCallback(async (file: File) => {
    setSourceImage(file);
    setError(null);
    setGeneratedImages([]);
    setProductSuggestions([]);
    try {
      const base64 = await fileToBase64(file);
      setSourceImageUrl(base64);
    } catch (err) {
      setError('Failed to read image file.');
      setSourceImageUrl(null);
    }
  }, []);

  const handleGenerateEdit = useCallback(async () => {
    if (!sourceImage || !sourceImageUrl) {
      setError('Please upload an image first.');
      return;
    }
    
    const presetsToRun = selectedPresets;
    const customPrompt = prompt.trim();

    if (presetsToRun.length === 0 && !customPrompt) {
        setError('Please select a product or enter a custom prompt.');
        return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);
    setActiveResultIndex(0);

    const base64Data = sourceImageUrl.split(',')[1];

    try {
      if (presetsToRun.length > 0) { // Batch mode or single preset mode
        setLoadingProgress({ current: 0, total: presetsToRun.length });
        for (let i = 0; i < presetsToRun.length; i++) {
          const preset = presetsToRun[i];
          setLoadingProgress({ current: i + 1, total: presetsToRun.length });
          try {
            const newImageUrl = await editImageWithPrompt(base64Data, sourceImage.type, preset.template, negativePrompt);
            setGeneratedImages(prev => [...prev, { name: preset.name, url: newImageUrl }]);
          } catch (err) {
            console.error(`Failed to generate image for ${preset.name}:`, err);
          }
        }
      } else { // Custom prompt mode
        setLoadingProgress({ current: 1, total: 1 });
        const newImageUrl = await editImageWithPrompt(base64Data, sourceImage.type, customPrompt, negativePrompt);
        setGeneratedImages([{ name: 'Custom Edit', url: newImageUrl }]);
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during generation. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingProgress(null);
    }
  }, [sourceImage, sourceImageUrl, prompt, negativePrompt, selectedPresets]);

  const handleGenerateFromPrompt = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt to generate an image.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);
    setSourceImage(null);
    setSourceImageUrl(null);
    setLoadingProgress({ current: 1, total: variations });

    try {
      const newImageUrls = await generateImageFromPrompt(prompt, negativePrompt, variations, aspectRatio);
      
      if (!newImageUrls || newImageUrls.length === 0) {
        throw new Error('API did not return any images.');
      }

      const generatedResultImages = newImageUrls.map((url, index) => ({
        name: `Variation ${index + 1}`,
        url: url,
      }));
      setGeneratedImages(generatedResultImages);
      
      // Set the first image as the source for editing
      const firstImageUrl = generatedResultImages[0].url;
      const newImageFile = await dataURLtoFile(firstImageUrl, `generated-image-1.png`);
      setSourceImage(newImageFile);
      setSourceImageUrl(firstImageUrl);
      setMode('edit');

    } catch (err) {
      console.error(err);
      setError('Failed to generate image from prompt. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingProgress(null);
    }
  }, [prompt, negativePrompt, variations, aspectRatio]);

  const handleReset = useCallback(() => {
    setSourceImage(null);
    setSourceImageUrl(null);
    setPrompt('');
    setNegativePrompt('');
    setVariations(1);
    setAspectRatio('1:1');
    setGeneratedImages([]);
    setError(null);
    setIsLoading(false);
    setProductSuggestions([]);
    setIsShopifyModalOpen(false);
    setSelectedPresets([]);
    setMode('edit');
  }, []);

  const handleSuggest = useCallback(async () => {
    if (!sourceImage || !sourceImageUrl) {
      setError('Please upload an image first to get suggestions.');
      return;
    }
    setIsSuggesting(true);
    setError(null);
    setProductSuggestions([]);
    try {
      const base64Data = sourceImageUrl.split(',')[1];
      const suggestions = await suggestProductsForImage(base64Data, sourceImage.type);
      setProductSuggestions(suggestions);
    } catch (err) {
      console.error(err);
      setError('Could not get product suggestions.');
    } finally {
      setIsSuggesting(false);
    }
  }, [sourceImage, sourceImageUrl]);

  const handleGetProductDetails = useCallback(async (productName: string): Promise<ShopifyProductDetails | null> => {
    const activeImage = generatedImages[activeResultIndex];
    if (!activeImage) return null;
     try {
      const base64Data = activeImage.url.split(',')[1];
      const details = await generateProductDetails(base64Data, 'image/png', productName);
      return details;
    } catch (err) {
      console.error('Failed to generate product details', err);
      return { title: '', description: '' };
    }
  }, [generatedImages, activeResultIndex]);
  
  const activeProduct = generatedImages[activeResultIndex];

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-sans">
        <Header />
        <main className="flex-grow p-4 md:p-8">
          <div className="container mx-auto max-w-7xl">
            <ModeSelector currentMode={mode} setMode={setMode} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
              <div className="flex flex-col gap-8">
                {mode === 'edit' && (
                  <ImageUploader 
                    onImageUpload={handleImageUpload} 
                    sourceImageUrl={sourceImageUrl} 
                    onReset={handleReset}
                  />
                )}
                <ControlPanel
                  mode={mode}
                  prompt={prompt}
                  setPrompt={setPrompt}
                  onGenerateEdit={handleGenerateEdit}
                  onGenerateNew={handleGenerateFromPrompt}
                  onReset={handleReset}
                  isLoading={isLoading}
                  isImageUploaded={!!sourceImage}
                  onSuggest={handleSuggest}
                  isSuggesting={isSuggesting}
                  suggestions={productSuggestions}
                  selectedPresets={selectedPresets}
                  onSelectedPresetsChange={setSelectedPresets}
                  negativePrompt={negativePrompt}
                  setNegativePrompt={setNegativePrompt}
                  variations={variations}
                  setVariations={setVariations}
                  aspectRatio={aspectRatio}
                  setAspectRatio={setAspectRatio}
                />
              </div>
              <div className="flex flex-col">
                 <ResultDisplay
                  generatedImages={generatedImages}
                  isLoading={isLoading}
                  error={error}
                  onPushToShopify={() => setIsShopifyModalOpen(true)}
                  showShopifyButton={mode === 'edit' && generatedImages.length > 0}
                  activeResultIndex={activeResultIndex}
                  setActiveResultIndex={setActiveResultIndex}
                  loadingProgress={loadingProgress}
                />
              </div>
            </div>
          </div>
        </main>
        <footer className="text-center p-4 text-gray-500 text-sm">
          <p>Powered by Gemini AI</p>
        </footer>
      </div>
      {activeProduct && (
         <ShopifyModal
            isOpen={isShopifyModalOpen}
            onClose={() => setIsShopifyModalOpen(false)}
            imageUrl={activeProduct.url}
            productName={activeProduct.name}
            onGetProductDetails={handleGetProductDetails}
        />
      )}
    </>
  );
}