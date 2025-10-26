import React, { useState, useEffect, useCallback } from 'react';
import { XCircleIcon } from './icons/XCircleIcon';
import { ShopifyProductDetails } from '../App';
import { ClipboardIcon } from './icons/ClipboardIcon';

interface ShopifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  productName: string;
  onGetProductDetails: (productName: string) => Promise<ShopifyProductDetails | null>;
}

const PUSH_MESSAGES = [
    'Send to Production',
    'Step 1/3: Validating assets...',
    'Step 2/3: Connecting to POD service...',
    'Step 3/3: Creating product draft...',
    'Success! Product draft created.'
];

const MarketingCopyDisplay: React.FC<{title: string; content: string; onCopy: () => void;}> = ({ title, content, onCopy }) => (
    <div className="relative">
        <label className="block mb-1 text-xs font-medium text-gray-400">{title}</label>
        <div className="relative">
            <textarea
                readOnly
                value={content}
                rows={3}
                className="block p-2.5 w-full text-sm text-gray-200 bg-gray-900/70 rounded-lg border border-gray-600 resize-none"
            />
            <button onClick={onCopy} className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-white bg-gray-700 rounded-md transition">
                <ClipboardIcon className="w-4 h-4" />
            </button>
        </div>
    </div>
);


export const ShopifyModal: React.FC<ShopifyModalProps> = ({ isOpen, onClose, imageUrl, productName, onGetProductDetails }) => {
  const [details, setDetails] = useState<ShopifyProductDetails>({ title: '', description: '', socialMediaCaption: '', adCopy: [], hashtags: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [pushStep, setPushStep] = useState(0);
  const [complianceChecked, setComplianceChecked] = useState(false);
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  const fetchDetails = useCallback(async () => {
    setIsLoading(true);
    setDetails({ title: '', description: '', socialMediaCaption: '', adCopy: [], hashtags: [] });
    const fetchedDetails = await onGetProductDetails(productName);
    if (fetchedDetails) {
      setDetails(fetchedDetails);
    }
    setIsLoading(false);
  }, [onGetProductDetails, productName]);

  useEffect(() => {
    if (isOpen) {
      setPushStep(0);
      setComplianceChecked(false);
      setCopiedStates({});
      fetchDetails();
    }
  }, [isOpen, fetchDetails]);

  const handlePush = () => {
    if (pushStep > 0) return;
    setPushStep(1);
    setTimeout(() => setPushStep(2), 1200);
    setTimeout(() => setPushStep(3), 2400);
    setTimeout(() => setPushStep(4), 3600);
    setTimeout(() => {
      onClose();
    }, 5000);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] grid grid-cols-1 md:grid-cols-2 gap-8 p-8 overflow-y-auto"
        onClick={e => e.stopPropagation()}
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#4f46e5 #1f2937' }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
            <XCircleIcon className="w-8 h-8" />
        </button>

        {/* Image Column */}
        <div className="flex flex-col gap-4 items-center">
            <h2 className="text-2xl font-bold text-white text-center">Product Mockup</h2>
            <div className="w-full aspect-square bg-gray-700/50 rounded-lg flex items-center justify-center p-4">
                <img src={imageUrl} alt="Product Mockup" className="max-w-full max-h-full object-contain rounded-md" />
            </div>
        </div>

        {/* Details Column */}
        <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-white">Create Product Listing</h2>
            
            <div className="relative">
                <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-300">Product Title</label>
                {isLoading && !details.title && <div className="absolute inset-0 bg-gray-700/50 rounded-lg animate-pulse"></div>}
                <input
                    type="text"
                    id="title"
                    value={details.title}
                    onChange={(e) => setDetails({...details, title: e.target.value})}
                    className="block w-full p-2.5 text-sm text-gray-100 bg-gray-700 rounded-lg border border-gray-600 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="e.g., Cool Astronaut T-Shirt"
                />
            </div>
            
             <div className="relative">
                <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-300">Product Description</label>
                 {isLoading && !details.description && <div className="absolute inset-0 bg-gray-700/50 rounded-lg animate-pulse h-28"></div>}
                <textarea
                    id="description"
                    rows={4}
                    value={details.description}
                    onChange={(e) => setDetails({...details, description: e.target.value})}
                    className="block p-2.5 w-full text-sm text-gray-100 bg-gray-700 rounded-lg border border-gray-600 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Describe your amazing product..."
                />
            </div>

            <div className="border-t border-gray-700 pt-4 space-y-3">
                 <h3 className="text-md font-semibold text-gray-200">AI-Generated Marketing Kit</h3>
                 {isLoading && !details.socialMediaCaption && <div className="w-full h-20 bg-gray-700/50 rounded-lg animate-pulse"></div>}
                 {details.socialMediaCaption && <MarketingCopyDisplay title="Social Media Post" content={details.socialMediaCaption} onCopy={() => handleCopy(details.socialMediaCaption, 'social')} />}

                 {isLoading && details.adCopy.length === 0 && <div className="w-full h-20 bg-gray-700/50 rounded-lg animate-pulse"></div>}
                 {details.adCopy.map((ad, index) => (
                    <MarketingCopyDisplay key={index} title={`Ad Copy Variation ${index + 1}`} content={ad} onCopy={() => handleCopy(ad, `ad${index}`)} />
                 ))}
                
                {isLoading && details.hashtags.length === 0 && <div className="w-full h-12 bg-gray-700/50 rounded-lg animate-pulse"></div>}
                {details.hashtags.length > 0 && (
                    <div className="relative">
                        <label className="block mb-1 text-xs font-medium text-gray-400">Hashtags</label>
                        <div className="relative">
                            <div className="p-2.5 w-full text-sm text-gray-200 bg-gray-900/70 rounded-lg border border-gray-600">
                                {details.hashtags.join(' ')}
                            </div>
                             <button onClick={() => handleCopy(details.hashtags.join(' '), 'tags')} className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-white bg-gray-700 rounded-md transition">
                                <ClipboardIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="border-t border-gray-700 pt-4 mt-auto">
                <label className="flex items-center gap-3 text-sm text-gray-300 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={complianceChecked}
                        onChange={(e) => setComplianceChecked(e.target.checked)}
                        className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-600 focus:ring-2"
                    />
                    I have the rights to use this design and it follows platform policies.
                </label>
            </div>
            
            <button
                onClick={handlePush}
                disabled={!complianceChecked || pushStep > 0 || isLoading}
                className={`w-full inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-white rounded-lg transition-colors duration-200
                ${pushStep === 4 ? 'bg-green-700' : 'bg-purple-600 hover:bg-purple-700'}
                focus:ring-4 focus:ring-purple-400 disabled:bg-gray-600 disabled:cursor-not-allowed`}
            >
                {isLoading ? 'Generating Details...' : PUSH_MESSAGES[pushStep]}
            </button>
        </div>
      </div>
    </div>
  );
};