import React, { useState } from 'react';
import { ShopifyProductDetails } from '../App';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface MarketingDisplayPanelProps {
    details: ShopifyProductDetails;
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

export const MarketingDisplayPanel: React.FC<MarketingDisplayPanelProps> = ({ details }) => {
    const formattedHashtags = details.hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ');

    return (
        <div className="bg-gray-800/50 p-6 rounded-2xl shadow-md border border-gray-700 animate-fade-in">
            <h2 className="text-xl font-semibold text-gray-200 mb-4 flex items-center gap-3">
                <SparklesIcon className="w-6 h-6 text-purple-400" />
                AI-Generated Marketing Kit
            </h2>
            <div className="flex flex-col gap-4">
                <CopyableField label="Product Title" value={details.title} />
                <CopyableField label="Product Description" value={details.description} isTextarea />
                <CopyableField label="Social Media Caption" value={details.socialMediaCaption} isTextarea />
                {details.adCopy.map((ad, index) => (
                    <CopyableField key={index} label={`Ad Copy Variation ${index + 1}`} value={ad} isTextarea />
                ))}
                <CopyableField label="Hashtags" value={formattedHashtags} />
            </div>
        </div>
    );
};
