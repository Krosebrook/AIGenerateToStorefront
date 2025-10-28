import React, { useState, useEffect } from 'react';
import { XCircleIcon } from './icons/XCircleIcon';

interface CustomTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: { name: string; template: string }) => void;
}

export const CustomTemplateModal: React.FC<CustomTemplateModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [template, setTemplate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setTemplate('');
      setError('');
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!name.trim() || !template.trim()) {
      setError('Both name and prompt are required.');
      return;
    }
    onSave({ name, template });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl w-full max-w-lg p-8 flex flex-col gap-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Create Custom Template</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <XCircleIcon className="w-8 h-8" />
          </button>
        </div>

        <div className="flex flex-col gap-2">
            <label htmlFor="template-name" className="block text-sm font-medium text-gray-300">Template Name</label>
            <input
                id="template-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Kids T-Shirt"
                className="block w-full p-2.5 text-sm text-gray-100 bg-gray-700 rounded-lg border border-gray-600 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500"
            />
        </div>

        <div className="flex flex-col gap-2">
            <label htmlFor="template-prompt" className="block text-sm font-medium text-gray-300">Template Prompt</label>
            <textarea
                id="template-prompt"
                rows={5}
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                placeholder="e.g., Create a photorealistic mockup of this design on a child's t-shirt..."
                className="block p-2.5 w-full text-sm text-gray-100 bg-gray-700 rounded-lg border border-gray-600 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500"
            />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        
        <div className="flex gap-4 mt-2">
            <button
                onClick={onClose}
                className="flex-1 inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-gray-300 bg-gray-700/50 rounded-lg hover:bg-gray-600 focus:ring-4 focus:ring-gray-800"
            >
                Cancel
            </button>
            <button
                onClick={handleSave}
                className="flex-1 inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:ring-4 focus:ring-purple-300"
            >
                Save Template
            </button>
        </div>
      </div>
    </div>
  );
};
