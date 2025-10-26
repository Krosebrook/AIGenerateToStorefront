
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ControlPanel } from './components/ControlPanel';
import { ResultDisplay } from './components/ResultDisplay';
import { editImageWithPrompt } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';

export default function App(): React.ReactElement {
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [sourceImageUrl, setSourceImageUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = useCallback(async (file: File) => {
    setSourceImage(file);
    setError(null);
    setGeneratedImageUrl(null);
    try {
      const base64 = await fileToBase64(file);
      setSourceImageUrl(base64);
    } catch (err) {
      setError('Failed to read image file.');
      setSourceImageUrl(null);
    }
  }, []);

  const handleGenerate = useCallback(async () => {
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

  const handleReset = useCallback(() => {
    setSourceImage(null);
    setSourceImageUrl(null);
    setPrompt('');
    setGeneratedImageUrl(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-sans">
      <Header />
      <main className="flex-grow p-4 md:p-8">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col gap-8">
              <ImageUploader 
                onImageUpload={handleImageUpload} 
                sourceImageUrl={sourceImageUrl} 
                onReset={handleReset}
              />
              <ControlPanel
                prompt={prompt}
                setPrompt={setPrompt}
                onSubmit={handleGenerate}
                onReset={handleReset}
                isLoading={isLoading}
                isImageUploaded={!!sourceImage}
              />
            </div>
            <div className="flex flex-col">
               <ResultDisplay
                generatedImageUrl={generatedImageUrl}
                isLoading={isLoading}
                error={error}
              />
            </div>
          </div>
        </div>
      </main>
      <footer className="text-center p-4 text-gray-500 text-sm">
        <p>Powered by Gemini 2.5 Flash Image</p>
      </footer>
    </div>
  );
}
