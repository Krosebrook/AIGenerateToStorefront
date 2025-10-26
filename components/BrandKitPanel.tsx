import React, { useState, useRef, ChangeEvent } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { fileToBase64 } from '../utils/fileUtils';

export interface BrandKit {
    logo: string | null;
    colors: string[];
}

interface BrandKitPanelProps {
    brandKit: BrandKit;
    onUpdateBrandKit: (newKit: BrandKit) => void;
}

export const BrandKitPanel: React.FC<BrandKitPanelProps> = ({ brandKit, onUpdateBrandKit }) => {
    const [newColor, setNewColor] = useState('#FFFFFF');
    const colorInputRef = useRef<HTMLInputElement>(null);

    const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const base64Logo = await fileToBase64(e.target.files[0]);
                onUpdateBrandKit({ ...brandKit, logo: base64Logo });
            } catch (error) {
                console.error("Failed to read logo file", error);
            }
        }
    };

    const handleRemoveLogo = () => {
        onUpdateBrandKit({ ...brandKit, logo: null });
    };

    const handleAddColor = () => {
        const colorToAdd = newColor.toUpperCase();
        if (colorToAdd && !brandKit.colors.includes(colorToAdd) && brandKit.colors.length < 8) {
            onUpdateBrandKit({ ...brandKit, colors: [...brandKit.colors, colorToAdd] });
        }
    };
    
    const handleColorInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setNewColor(e.target.value);
    };

    const handleRemoveColor = (colorToRemove: string) => {
        onUpdateBrandKit({ ...brandKit, colors: brandKit.colors.filter(c => c !== colorToRemove) });
    };

    return (
        <div className="flex flex-col gap-4">
            <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">Brand Logo</label>
                {brandKit.logo ? (
                    <div className="relative group w-32 h-32 p-2 bg-gray-700 rounded-lg flex items-center justify-center">
                        <img src={brandKit.logo} alt="Brand Logo" className="max-w-full max-h-full object-contain" />
                        <button
                            onClick={handleRemoveLogo}
                            className="absolute top-1 right-1 p-1 bg-gray-900/70 rounded-full text-gray-300 hover:text-white hover:bg-red-600/80 transition-all opacity-0 group-hover:opacity-100"
                            aria-label="Remove logo"
                        >
                            <XCircleIcon className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors border-gray-600 bg-gray-800 hover:bg-gray-700/50">
                        <UploadIcon className="w-8 h-8 text-gray-400" />
                        <span className="text-xs text-gray-400 mt-1">Upload</span>
                        <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleLogoUpload} />
                    </label>
                )}
            </div>
            <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">Brand Colors</label>
                <div className="flex items-center gap-2 mb-2">
                    <div className="relative w-10 h-10 rounded-md overflow-hidden border-2 border-gray-500">
                        <input
                            ref={colorInputRef}
                            type="color"
                            value={newColor}
                            onChange={handleColorInputChange}
                            className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                        />
                    </div>
                    <input 
                        type="text"
                        value={newColor}
                        onChange={handleColorInputChange}
                        className="w-24 p-2 text-sm text-center bg-gray-700 border border-gray-600 rounded-md"
                    />
                    <button onClick={handleAddColor} className="px-3 py-2 text-sm font-semibold bg-purple-600 rounded-md hover:bg-purple-700 transition-colors">Add</button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                    {brandKit.colors.map(color => (
                        <div key={color} className="relative group flex items-center gap-2 p-1 pr-2 bg-gray-700 border border-gray-600 rounded-full">
                            <div className="w-5 h-5 rounded-full" style={{ backgroundColor: color }}></div>
                            <span className="text-xs font-mono">{color}</span>
                             <button
                                onClick={() => handleRemoveColor(color)}
                                className="absolute -top-1 -right-1 p-0.5 bg-red-600 rounded-full text-white transition-opacity opacity-0 group-hover:opacity-100"
                                aria-label={`Remove ${color}`}
                            >
                                <XCircleIcon className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
