import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ControlPanel, MerchPreset } from './components/ControlPanel';
import { ResultDisplay } from './components/ResultDisplay';
import { ShopifyModal } from './components/ShopifyModal';
import { ModeSelector, AppMode } from './components/ModeSelector';
import { editImageWithPrompt, suggestProductsForImage, generateProductDetails, generateImageFromPrompt, fetchLatestNews, GroundingSource } from './services/geminiService';
import { fileToBase64, dataURLtoFile } from './utils/fileUtils';
import { BrandKit } from './components/BrandKitPanel';
import { NewsPanel } from './components/NewsPanel';

export interface ShopifyProductDetails {
  title: string;
  description: string;
  socialMediaCaption: string;
  adCopy: string[];
  hashtags: string[];
}

export interface GeneratedImage {
  name: string;
  url: string;
}

export interface NewsArticle {
  title: string;
  summary: string;
  url: string;
}

const initialBrandKit: BrandKit = {
  logo: null,
  colors: [],
};

const GenerateInputPanel: React.FC<{prompt: string, setPrompt: (p: string) => void, isLoading: boolean}> = ({ prompt, setPrompt, isLoading }) => (
    <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700">
        <label htmlFor="generate-prompt" className="block text-lg font-semibold text-gray-200 mb-4">1. Describe Your Design</label>
        <textarea
            id="generate-prompt"
            rows={8}
            className="block p-2.5 w-full text-sm text-gray-100 bg-gray-700 rounded-lg border border-gray-600 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 transition disabled:opacity-70"
            placeholder="e.g., A cute cat astronaut floating in space, digital art"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
            aria-label="Design prompt"
        />
    </div>
);

const EditPromptPanel: React.FC<{prompt: string, setPrompt: (p: string) => void, isLoading: boolean, selectedPresets: MerchPreset[]}> = ({ prompt, setPrompt, isLoading, selectedPresets }) => (
    <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700">
        <label htmlFor="edit-prompt" className="block text-lg font-semibold text-gray-200 mb-4">2. Custom Prompt</label>
        <textarea
            id="edit-prompt"
            rows={3}
            className="block p-2.5 w-full text-sm text-gray-100 bg-gray-700 rounded-lg border border-gray-600 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 transition disabled:opacity-50"
            placeholder={
              selectedPresets.length > 0
                ? 'Using selected product templates. Clear selection to use a custom prompt.'
                : 'e.g., place this design on a tote bag made of canvas'
            }
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading || selectedPresets.length > 0}
            aria-label="Custom edit prompt"
        />
    </div>
);

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
  const [loadingProgress, setLoadingProgress] = useState<{ current: number, total: number, message: string } | null>(null);

  const [brandKit, setBrandKit] = useState<BrandKit>(initialBrandKit);
  const [useBrandKit, setUseBrandKit] = useState<boolean>(false);
  const [customPresets, setCustomPresets] = useState<MerchPreset[]>([]);

  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [newsSources, setNewsSources] = useState<GroundingSource[]>([]);
  const [isFetchingNews, setIsFetchingNews] = useState<boolean>(false);
  const [newsError, setNewsError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedKit = localStorage.getItem('brandKit');
      if (savedKit) {
        setBrandKit(JSON.parse(savedKit));
      }
    } catch (e) {
      console.error("Failed to parse Brand Kit from localStorage", e);
      localStorage.removeItem('brandKit');
    }

    try {
      const savedPresets = localStorage.getItem('customMerchPresets');
      if (savedPresets) {
        setCustomPresets(JSON.parse(savedPresets));
      }
    } catch (e) {
      console.error("Failed to parse custom presets from localStorage", e);
      localStorage.removeItem('customMerchPresets');
    }
  }, []);

  const handleUpdateBrandKit = useCallback((newKit: BrandKit) => {
    setBrandKit(newKit);
    localStorage.setItem('brandKit', JSON.stringify(newKit));
  }, []);

  const handleUpdateCustomPresets = useCallback((newPresets: MerchPreset[]) => {
    setCustomPresets(newPresets);
    localStorage.setItem('customMerchPresets', JSON.stringify(newPresets));
  }, []);

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
  
  const handleGenerateBatch = useCallback(async (presetsToRun: MerchPreset[]) => {
    if (!sourceImage || !sourceImageUrl) {
      setError('Please upload an image first.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);
    setActiveResultIndex(0);
    setSelectedPresets(presetsToRun);

    const base64Data = sourceImageUrl.split(',')[1];
    
    setLoadingProgress({ current: 0, total: presetsToRun.length, message: 'Initializing batch...' });
    const results: GeneratedImage[] = [];
    for (let i = 0; i < presetsToRun.length; i++) {
      const preset = presetsToRun[i];
      setLoadingProgress({ current: i + 1, total: presetsToRun.length, message: `Applying "${preset.name}"...` });
      try {
        const newImageUrl = await editImageWithPrompt(base64Data, sourceImage.type, preset.template, negativePrompt, useBrandKit ? brandKit : undefined);
        results.push({ name: preset.name, url: newImageUrl });
        setGeneratedImages([...results]); // Update incrementally
      } catch (err) {
        console.error(`Failed to generate image for ${preset.name}:`, err);
        // Add a placeholder or error image if one fails? For now, we just skip.
      }
    }
    
    setIsLoading(false);
    setLoadingProgress(null);

  }, [sourceImage, sourceImageUrl, negativePrompt, useBrandKit, brandKit]);


  const handleGenerateEdit = useCallback(async () => {
    const customPrompt = prompt.trim();
    if (selectedPresets.length > 0) {
      handleGenerateBatch(selectedPresets);
    } else if (customPrompt) {
      if (!sourceImage || !sourceImageUrl) {
        setError('Please upload an image first.');
        return;
      }
      setIsLoading(true);
      setError(null);
      setGeneratedImages([]);
      setActiveResultIndex(0);
      setLoadingProgress({ current: 1, total: 1, message: 'Applying your custom edit...' });
      const base64Data = sourceImageUrl.split(',')[1];
      try {
        const newImageUrl = await editImageWithPrompt(base64Data, sourceImage.type, customPrompt, negativePrompt, useBrandKit ? brandKit : undefined);
        setGeneratedImages([{ name: 'Custom Edit', url: newImageUrl }]);
      } catch(err) {
        console.error(err);
        setError('An error occurred during generation. Please try again.');
      } finally {
        setIsLoading(false);
        setLoadingProgress(null);
      }
    } else {
       setError('Please select a product or enter a custom prompt.');
    }
  }, [sourceImage, sourceImageUrl, prompt, negativePrompt, selectedPresets, handleGenerateBatch, useBrandKit, brandKit]);

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
    setLoadingProgress({ current: 1, total: variations, message: 'Generating variations...' });

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
    setUseBrandKit(false);
    setMode('edit');
    setNewsArticles([]);
    setNewsSources([]);
    setNewsError(null);
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
      return { 
        title: '', 
        description: '',
        socialMediaCaption: '',
        adCopy: [],
        hashtags: []
      };
    }
  }, [generatedImages, activeResultIndex]);

  const handleFetchNews = useCallback(async () => {
    setIsFetchingNews(true);
    setNewsError(null);
    setNewsArticles([]);
    setNewsSources([]);
    try {
      const { articles, sources } = await fetchLatestNews();
      setNewsArticles(articles);
      setNewsSources(sources);
    } catch (err) {
      console.error(err);
      setNewsError('Could not fetch the latest news. Please try again.');
    } finally {
      setIsFetchingNews(false);
    }
  }, []);
  
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
                <div key={mode} className="animate-fade-in flex flex-col gap-8">
                  {mode === 'generate' ? (
                      <GenerateInputPanel prompt={prompt} setPrompt={setPrompt} isLoading={isLoading} />
                  ) : (
                    <>
                      <ImageUploader 
                        onImageUpload={handleImageUpload} 
                        sourceImageUrl={sourceImageUrl} 
                        onReset={handleReset}
                      />
                      {sourceImageUrl && (
                        <EditPromptPanel 
                          prompt={prompt} 
                          setPrompt={setPrompt} 
                          isLoading={isLoading} 
                          selectedPresets={selectedPresets}
                        />
                      )}
                    </>
                  )}
                </div>
                <ControlPanel
                  mode={mode}
                  onGenerateEdit={handleGenerateEdit}
                  onGenerateNew={handleGenerateFromPrompt}
                  onGenerateBatch={handleGenerateBatch}
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
                  brandKit={brandKit}
                  onUpdateBrandKit={handleUpdateBrandKit}
                  useBrandKit={useBrandKit}
                  setUseBrandKit={setUseBrandKit}
                  customPresets={customPresets}
                  onUpdateCustomPresets={handleUpdateCustomPresets}
                  onFetchNews={handleFetchNews}
                  isFetchingNews={isFetchingNews}
                  loadingProgress={loadingProgress}
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
             <NewsPanel 
                articles={newsArticles}
                sources={newsSources}
                isLoading={isFetchingNews}
                error={newsError}
              />
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