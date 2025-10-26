import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ControlPanel } from './components/ControlPanel';
import { ResultDisplay } from './components/ResultDisplay';
import { ShopifyModal } from './components/ShopifyModal';
import { ModeSelector, AppMode } from './components/ModeSelector';
import { editImageWithPrompt, suggestProductsForImage, generateProductDetails, generateImageFromPrompt } from './services/geminiService';
import { fileToBase64, dataURLtoFile } from './utils/fileUtils';

export interface ShopifyProductDetails {
  title: string;
  description: string;
}

export default function App(): React.ReactElement {
  const [mode, setMode] = useState<AppMode>('edit');
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [sourceImageUrl, setSourceImageUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [productSuggestions, setProductSuggestions] = useState<string[]>([]);
  const [isShopifyModalOpen, setIsShopifyModalOpen] = useState(false);
  const [selectedProductName, setSelectedProductName] = useState('');


  const handleImageUpload = useCallback(async (file: File) => {
    setSourceImage(file);
    setError(null);
    setGeneratedImageUrl(null);
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
    if (!sourceImage || !sourceImageUrl || !prompt) {
      setError('Please upload an image and enter a prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImageUrl(null);

    try {
      const base64Data = sourceImageUrl.split(',')[1];
      const newImageUrl = await editImageWithPrompt(base64Data, sourceImage.type, prompt);
      setGeneratedImageUrl(newImageUrl);
    } catch (err) {
      console.error(err);
      setError('Failed to generate image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [sourceImage, sourceImageUrl, prompt]);

  const handleGenerateFromPrompt = useCallback(async (newPrompt: string) => {
    if (!newPrompt.trim()) {
      setError('Please enter a prompt to generate an image.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setGeneratedImageUrl(null);
    setSourceImage(null);
    setSourceImageUrl(null);

    try {
      const newImageUrl = await generateImageFromPrompt(newPrompt);
      setGeneratedImageUrl(newImageUrl);
      
      // Seamlessly transition to edit mode with the new image
      const newImageFile = await dataURLtoFile(newImageUrl, 'generated-image.png');
      setSourceImage(newImageFile);
      setSourceImageUrl(newImageUrl);
      setMode('edit');

    } catch (err) {
      console.error(err);
      setError('Failed to generate image from prompt. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setSourceImage(null);
    setSourceImageUrl(null);
    setPrompt('');
    setGeneratedImageUrl(null);
    setError(null);
    setIsLoading(false);
    setProductSuggestions([]);
    setIsShopifyModalOpen(false);
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
    if (!generatedImageUrl) return null;
     try {
      const base64Data = generatedImageUrl.split(',')[1];
      const details = await generateProductDetails(base64Data, 'image/png', productName);
      return details;
    } catch (err) {
      console.error('Failed to generate product details', err);
      return { title: '', description: '' };
    }
  }, [generatedImageUrl]);

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
                  onProductSelect={setSelectedProductName}
                />
              </div>
              <div className="flex flex-col">
                 <ResultDisplay
                  generatedImageUrl={generatedImageUrl}
                  isLoading={isLoading}
                  error={error}
                  onPushToShopify={() => setIsShopifyModalOpen(true)}
                  showShopifyButton={mode === 'edit' && !!generatedImageUrl}
                />
              </div>
            </div>
          </div>
        </main>
        <footer className="text-center p-4 text-gray-500 text-sm">
          <p>Powered by Gemini AI</p>
        </footer>
      </div>
      {generatedImageUrl && (
         <ShopifyModal
            isOpen={isShopifyModalOpen}
            onClose={() => setIsShopifyModalOpen(false)}
            imageUrl={generatedImageUrl}
            productName={selectedProductName || 'product'}
            onGetProductDetails={handleGetProductDetails}
        />
      )}
    </>
  );
}