import React, { useState } from 'react';
import { ShopifyProductDetails } from '../App';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { PhotoIcon } from './icons/PhotoIcon';

interface MarketingDisplayPanelProps {
    details: ShopifyProductDetails;
    onGenerate: () => void;
    isGenerating: boolean;
    images: Record<string, string>;
}

const CopyableField: React.FC<{label: string, value: string, isTextarea?: boolean}> = ({ label, value, isTextarea = false }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const InputComponent = isTextarea ? 'textarea' : 'input';

    return (
        <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">{label}</label>
            <div className="relative">
                <InputComponent
                    readOnly
                    value={value}
                    rows={isTextarea ? 3 : undefined}
                    className="block w-full p-2 pr-10 text-sm text-gray-200 bg-gray-900/50 rounded-lg border border-gray-600 resize-none"
                />
                <button
                    onClick={handleCopy}
                    className="absolute top-1/2 right-2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-white bg-gray-700/80 rounded-md transition"
                    aria-label={`Copy ${label}`}
                >
                    <ClipboardIcon className="w-4 h-4" />
                </button>
                {copied && <span className="absolute right-10 top-1/2 -translate-y-1/2 text-xs bg-purple-600 text-white px-2 py-0.5 rounded-md">Copied!</span>}
            </div>
        </div>
    );
};

export const MarketingDisplayPanel: React.FC<MarketingDisplayPanelProps> = ({ details, onGenerate, isGenerating, images }) => {
    const formattedHashtags = details.hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ');
    const MARKETING_ASSET_TYPES = ['Instagram Post', 'Facebook Ad', 'Pinterest Pin'];
    
    const handleDownload = (imageUrl: string, fileName: string) => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const VisualPlaceholder: React.FC<{title: string, imageUrl?: string, isGenerating: boolean}> = ({ title, imageUrl, isGenerating }) => {
        const downloadFileName = `${details.title.replace(/\s+/g, '_')}_${title.replace(/\s+/g, '_')}.png`;

        return (
            <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-gray-300">{title}</h3>
                <div className="aspect-square w-full bg-gray-900/50 rounded-lg flex items-center justify-center p-2 relative group border border-gray-700">
                    {isGenerating && (
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-lg z-20 animate-fade-in">
                            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        </div>
                    )}
                    {imageUrl ? (
                        <>
                            <img src={imageUrl} alt={title} className="max-w-full max-h-full object-contain rounded-md" />
                            <button 
                                onClick={() => handleDownload(imageUrl, downloadFileName)}
                                className="absolute top-2 right-2 p-1.5 bg-gray-900/70 rounded-full text-gray-300 hover:text-white hover:bg-purple-600/80 transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
                                aria-label={`Download ${title}`}
                            >
                                <DownloadIcon className="w-5 h-5" />
                            </button>
                        </>
                    ) : (
                        !isGenerating && (
                            <div className="flex flex-col items-center justify-center text-center text-gray-600 p-2">
                                <PhotoIcon className="w-12 h-12" />
                                <p className="text-xs font-semibold mt-2">No Image Available</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        );
    };


    return (
        <div className="bg-gray-800/50 p-6 rounded-2xl shadow-md border border-gray-700 animate-fade-in">
            <h2 className="text-xl font-semibold text-gray-200 mb-4 flex items-center gap-3">
                <SparklesIcon className="w-6 h-6 text-purple-400" />
                AI-Generated Marketing Kit
            </h2>
             <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                    <CopyableField label="Product Title" value={details.title} />
                    <CopyableField label="Product Description" value={details.description} isTextarea />
                    <CopyableField label="Social Media Caption" value={details.socialMediaCaption} isTextarea />
                    {details.adCopy.map((ad, index) => (
                        <CopyableField key={index} label={`Ad Copy Variation ${index + 1}`} value={ad} isTextarea />
                    ))}
                    <CopyableField label="Hashtags" value={formattedHashtags} />
                </div>

                <div className="border-t border-gray-700 pt-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-200">Marketing Visuals</h3>
                        <button
                            onClick={onGenerate}
                            disabled={isGenerating}
                            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-center text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                           {isGenerating ? (
                             <>
                               <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                               Generating...
                             </>
                           ) : (
                             'Generate Visuals'
                           )}
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {MARKETING_ASSET_TYPES.map(type => (
                            <VisualPlaceholder
                                key={type}
                                title={type}
                                imageUrl={images[type]}
                                isGenerating={isGenerating && !images[type]}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};