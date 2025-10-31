import React, { useEffect, useState } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { ArrowPathIcon } from './icons/ArrowPathIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { PackageIcon } from './icons/PackageIcon';
import { AppMode } from './ModeSelector';
import { BrandKit, BrandKitPanel } from './BrandKitPanel';
import { PaintBrushIcon } from './icons/PaintBrushIcon';
import { CustomTemplateModal } from './CustomTemplateModal';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { NewspaperIcon } from './icons/NewspaperIcon';

export interface MerchPreset {
    id: string;
    name: string;
    template: string;
    isCustom?: boolean;
}

interface ControlPanelProps {
  mode: AppMode;
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerateEdit: () => void;
  onGenerateNew: () => void;
  onGenerateBatch: (presets: MerchPreset[]) => void;
  onReset: () => void;
  isLoading: boolean;
  isImageUploaded: boolean;
  onSuggest: () => void;
  isSuggesting: boolean;
  suggestions: string[];
  selectedPresets: MerchPreset[];
  onSelectedPresetsChange: (presets: MerchPreset[]) => void;
  negativePrompt: string;
  setNegativePrompt: (p: string) => void;
  variations: number;
  setVariations: (v: number) => void;
  aspectRatio: string;
  setAspectRatio: (ar: string) => void;
  brandKit: BrandKit;
  onUpdateBrandKit: (kit: BrandKit) => void;
  useBrandKit: boolean;
  setUseBrandKit: (use: boolean) => void;
  customPresets: MerchPreset[];
  onUpdateCustomPresets: (presets: MerchPreset[]) => void;
  onFetchNews: () => void;
  isFetchingNews: boolean;
}

const MERCH_PRESETS: MerchPreset[] = [
    { id: 't-shirt', name: 'T-Shirt', template: 'Create a photorealistic mockup of this design on the chest of a premium, soft cotton white t-shirt. The t-shirt should be laid flat on a clean, light gray surface with subtle, natural shadows.' },
    { id: 'mug', name: 'Mug', template: 'Render this design on a glossy white ceramic coffee mug. The mockup should be photorealistic, placed on a dark wooden coffee shop table next to a window with soft, morning light creating gentle reflections.' },
    { id: 'poster', name: 'Poster', template: 'Generate a photorealistic mockup of this design as a high-resolution poster inside a thin, matte black frame. The poster should be hanging on a lightly textured, off-white wall in a modern, minimalist apartment setting. The lighting should be soft and indirect, coming from a large window just out of frame. Include a softly blurred background with a hint of a vibrant green potted plant on a wooden floor, adding a touch of life to the scene.' },
    { id: 'hoodie', name: 'Hoodie', template: 'Display this design on the front of a comfortable, slightly wrinkled black pullover hoodie. The mockup should show realistic fabric texture and be laid flat on a neutral, concrete-textured background.'},
    { id: 'stickers', name: 'Stickers', template: 'Create a mockup of multiple die-cut vinyl stickers of this design. The stickers should have a clean white border and a glossy finish, scattered realistically on a simple, pastel-colored background.'},
    { id: 'phone-case', name: 'Phone Case', template: 'Generate a mockup of this design on a sleek, matte black smartphone case (similar to an iPhone). The phone should be resting at a slight angle on a clean, minimalist desk surface next to a pair of wireless earbuds.'},
    { id: 'hat', name: 'Hat', template: 'Create a photorealistic mockup of this design embroidered on the front of a classic black baseball cap. The cap should be shown from a slight front-angle view on a clean, neutral background to emphasize the design.' },
    { id: 'notebook', name: 'Notebook', template: 'Generate a mockup of this design on the cover of a spiral-bound notebook. The notebook should be lying on a wooden desk next to a pen, with soft, natural lighting.' },
    { id: 'tote-bag', name: 'Tote Bag', template: 'Create a photorealistic mockup of this design on a simple, minimalist canvas tote bag. The bag should be held by a person against a clean, light-colored wall, showcasing the design in a natural, lifestyle context.' },
    { id: 'coloring-book', name: 'Adult Coloring Book', template: 'Convert this image into a detailed, black-and-white line art page for an adult coloring book. The final image should be presented as a crisp page in an open coloring book, with colored pencils resting nearby.' },
    { id: 'tank-top-model', name: 'Tank Top (Model)', template: "Photorealistic mockup of this design on a heather grey tri-blend tank top worn by a person with an athletic build, standing against a sunlit brick wall." },
    { id: 'baby-onesie', name: 'Baby Onesie', template: "Create a cute, photorealistic mockup of this design on a soft, white cotton baby onesie, laid flat on a fluffy, pastel-colored blanket next to a wooden rattle." },
    { id: 'socks', name: 'Socks', template: "Generate a mockup of this design patterned on a pair of premium crew socks. One sock should be worn on a foot, the other laid flat, on a clean white background." },
    { id: 'sweatshirt-lifestyle', name: 'Sweatshirt (Lifestyle)', template: "Display this design on an oversized, cozy fleece sweatshirt. The mockup should show someone wearing it while sitting on a comfy couch, holding a warm drink, creating a relaxed, lifestyle vibe." },
    { id: 'leggings', name: 'Leggings', template: "Create a mockup of this design as an all-over print on a pair of high-quality yoga leggings. Show them on a mannequin or a person in a simple yoga pose in a bright, airy studio." },
    { id: 'beanie', name: 'Beanie', template: "A photorealistic mockup of this design embroidered on a folded, charcoal-colored knit beanie. The beanie should be resting on a rustic wooden surface next to a pair of gloves." },
    { id: 't-shirt-hanging', name: 'T-Shirt (Hanging)', template: "Display this design on a black t-shirt hanging from a stylish wooden hanger against a clean, white wall. The fabric should show realistic folds and shadows." },
    { id: 'denim-jacket-patch', name: 'Denim Jacket Patch', template: "Generate a mockup of this design as a custom embroidered patch stitched onto the back of a vintage, slightly worn denim jacket." },
    { id: 'backpack', name: 'Backpack', template: "Render this design on the main pocket of a modern, canvas backpack. The backpack should be standing upright on a polished concrete floor, with soft, directional lighting." },
    { id: 'enamel-pin', name: 'Enamel Pin', template: "Create a mockup of this design as a hard enamel pin with gold metal plating. The pin should be shown fastened to the lapel of a jacket, with a shallow depth of field." },
    { id: 'water-bottle', name: 'Water Bottle', template: "A photorealistic mockup of this design printed on a matte-finish stainless steel water bottle. The bottle should have condensation droplets and be placed on a yoga mat next to a window." },
    { id: 'laptop-sleeve', name: 'Laptop Sleeve', template: "Generate a mockup of this design on a neoprene laptop sleeve. The sleeve should be on a minimalist wooden desk next to a laptop and a cup of coffee." },
    { id: 'phone-grip', name: 'Phone Grip', template: "Display this design on a circular phone grip attached to the back of a smartphone. The phone is being held by a hand, showing how the grip is used." },
    { id: 'keychain', name: 'Keychain', template: "Create a mockup of this design on a durable acrylic keychain with a metal ring. The keychain should be hanging from a set of keys, casting a slight shadow on a neutral surface." },
    { id: 'bandana', name: 'Bandana', template: "Generate a mockup of this design as a seamless pattern on a folded cotton bandana, laid flat on a textured background with a rustic feel." },
    { id: 'face-mask', name: 'Face Mask', template: "Display this design on a reusable cloth face mask. The mockup should show the mask on a mannequin head to display its fit and form realistically." },
    { id: 'throw-pillow', name: 'Throw Pillow', template: "Render this design on a square throw pillow with a realistic fabric texture. The pillow should be placed on a modern, comfortable armchair in a well-lit living room." },
    { id: 'blanket', name: 'Blanket', template: "Generate a mockup of this design as an all-over print on a soft, plush fleece blanket. The blanket should be draped casually over the edge of a bed." },
    { id: 'wall-tapestry', name: 'Wall Tapestry', template: "Create a large, photorealistic wall tapestry featuring this design, hanging on a bedroom wall above a bed with decorative pillows." },
    { id: 'coasters', name: 'Coasters', template: "A mockup of this design on a set of four square ceramic coasters. The coasters are arranged neatly on a dark wooden table, with one having a glass of iced tea resting on it." },
    { id: 'apron', name: 'Apron', template: "Display this design on the front of a canvas kitchen apron. The apron is hanging from a hook in a bright, modern kitchen setting." },
    { id: 'beach-towel', name: 'Beach Towel', template: "Generate a photorealistic mockup of this design on a large, soft beach towel laid out on clean, white sand with the corner of a straw hat and sunglasses visible." },
    { id: 'wall-clock', name: 'Wall Clock', template: "Create a mockup of this design on the face of a minimalist, circular wall clock with no numbers. The clock should be hanging on a subtly textured wall, with soft side lighting." },
    { id: 'fridge-magnet', name: 'Fridge Magnet', template: "Render this design as a glossy, rectangular fridge magnet. The magnet should be shown on the door of a stainless steel refrigerator, holding up a small note." },
    { id: 'greeting-card', name: 'Greeting Card', template: "Generate a mockup of this design on the front of a 5x7 inch greeting card, standing upright next to its envelope on a clean, light-colored surface." },
    { id: 'skateboard-deck', name: 'Skateboard Deck', template: "Create a photorealistic mockup of this design as the graphic on the bottom of a skateboard deck. The deck should be leaning against a concrete wall in a skatepark." },
    { id: 'mousepad', name: 'Mousepad', template: "Display this design on a rectangular mousepad with stitched edges. The mousepad is on a desk next to a keyboard and a gaming mouse." },
    { id: 'jigsaw-puzzle', name: 'Jigsaw Puzzle', template: "Generate a mockup of this design as a completed 1000-piece jigsaw puzzle. A few puzzle pieces should be lying next to the finished puzzle on a wooden table." },
    { id: 'instagram-post', name: 'Instagram Post', template: "Frame this image within an Instagram post mockup. Include the user interface with a generic profile picture, username, caption area, and engagement icons." },
    { id: 'youtube-thumbnail', name: 'YouTube Thumbnail', template: "Create a YouTube thumbnail mockup using this design as the main visual element. Overlay a bold, catchy title in a large font (e.g., 'YOU WON\\'T BELIEVE THIS!') to simulate a real thumbnail." },
    { id: 'vinyl-record-cover', name: 'Vinyl Record Cover', template: "Design a 12x12 inch vinyl record album cover with this artwork. The mockup should show the record sleeve partially pulled out, revealing the black vinyl disc." },
    { id: 'gift-wrapping-paper', name: 'Gift Wrapping Paper', template: "Generate a repeating pattern of this design on a roll of gift wrapping paper. One part of the paper should be used to wrap a small box, tied with a ribbon." },
    { id: 'coffee-bag', name: 'Coffee Bag', template: "Create a mockup of this design on the front of a matte black, stand-up coffee bag. The bag should be placed on a rustic counter with scattered coffee beans." },
    { id: 'beer-can-label', name: 'Beer Can Label', template: "Generate a mockup of this design as a label on a 16oz craft beer can. The can should be photorealistic with condensation, placed on a bar counter." },
    { id: 'temporary-tattoo', name: 'Temporary Tattoo', template: "Display this design as a temporary tattoo on someone's forearm. The lighting should be natural, and the skin texture should be visible for realism." },
    { id: 'air-freshener', name: 'Car Air Freshener', template: "Render this design on a custom-shaped cardboard air freshener hanging from the rearview mirror of a car. The car's interior should be softly blurred in the background." },
    { id: 'chocolate-wrapper', name: 'Chocolate Bar Wrapper', template: "Generate a photorealistic mockup of this design on the wrapper of an artisanal chocolate bar. The bar should be partially unwrapped to show the chocolate inside." },
    { id: 'cereal-box', name: 'Cereal Box', template: "Create a mockup of this design on the front of a colorful, fun cereal box. The box should be on a kitchen table next to a bowl of cereal." },
    { id: 'book-cover', name: 'Book Cover', template: "Display this design as the front cover of a paperback book. The book should be standing upright at a slight angle on a bookshelf among other books." },
    { id: 'candle-label', name: 'Candle Label', template: "Generate a mockup of this design on a label for a glass jar candle. The candle should be lit, with a soft glow, and placed on a wooden surface in a cozy, dimly lit room." }
];


const VARIATIONS_OPTIONS = [1, 2, 3, 4];
const ASPECT_RATIO_OPTIONS = ['1:1', '16:9', '9:16', '4:3', '3:4'];

export const ControlPanel: React.FC<ControlPanelProps> = ({
  mode,
  prompt,
  setPrompt,
  onGenerateEdit,
  onGenerateNew,
  onGenerateBatch,
  onReset,
  isLoading,
  isImageUploaded,
  onSuggest,
  isSuggesting,
  suggestions,
  selectedPresets,
  onSelectedPresetsChange,
  negativePrompt,
  setNegativePrompt,
  variations,
  setVariations,
  aspectRatio,
  setAspectRatio,
  brandKit,
  onUpdateBrandKit,
  useBrandKit,
  setUseBrandKit,
  customPresets,
  onUpdateCustomPresets,
  onFetchNews,
  isFetchingNews,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const allPresets = [...MERCH_PRESETS, ...customPresets];

  const canSubmit = mode === 'edit' 
    ? isImageUploaded && (selectedPresets.length > 0 || prompt.trim() !== '') && !isLoading
    : prompt.trim() !== '' && !isLoading;

  const handlePresetClick = (preset: MerchPreset) => {
    const isCurrentlySelected = selectedPresets.some(p => p.id === preset.id);
    let newSelection;
    if (isCurrentlySelected) {
        newSelection = selectedPresets.filter(p => p.id !== preset.id);
    } else {
        newSelection = [...selectedPresets, preset];
    }
    onSelectedPresetsChange(newSelection);
  };
  
  const handleStarterPack = () => {
    if (isLoading || !isImageUploaded) return;
    const starterPackIds = ['t-shirt', 'mug', 'hoodie'];
    const starterPackPresets = MERCH_PRESETS.filter(p => starterPackIds.includes(p.id));
    onGenerateBatch(starterPackPresets);
  };

  const handleSubmit = () => {
    if (isLoading) return;
    if (mode === 'edit') {
      onGenerateEdit();
    } else {
      onGenerateNew();
    }
  }
  
  useEffect(() => {
    if (mode === 'edit') {
      if (selectedPresets.length === 1) {
        setPrompt(selectedPresets[0].template);
      } else {
        setPrompt('');
      }
    }
  }, [selectedPresets, mode, setPrompt]);

  const getGenerateButtonText = () => {
    if (mode === 'generate') {
      return variations > 1 ? `Generate ${variations} Variations` : 'Generate Image';
    }
    if (selectedPresets.length > 1) return `Generate ${selectedPresets.length} Mockups`;
    return 'Generate';
  };
  
  const handleSaveCustomPreset = (newPreset: { name: string; template: string }) => {
    const presetToAdd: MerchPreset = {
      ...newPreset,
      id: `custom-${Date.now()}`,
      isCustom: true
    };
    onUpdateCustomPresets([...customPresets, presetToAdd]);
    setIsModalOpen(false);
  };

  const handleDeleteCustomPreset = (idToDelete: string) => {
    const updatedPresets = customPresets.filter(p => p.id !== idToDelete);
    onSelectedPresetsChange(selectedPresets.filter(p => p.id !== idToDelete));
    onUpdateCustomPresets(updatedPresets);
  };


  return (
    <>
      <div className="bg-gray-800/50 p-6 rounded-2xl shadow-md border border-gray-700 flex flex-col gap-4 h-full">
        <h2 className="text-lg font-semibold text-gray-200">
          {mode === 'edit' ? '2. Describe Your Mockup or Edit' : '1. Describe The Image You Want'}
        </h2>
        
        {mode === 'edit' && (
          <>
            <div className="flex flex-col gap-3">
              <label className="block text-sm font-medium text-gray-300">
                Start with a product (select one or more)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {allPresets.map((preset) => {
                      const isSelected = selectedPresets.some(p => p.id === preset.id);
                      const isSuggested = suggestions.map(s => s.toLowerCase()).includes(preset.name.toLowerCase());
                      return (
                        <div key={preset.id} className="relative group">
                          <button
                              onClick={() => handlePresetClick(preset)}
                              disabled={!isImageUploaded || isLoading}
                              className={`w-full h-full p-2 text-xs font-semibold text-center rounded-md transition-all duration-200 border-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95
                                  ${isSelected ? 'bg-purple-600 border-purple-400 text-white active:bg-purple-700' : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-purple-500 hover:bg-gray-600 hover:scale-105 active:bg-purple-500'}
                                  ${isSuggested && !isSelected ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-cyan-400' : ''}
                                  ${preset.isCustom ? 'border-dashed' : ''}
                              `}
                          >
                            {preset.name}
                          </button>
                          {preset.isCustom && (
                               <button
                                  onClick={() => handleDeleteCustomPreset(preset.id)}
                                  className="absolute -top-1.5 -right-1.5 p-0.5 bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                  aria-label={`Delete ${preset.name}`}
                              >
                                  <XCircleIcon className="w-4 h-4" />
                              </button>
                          )}
                        </div>
                      )
                  })}
                  <button
                    onClick={() => setIsModalOpen(true)}
                    disabled={!isImageUploaded || isLoading}
                    className="p-2 flex flex-col items-center justify-center text-xs font-semibold text-center rounded-md transition-all duration-200 border-2 border-dashed bg-gray-700/50 border-gray-600 text-gray-400 hover:border-purple-500 hover:text-white hover:bg-gray-700 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                    <PlusCircleIcon className="w-5 h-5 mb-1" />
                    Create New
                </button>
              </div>
            </div>
          </>
        )}
        
        <div className="grid grid-cols-2 gap-2">
            {mode === 'edit' ? (
              <>
                 <button
                    onClick={handleStarterPack}
                    disabled={!isImageUploaded || isLoading || isSuggesting || isFetchingNews}
                    className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-center text-purple-200 bg-purple-900/50 rounded-lg hover:bg-purple-800/50 focus:ring-4 focus:ring-purple-700 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                      <PackageIcon className="w-4 h-4 mr-2" />
                      Starter Pack
                  </button>
                  <button
                    onClick={onSuggest}
                    disabled={!isImageUploaded || isLoading || isSuggesting || isFetchingNews}
                    className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-center text-cyan-200 bg-cyan-900/50 rounded-lg hover:bg-cyan-800/50 focus:ring-4 focus:ring-cyan-700 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isSuggesting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Suggesting...
                      </>
                    ) : (
                      <>
                        <LightbulbIcon className="w-4 h-4 mr-2" />
                        Smart Suggest
                      </>
                    )}
                  </button>
                   <button
                    onClick={onFetchNews}
                    disabled={isLoading || isSuggesting || isFetchingNews}
                    className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-center text-amber-200 bg-amber-900/50 rounded-lg hover:bg-amber-800/50 focus:ring-4 focus:ring-amber-700 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isFetchingNews ? (
                      <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Fetching News...
                      </>
                    ) : (
                      <>
                        <NewspaperIcon className="w-4 h-4 mr-2" />
                        Fetch Latest News
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => onGenerateBatch(selectedPresets)}
                    disabled={!isImageUploaded || isLoading || selectedPresets.length === 0}
                    className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-center text-green-200 bg-green-900/50 rounded-lg hover:bg-green-800/50 focus:ring-4 focus:ring-green-700 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <SparklesIcon className="w-4 h-4 mr-2" />
                    Generate Mockups
                  </button>
              </>
            ) : (
               <button
                onClick={onFetchNews}
                disabled={isLoading || isSuggesting || isFetchingNews}
                className="w-full col-span-2 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-center text-amber-200 bg-amber-900/50 rounded-lg hover:bg-amber-800/50 focus:ring-4 focus:ring-amber-700 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isFetchingNews ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Fetching News...
                  </>
                ) : (
                  <>
                    <NewspaperIcon className="w-4 h-4 mr-2" />
                    Fetch Latest News
                  </>
                )}
              </button>
            )}
        </div>


        <div className="flex-grow flex flex-col mt-2">
          <label htmlFor="prompt" className="block mb-2 text-sm font-medium text-gray-300">
            {mode === 'edit' ? 'Custom Prompt' : 'Prompt'}
          </label>
          <textarea
            id="prompt"
            rows={mode === 'edit' ? 3 : 5}
            className="block p-2.5 w-full text-sm text-gray-100 bg-gray-700 rounded-lg border border-gray-600 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 transition disabled:bg-gray-700/50"
            placeholder={
              mode === 'edit' 
                ? selectedPresets.length > 1
                  ? 'Using selected product templates...'
                  : 'e.g., place this design on a tote bag made of canvas' 
                : 'e.g., A cute cat astronaut floating in space, digital art'
            }
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={(mode === 'edit' && (!isImageUploaded || selectedPresets.length > 1)) || isLoading}
          />
        </div>
        
        <div className="border-t border-gray-700 pt-4 flex flex-col gap-4">
            
            {mode === 'edit' && (
               <details className="group bg-gray-900/30 rounded-lg">
                  <summary className="p-3 cursor-pointer text-sm font-medium text-gray-300 list-none flex items-center justify-between hover:bg-gray-700/50 rounded-t-lg">
                      <span className='flex items-center gap-2'>
                        <PaintBrushIcon className="w-5 h-5 text-purple-400" />
                        Brand Kit
                      </span>
                      <div className="flex items-center gap-3" onClick={(e) => e.preventDefault()}>
                          <label htmlFor="use-brand-kit" className="flex items-center cursor-pointer">
                            <span className={`mr-2 text-xs font-semibold ${useBrandKit ? 'text-purple-300' : 'text-gray-400'}`}>
                              {useBrandKit ? 'Enabled' : 'Disabled'}
                            </span>
                            <div className="relative">
                              <input 
                                id="use-brand-kit" 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={useBrandKit} 
                                onChange={(e) => setUseBrandKit(e.target.checked)} 
                                disabled={isLoading || !isImageUploaded}
                              />
                              <div className="block w-10 h-6 rounded-full bg-gray-600 peer-checked:bg-purple-600 transition"></div>
                              <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4"></div>
                            </div>
                          </label>
                          <span className="transition-transform duration-200 group-open:rotate-90 text-gray-400">▶</span>
                      </div>
                  </summary>
                  <div className="p-4 border-t border-gray-700">
                      <BrandKitPanel brandKit={brandKit} onUpdateBrandKit={onUpdateBrandKit} />
                  </div>
              </details>
            )}

            <div className="relative">
              <label htmlFor="negative-prompt" className="block mb-2 text-sm font-medium text-gray-300">
                Negative Prompt (what to avoid)
              </label>
              <textarea
                id="negative-prompt"
                rows={2}
                className="block p-2.5 w-full text-sm text-gray-100 bg-gray-700 rounded-lg border border-gray-600 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 transition disabled:bg-gray-700/50"
                placeholder="e.g., text, logos, blurry, poorly lit, extra limbs"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {mode === 'generate' && (
              <>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">Variations</label>
                  <div className="grid grid-cols-4 gap-2">
                    {VARIATIONS_OPTIONS.map(v => (
                      <button
                        key={v}
                        onClick={() => setVariations(v)}
                        disabled={isLoading}
                        className={`p-2 text-sm font-semibold text-center rounded-md transition-all duration-200 border-2 disabled:opacity-50 disabled:cursor-not-allowed
                          ${variations === v ? 'bg-purple-600 border-purple-400 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-purple-500'}
                        `}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">Aspect Ratio</label>
                  <div className="flex flex-wrap justify-center gap-2">
                    {ASPECT_RATIO_OPTIONS.map(ar => (
                      <button
                        key={ar}
                        onClick={() => setAspectRatio(ar)}
                        disabled={isLoading}
                        className={`py-2 px-3 text-sm font-semibold text-center rounded-md transition-all duration-200 border-2 disabled:opacity-50 disabled:cursor-not-allowed
                          ${aspectRatio === ar ? 'bg-purple-600 border-purple-400 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-purple-500'}
                        `}
                      >
                        {ar}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-auto pt-4">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex-grow inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <SparklesIcon className="w-5 h-5 mr-2" />
                {getGenerateButtonText()}
              </>
            )}
          </button>
          <button
            onClick={onReset}
            className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-gray-300 bg-gray-700/50 rounded-lg hover:bg-gray-600 focus:ring-4 focus:ring-gray-800 disabled:opacity-50 transition-colors duration-200"
          >
            <ArrowPathIcon className="w-5 h-5 mr-2" />
            Reset
          </button>
        </div>
      </div>
      <CustomTemplateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCustomPreset}
      />
    </>
  );
};