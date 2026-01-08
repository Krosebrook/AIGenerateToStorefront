import React, { useState, useEffect, useCallback } from 'react';
import { XCircleIcon } from './icons/XCircleIcon';
import { ShopifyProductDetails } from '../App';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { 
  createShopifyProduct, 
  getShopifyConfigStatus, 
  getShopifyProductAdminUrl,
  isShopifyConfigured 
} from '../services/shopifyService';

interface ShopifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  productName: string;
  onGetProductDetails: (productName: string) => Promise<ShopifyProductDetails | null>;
  initialDetails: ShopifyProductDetails | null;
}

const PUSH_MESSAGES = [
    'Create Shopify Draft',
    'Validating product data...',
    'Uploading image to Shopify...',
    'Creating product draft...',
    'Success! Product draft created.'
];


export const ShopifyModal: React.FC<ShopifyModalProps> = ({ isOpen, onClose, imageUrl, productName, onGetProductDetails, initialDetails }) => {
  const [details, setDetails] = useState<ShopifyProductDetails>({ title: '', description: '', socialMediaCaption: '', adCopy: [], hashtags: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [pushStep, setPushStep] = useState(0);
  const [complianceChecked, setComplianceChecked] = useState(false);
  const [pushError, setPushError] = useState<string | null>(null);
  const [shopifyProductUrl, setShopifyProductUrl] = useState<string | null>(null);
  const [shopifyConfigStatus, setShopifyConfigStatus] = useState<{ configured: boolean; message: string }>({ configured: false, message: '' });

  const fetchDetails = useCallback(async () => {
    setIsLoading(true);
    const emptyDetails = { title: '', description: '', socialMediaCaption: '', adCopy: [], hashtags: [] };
    
    // If we already have initial details (from orchestrator), use them.
    if (initialDetails) {
      setDetails(initialDetails);
    } else {
      // Otherwise, fetch them (for non-orchestrated flows like batch presets).
      setDetails(emptyDetails);
      const fetchedDetails = await onGetProductDetails(productName);
      setDetails(fetchedDetails || emptyDetails);
    }
    setIsLoading(false);
  }, [onGetProductDetails, productName, initialDetails]);

  useEffect(() => {
    if (isOpen) {
      setPushStep(0);
      setComplianceChecked(false);
      setPushError(null);
      setShopifyProductUrl(null);
      setShopifyConfigStatus(getShopifyConfigStatus());
      fetchDetails();
    }
  }, [isOpen, fetchDetails]);

  const handlePush = async () => {
    if (pushStep > 0) return;
    
    setPushError(null);
    setShopifyProductUrl(null);
    
    // Check if Shopify is configured
    if (!isShopifyConfigured()) {
      setPushError('Shopify is not configured. Please add your credentials to .env.local');
      return;
    }

    try {
      setPushStep(1); // Validating
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setPushStep(2); // Uploading image
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setPushStep(3); // Creating product
      
      // Create the product in Shopify
      const shopifyProduct = await createShopifyProduct({
        title: details.title,
        description: details.description,
        imageDataURL: imageUrl,
        productType: productName,
      });
      
      setPushStep(4); // Success
      
      const adminUrl = getShopifyProductAdminUrl(shopifyProduct.id);
      setShopifyProductUrl(adminUrl);
      
      // Auto-close after showing success (or let user close manually to see the URL)
      setTimeout(() => {
        if (pushStep === 4) {
          // User can close manually to copy URL
        }
      }, 3000);
      
    } catch (error: unknown) {
      console.error('Error pushing to Shopify:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to create product in Shopify. Please try again.';
      setPushError(errorMessage);
      setPushStep(0); // Reset to allow retry
    }
  };
  
  const handleAdCopyChange = (index: number, value: string) => {
    const newAdCopy = [...details.adCopy];
    newAdCopy[index] = value;
    setDetails({ ...details, adCopy: newAdCopy });
  };

  const handleAddAdCopy = () => {
    setDetails({ ...details, adCopy: [...details.adCopy, ''] });
  };
  
  const handleRemoveAdCopy = (index: number) => {
    const newAdCopy = details.adCopy.filter((_, i) => i !== index);
    setDetails({ ...details, adCopy: newAdCopy });
  };

  const handleHashtagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(' ').map(tag => tag.replace(/#/g, ''));
    setDetails({ ...details, hashtags: tags });
  };


  if (!isOpen) return null;
  
  const formattedHashtags = details.hashtags.filter(t => t).map(tag => `#${tag}`).join(' ');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] grid grid-cols-1 md:grid-cols-2 gap-8 p-8 overflow-y-auto"
        onClick={e => e.stopPropagation()}
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#4f46e5 #1f2937' }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10">
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
            
            <div>
                <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-300">Product Title</label>
                <div className="relative">
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
            </div>
            
            <div>
                <div className="flex justify-between items-baseline mb-2">
                  <label htmlFor="description" className="text-sm font-medium text-gray-300">Product Description</label>
                  <span className="text-xs text-gray-400">{details.description.length} / 5000</span>
                </div>
                <div className="relative">
                   {isLoading && !details.description && <div className="absolute inset-0 bg-gray-700/50 rounded-lg animate-pulse h-28"></div>}
                  <textarea
                      id="description"
                      rows={4}
                      value={details.description}
                      onChange={(e) => setDetails({...details, description: e.target.value})}
                      className="block p-2.5 w-full text-sm text-gray-100 bg-gray-700 rounded-lg border border-gray-600 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 resize-y"
                      placeholder="Describe your amazing product..."
                      maxLength={5000}
                  />
                </div>
            </div>
            
            <div>
                <div className="flex justify-between items-baseline mb-2">
                  <label htmlFor="social-caption" className="text-sm font-medium text-gray-300">Social Media Caption</label>
                  <span className="text-xs text-gray-400">{details.socialMediaCaption.length} / 1000</span>
                </div>
                <div className="relative">
                   {isLoading && !details.socialMediaCaption && <div className="absolute inset-0 bg-gray-700/50 rounded-lg animate-pulse h-24"></div>}
                  <textarea
                      id="social-caption"
                      rows={3}
                      value={details.socialMediaCaption}
                      onChange={(e) => setDetails({...details, socialMediaCaption: e.target.value})}
                      className="block p-2.5 w-full text-sm text-gray-100 bg-gray-700 rounded-lg border border-gray-600 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 resize-y"
                      placeholder="Write a catchy caption for social media..."
                      maxLength={1000}
                  />
                </div>
            </div>
            
            <div className="space-y-3">
                <h3 className="text-md font-semibold text-gray-200">Ad Copy Variations</h3>
                 {isLoading && details.adCopy.length === 0 && <div className="w-full h-20 bg-gray-700/50 rounded-lg animate-pulse"></div>}
                 {details.adCopy.map((ad, index) => (
                    <div key={index} className="relative">
                       <textarea
                            rows={2}
                            value={ad}
                            onChange={(e) => handleAdCopyChange(index, e.target.value)}
                            className="block p-2.5 w-full text-sm text-gray-100 bg-gray-700 rounded-lg border border-gray-600 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 pr-8 resize-y"
                            placeholder={`Ad copy variation #${index + 1}`}
                        />
                         <button
                            onClick={() => handleRemoveAdCopy(index)}
                            className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-400 rounded-md transition"
                            aria-label={`Remove ad copy ${index + 1}`}
                         >
                            <XCircleIcon className="w-5 h-5" />
                        </button>
                    </div>
                 ))}
                 <button onClick={handleAddAdCopy} className="flex items-center gap-2 text-sm font-semibold text-purple-300 hover:text-purple-200 transition">
                     <PlusCircleIcon className="w-5 h-5" />
                     Add Ad Copy
                 </button>
            </div>

            <div>
                <label htmlFor="hashtags" className="block mb-2 text-sm font-medium text-gray-300">Hashtags</label>
                <div className="relative">
                  {isLoading && details.hashtags.length === 0 && <div className="absolute inset-0 bg-gray-700/50 rounded-lg animate-pulse"></div>}
                  <input
                      type="text"
                      id="hashtags"
                      value={formattedHashtags}
                      onChange={handleHashtagsChange}
                      className="block w-full p-2.5 text-sm text-gray-100 bg-gray-700 rounded-lg border border-gray-600 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="#space #art #design"
                  />
                </div>
            </div>


            {!shopifyConfigStatus.configured && (
                <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-3 text-sm text-yellow-200">
                    <strong>⚠️ Shopify Not Configured</strong>
                    <p className="mt-1">{shopifyConfigStatus.message}</p>
                </div>
            )}
            
            {shopifyConfigStatus.configured && (
                <div className="bg-green-900/30 border border-green-700 rounded-lg p-3 text-sm text-green-200">
                    <strong>✓ Shopify Connected</strong>
                    <p className="mt-1">{shopifyConfigStatus.message}</p>
                </div>
            )}

            {pushError && (
                <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 text-sm text-red-200">
                    <strong>Error:</strong> {pushError}
                </div>
            )}
            
            {shopifyProductUrl && pushStep === 4 && (
                <div className="bg-green-900/30 border border-green-700 rounded-lg p-3 text-sm text-green-200">
                    <strong>✓ Success!</strong>
                    <p className="mt-1">Product draft created in Shopify.</p>
                    <a 
                        href={shopifyProductUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-green-300 hover:text-green-100 underline font-medium"
                    >
                        View in Shopify Admin →
                    </a>
                </div>
            )}

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
                disabled={!complianceChecked || pushStep > 0 || isLoading || !shopifyConfigStatus.configured}
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