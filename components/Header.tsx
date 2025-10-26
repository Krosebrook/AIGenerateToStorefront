
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="p-4 border-b border-gray-700/50 shadow-lg bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
          AI Merch & Image Editor
        </h1>
      </div>
    </header>
  );
};
