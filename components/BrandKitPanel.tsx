import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
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
    setUseBrandKit: (use: boolean) => void;
}

const PREDEFINED_PALETTES = [
    { name: 'Vibrant Sunset', colors: ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF'] },
    { name: 'Oceanic Blues', colors: ['#003B73', '#0074B7', '#BFD7ED', '#E0E0E0'] },
    { name: 'Earthy Tones', colors: ['#A87B3F', '#D4A86A', '#606c38', '#283618', '#fefae0'] },
    { name: 'Pastel Dreams', colors: ['#FAD2E1', '#C5DDF0', '#E1E9B7', '#F3E4C9'] },
    { name: 'Monochrome', colors: ['#1C1C1C', '#4C4C4C', '#999999', '#CCCCCC', '#F2F2F2'] },
    { name: 'Neon Pop', colors: ['#F9F871', '#A3F7B5', '#84D2F6', '#6930C3'] },
];

// --- Color Conversion Utilities ---

function hsvToHex(h: number, s: number, v: number): string {
  s /= 100;
  v /= 100;
  const f = (n: number, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
  const rgbToHex = (r: number, g: number, b: number) => "#" + [r, g, b].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
  return rgbToHex(f(5), f(3), f(1)).toUpperCase();
}

function hexToHsv(hex: string): { h: number, s: number, v: number } | null {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    } else {
        return null;
    }

    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, v = max;

    const d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max !== min) {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: h * 360, s: s * 100, v: v * 100 };
}


export const BrandKitPanel: React.FC<BrandKitPanelProps> = ({ brandKit, onUpdateBrandKit, setUseBrandKit }) => {
    const [logoError, setLogoError] = useState<string | null>(null);
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const [currentColor, setCurrentColor] = useState({ h: 260, s: 80, v: 90 });
    const pickerRef = useRef<HTMLDivElement>(null);
    const currentHex = hsvToHex(currentColor.h, currentColor.s, currentColor.v);

    const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        setLogoError(null);
        const file = e.target.files?.[0];

        if (file) {
            const MAX_SIZE_MB = 2;
            if (file.size > MAX_SIZE_MB * 1024 * 1024) {
                setLogoError(`Logo must be under ${MAX_SIZE_MB}MB.`);
                return;
            }
            try {
                const base64Logo = await fileToBase64(file);
                onUpdateBrandKit({ ...brandKit, logo: base64Logo });
            } catch (error) {
                console.error("Failed to read logo file", error);
                setLogoError("Could not read the logo file.");
            }
        }
    };

    const handleRemoveLogo = () => {
        onUpdateBrandKit({ ...brandKit, logo: null });
    };

    const handleAddColor = () => {
        if (currentHex && !brandKit.colors.includes(currentHex) && brandKit.colors.length < 5) {
            onUpdateBrandKit({ ...brandKit, colors: [...brandKit.colors, currentHex] });
        }
    };
    
    const handleHexInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const hex = e.target.value.toUpperCase();
        if (/^#([0-9A-F]{3}){1,2}$/i.test(hex)) {
            const hsv = hexToHsv(hex);
            if (hsv) {
                setCurrentColor(hsv);
            }
        }
    };

    const handleRemoveColor = (colorToRemove: string) => {
        onUpdateBrandKit({ ...brandKit, colors: brandKit.colors.filter(c => c !== colorToRemove) });
    };
    
    const handleSelectPalette = (colors: string[]) => {
        onUpdateBrandKit({ ...brandKit, colors });
        setUseBrandKit(true);
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setIsPickerVisible(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSVPlaneMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.buttons !== 1) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
        const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

        const s = (x / rect.width) * 100;
        const v = 100 - (y / rect.height) * 100;

        setCurrentColor(prev => ({ ...prev, s, v }));
    };
    
    const canAddColor = brandKit.colors.length < 5 && !brandKit.colors.includes(currentHex);

    return (
        <div className="flex flex-col gap-6">
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
                 {logoError && <p className="text-xs text-red-400 mt-2">{logoError}</p>}
            </div>
            <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">Brand Colors ({brandKit.colors.length}/5)</label>
                <div className="flex items-center gap-2 mb-2">
                    <div className="relative" ref={pickerRef}>
                        <button
                            onClick={() => setIsPickerVisible(!isPickerVisible)}
                            className="w-10 h-10 rounded-md border-2 border-gray-500"
                            style={{ backgroundColor: currentHex }}
                            aria-label="Open color picker"
                        />
                        {isPickerVisible && (
                            <div className="absolute top-full mt-2 z-20 w-64 bg-gray-700 rounded-lg shadow-lg p-4 border border-gray-600">
                                <div
                                    onMouseDown={handleSVPlaneMove}
                                    onMouseMove={handleSVPlaneMove}
                                    className="relative h-40 w-full rounded-md cursor-crosshair"
                                    style={{
                                        backgroundColor: `hsl(${currentColor.h}, 100%, 50%)`,
                                        backgroundImage: 'linear-gradient(to right, white, transparent), linear-gradient(to top, black, transparent)'
                                    }}
                                >
                                    <div
                                        className="absolute w-3 h-3 rounded-full border-2 border-white shadow-md pointer-events-none"
                                        style={{
                                            left: `${currentColor.s}%`,
                                            top: `${100 - currentColor.v}%`,
                                            transform: 'translate(-50%, -50%)',
                                        }}
                                    />
                                </div>
                                <div className="mt-4">
                                    <input
                                        type="range"
                                        min="0"
                                        max="360"
                                        value={currentColor.h}
                                        onChange={(e) => setCurrentColor(prev => ({ ...prev, h: Number(e.target.value) }))}
                                        className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer hue-slider"
                                        style={{ background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)' }}
                                    />
                                </div>
                                <div className="mt-4 flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-md" style={{ backgroundColor: currentHex }}></div>
                                    <input
                                        type="text"
                                        value={currentHex}
                                        onChange={handleHexInputChange}
                                        className="flex-grow p-2 text-sm text-center bg-gray-800 border border-gray-600 rounded-md uppercase"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={handleAddColor} 
                        disabled={!canAddColor}
                        className="px-4 py-2 text-sm font-semibold bg-purple-600 rounded-md hover:bg-purple-700 transition-colors h-10 disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        Add
                    </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                    {brandKit.colors.map(color => (
                        <div key={color} className="relative group flex items-center gap-2 p-1 pr-2 bg-gray-700 border border-gray-600 rounded-full">
                            <div className="w-5 h-5 rounded-full border border-black/20" style={{ backgroundColor: color }}></div>
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
            <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">Or, select a palette</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PREDEFINED_PALETTES.map(palette => (
                        <button
                            key={palette.name}
                            onClick={() => handleSelectPalette(palette.colors)}
                            className="w-full text-left p-2 bg-gray-900/50 hover:bg-gray-700/50 rounded-lg border border-gray-700 hover:border-purple-500 transition-all duration-200 group"
                        >
                            <p className="text-xs font-semibold text-gray-200 mb-2 group-hover:text-purple-300 transition-colors">{palette.name}</p>
                            <div className="flex items-center gap-1.5">
                                {palette.colors.map(color => (
                                    <div
                                        key={color}
                                        className="w-5 h-5 rounded-full border-2 border-black/20"
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
