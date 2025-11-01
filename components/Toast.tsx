import React, { useEffect } from 'react';
import { XCircleIcon } from './icons/XCircleIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';

interface ToastProps {
  message: string;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-dismiss after 5 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  return (
    <div
      className="fixed top-5 right-5 z-50 flex items-center w-full max-w-xs p-4 text-red-200 bg-red-800/90 backdrop-blur-sm rounded-lg shadow-lg border border-red-600/50"
      role="alert"
      style={{
        animation: 'slideInFromRight 0.5s ease-out forwards',
      }}
    >
      <style>
        {`
          @keyframes slideInFromRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
      <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-red-300 bg-red-900 rounded-lg">
        <ExclamationTriangleIcon className="w-5 h-5" />
      </div>
      <div className="ms-3 text-sm font-normal">{message}</div>
      <button
        type="button"
        className="ms-auto -mx-1.5 -my-1.5 bg-red-800 text-red-300 hover:text-white hover:bg-red-700 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 inline-flex items-center justify-center h-8 w-8"
        aria-label="Close"
        onClick={onClose}
      >
        <span className="sr-only">Close</span>
        <XCircleIcon className="w-5 h-5" />
      </button>
    </div>
  );
};