
import React, { useState, useEffect, useCallback } from 'react';
import { XCircleIcon } from './icons/XCircleIcon';
import { ShopifyProductDetails } from '../App';

interface ShopifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  productName: string;
  onGetProductDetails: (productName: string) => Promise<ShopifyProductDetails | null>;
}

export const ShopifyModal: React.FC<ShopifyModalProps> = ({ isOpen, onClose, imageUrl, productName, onGetProductDetails }) => {
  const [details, setDetails] = useState<ShopifyProductDetails>({ title: '', description: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isPushed, setIsPushed] = useState(false);
  const [complianceChecked, setComplianceChecked] = useState(false);

  const fetchDetails = useCallback(async () => {
    setIsLoading(true);
    const fetchedDetails = await onGetProductDetails(productName);
    if (fetchedDetails) {
      setDetails(fetchedDetails);
    }
    setIsLoading(false);
  }, [onGetProductDetails, productName]);

  useEffect(() => {
    if (isOpen) {
      setIsPushed(false);
      setComplianceChecked(false);
      fetchDetails();
    }
  }, [isOpen, fetchDetails]);

  const handlePush = () => {
    // This is a simulation
    setIsPushed(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] grid grid-cols-1 md:grid-cols-2 gap-8 p-8 overflow-y-auto"
        onClick={e => e.stopPropagation()}
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
            <h2 className="text-2xl font-bold text-white">Push to Shopify</h2>
            
            <div className="relative">
                <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-300">Product Title</label>
                {isLoading && <div className="absolute inset-0 bg-gray-700/50 rounded-lg animate-pulse"></div>}
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
                 {isLoading && <div className="absolute inset-0 bg-gray-700/50 rounded-lg animate-pulse"></div>}
                <textarea
                    id="description"
                    rows={4}
                    value={details.description}
                    onChange={(e) => setDetails({...details, description: e.target.value})}
                    className="block p-2.5 w-full text-sm text-gray-100 bg-gray-700 rounded-lg border border-gray-600 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Describe your amazing product..."
                />
            </div>

            <div className="border-t border-gray-700 pt-4">
                <h3 className="text-md font-semibold text-gray-200 mb-2">Compliance Checklist</h3>
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
                disabled={!complianceChecked || isPushed || isLoading}
                className={`w-full inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-white rounded-lg transition-colors duration-200
                ${isPushed ? 'bg-green-700' : 'bg-green-600 hover:bg-green-500'}
                focus:ring-4 focus:ring-green-400 disabled:bg-gray-600 disabled:cursor-not-allowed`}
            >
                {isPushed ? 'Successfully Pushed!' : 'Push Product to Store'}
            </button>
        </div>
      </div>
    </div>
  );
};
