import React, { useState, useEffect, useCallback } from 'react';
import { XCircleIcon } from './icons/XCircleIcon';
import { ShopifyProductDetails } from '../App';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { 
  createShopifyProduct, 
  getShopifyConfigStatus, 
  getShopifyProductAdminUrl,
  isShopifyConfigured 
} from '../services/shopifyService';
import {
  createAndPublishProduct as createPrintifyProduct,
  getPrintifyConfigStatus,
  isPrintifyConfigured,
  PRINTIFY_BLUEPRINTS
} from '../services/printifyService';
import {
  createEtsyProductWithImage,
  getEtsyConfigStatus,
  isEtsyConfigured,
  ETSY_TAXONOMIES
} from '../services/etsyService';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  productName: string;
  onGetProductDetails: (productName: string) => Promise<ShopifyProductDetails | null>;
  initialDetails: ShopifyProductDetails | null;
}

type Platform = 'shopify' | 'printify' | 'etsy';

interface PlatformStatus {
  configured: boolean;
  message: string;
}

export const PublishModal: React.FC<PublishModalProps> = ({ 
  isOpen, 
  onClose, 
  imageUrl, 
  productName, 
  onGetProductDetails, 
  initialDetails 
}) => {
  const [details, setDetails] = useState<ShopifyProductDetails>({ 
    title: '', 
    description: '', 
    socialMediaCaption: '', 
    adCopy: [], 
    hashtags: [] 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<Platform>>(new Set(['shopify']));
  const [publishingStatus, setPublishingStatus] = useState<Record<Platform, string>>({
    shopify: '',
    printify: '',
    etsy: ''
  });
  const [publishErrors, setPublishErrors] = useState<Record<Platform, string | null>>({
    shopify: null,
    printify: null,
    etsy: null
  });
  const [publishSuccessUrls, setPublishSuccessUrls] = useState<Record<Platform, string | null>>({
    shopify: null,
    printify: null,
    etsy: null
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const [complianceChecked, setComplianceChecked] = useState(false);
  const [price, setPrice] = useState<number>(25.00);
  
  const [platformStatuses, setPlatformStatuses] = useState<Record<Platform, PlatformStatus>>({
    shopify: { configured: false, message: '' },
    printify: { configured: false, message: '' },
    etsy: { configured: false, message: '' }
  });

  const fetchDetails = useCallback(async () => {
    setIsLoading(true);
    const emptyDetails = { title: '', description: '', socialMediaCaption: '', adCopy: [], hashtags: [] };
    
    if (initialDetails) {
      setDetails(initialDetails);
    } else {
      setDetails(emptyDetails);
      const fetchedDetails = await onGetProductDetails(productName);
      setDetails(fetchedDetails || emptyDetails);
    }
    setIsLoading(false);
  }, [onGetProductDetails, productName, initialDetails]);

  useEffect(() => {
    if (isOpen) {
      setPublishingStatus({ shopify: '', printify: '', etsy: '' });
      setPublishErrors({ shopify: null, printify: null, etsy: null });
      setPublishSuccessUrls({ shopify: null, printify: null, etsy: null });
      setComplianceChecked(false);
      setIsPublishing(false);
      
      setPlatformStatuses({
        shopify: getShopifyConfigStatus(),
        printify: getPrintifyConfigStatus(),
        etsy: getEtsyConfigStatus()
      });
      
      fetchDetails();
    }
  }, [isOpen, fetchDetails]);

  const togglePlatform = (platform: Platform) => {
    const newPlatforms = new Set(selectedPlatforms);
    if (newPlatforms.has(platform)) {
      newPlatforms.delete(platform);
    } else {
      newPlatforms.add(platform);
    }
    setSelectedPlatforms(newPlatforms);
  };

  const publishToShopify = async (): Promise<void> => {
    if (!isShopifyConfigured()) {
      throw new Error('Shopify is not configured');
    }

    setPublishingStatus(prev => ({ ...prev, shopify: 'Creating product in Shopify...' }));
    
    const shopifyProduct = await createShopifyProduct({
      title: details.title,
      description: details.description,
      imageDataURL: imageUrl,
      productType: productName,
    });
    
    const adminUrl = getShopifyProductAdminUrl(shopifyProduct.id);
    setPublishSuccessUrls(prev => ({ ...prev, shopify: adminUrl }));
    setPublishingStatus(prev => ({ ...prev, shopify: '✓ Published to Shopify' }));
  };

  const publishToPrintify = async (): Promise<void> => {
    if (!isPrintifyConfigured()) {
      throw new Error('Printify is not configured');
    }

    setPublishingStatus(prev => ({ ...prev, printify: 'Uploading design to Printify...' }));
    
    const result = await createPrintifyProduct(
      details.title,
      details.description,
      imageUrl,
      PRINTIFY_BLUEPRINTS.UNISEX_TSHIRT,
      1, // Default provider
      price
    );
    
    setPublishSuccessUrls(prev => ({ 
      ...prev, 
      printify: `https://printify.com/app/products/${result.product.id}` 
    }));
    setPublishingStatus(prev => ({ ...prev, printify: '✓ Published to Printify' }));
  };

  const publishToEtsy = async (): Promise<void> => {
    if (!isEtsyConfigured()) {
      throw new Error('Etsy is not configured');
    }

    setPublishingStatus(prev => ({ ...prev, etsy: 'Creating listing on Etsy...' }));
    
    const result = await createEtsyProductWithImage(
      details.title,
      details.description,
      price,
      imageUrl,
      ETSY_TAXONOMIES.CLOTHING_TSHIRT,
      details.hashtags
    );
    
    setPublishSuccessUrls(prev => ({ ...prev, etsy: result.listing.url }));
    setPublishingStatus(prev => ({ ...prev, etsy: '✓ Published to Etsy' }));
  };

  const handlePublish = async () => {
    if (isPublishing) return;
    
    setIsPublishing(true);
    setPublishErrors({ shopify: null, printify: null, etsy: null });
    setPublishSuccessUrls({ shopify: null, printify: null, etsy: null });
    
    const platformsToPublish = Array.from(selectedPlatforms);
    
    for (const platform of platformsToPublish) {
      try {
        if (platform === 'shopify') {
          await publishToShopify();
        } else if (platform === 'printify') {
          await publishToPrintify();
        } else if (platform === 'etsy') {
          await publishToEtsy();
        }
      } catch (error: unknown) {
        console.error(`Error publishing to ${platform}:`, error);
        const errorMessage = error instanceof Error 
          ? error.message 
          : `Failed to publish to ${platform}. Please try again.`;
        setPublishErrors(prev => ({ ...prev, [platform]: errorMessage }));
        setPublishingStatus(prev => ({ ...prev, [platform]: '✗ Failed' }));
      }
    }
    
    setIsPublishing(false);
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
  const canPublish = complianceChecked && 
    selectedPlatforms.size > 0 && 
    !isPublishing && 
    !isLoading &&
    Array.from(selectedPlatforms).every(p => platformStatuses[p].configured);

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
            <h2 className="text-2xl font-bold text-white">Publish Product</h2>
            
            {/* Platform Selection */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Select Platforms</label>
                <div className="flex flex-wrap gap-2">
                  {(['shopify', 'printify', 'etsy'] as Platform[]).map(platform => {
                    const isConfigured = platformStatuses[platform].configured;
                    const isSelected = selectedPlatforms.has(platform);
                    
                    return (
                      <button
                        key={platform}
                        onClick={() => togglePlatform(platform)}
                        disabled={!isConfigured}
                        className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 capitalize
                          ${isSelected && isConfigured
                            ? 'bg-purple-600 border-purple-500 text-white'
                            : isConfigured
                            ? 'bg-gray-700 border-gray-600 text-gray-300 hover:border-purple-500'
                            : 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed'
                          }`}
                      >
                        {isConfigured ? '✓' : '⚠'} {platform}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-400">
                  Configure platforms in your .env.local file to enable publishing
                </p>
            </div>

            {/* Platform Status Indicators */}
            <div className="space-y-2">
              {Array.from(selectedPlatforms).map(platform => {
                const status = platformStatuses[platform];
                const publishStatus = publishingStatus[platform];
                const error = publishErrors[platform];
                const successUrl = publishSuccessUrls[platform];
                
                return (
                  <div key={platform} className={`rounded-lg p-3 text-sm border
                    ${status.configured
                      ? 'bg-green-900/30 border-green-700 text-green-200'
                      : 'bg-yellow-900/30 border-yellow-700 text-yellow-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <strong className="capitalize">{platform}</strong>
                      {publishStatus && (
                        <span className="text-xs">{publishStatus}</span>
                      )}
                    </div>
                    {!status.configured && (
                      <p className="mt-1 text-xs">{status.message}</p>
                    )}
                    {error && (
                      <p className="mt-1 text-xs text-red-300">Error: {error}</p>
                    )}
                    {successUrl && (
                      <a 
                        href={successUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-xs underline hover:text-green-100"
                      >
                        View in {platform} →
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div>
                <label htmlFor="price" className="block mb-2 text-sm font-medium text-gray-300">Price (USD)</label>
                <input
                    type="number"
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    step="0.01"
                    min="0"
                    className="block w-full p-2.5 text-sm text-gray-100 bg-gray-700 rounded-lg border border-gray-600 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="25.00"
                />
            </div>
            
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
                onClick={handlePublish}
                disabled={!canPublish}
                className={`w-full inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-white rounded-lg transition-colors duration-200
                ${isPublishing ? 'bg-blue-600' : 'bg-purple-600 hover:bg-purple-700'}
                focus:ring-4 focus:ring-purple-400 disabled:bg-gray-600 disabled:cursor-not-allowed`}
            >
                {isLoading 
                  ? 'Generating Details...' 
                  : isPublishing 
                  ? 'Publishing...' 
                  : `Publish to ${selectedPlatforms.size} Platform${selectedPlatforms.size !== 1 ? 's' : ''}`
                }
            </button>
        </div>
      </div>
    </div>
  );
};

// Keep ShopifyModal as an alias for backward compatibility
export const ShopifyModal = PublishModal;
