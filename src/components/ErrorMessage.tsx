// src/components/ErrorMessage.tsx
import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  type?: 'error' | 'warning' | 'info';
  onDismiss?: () => void;
  className?: string;
}

export default function ErrorMessage({ 
  message, 
  type = 'error', 
  onDismiss, 
  className = '' 
}: ErrorMessageProps) {
  const bgColor = {
    error: 'bg-red-50 border-red-200 text-red-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700'
  };

  const iconColor = {
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400'
  };

  return (
    <div className={`flex items-start p-4 border rounded-lg ${bgColor[type]} ${className}`}>
      <AlertCircle size={20} className={`mt-0.5 mr-3 flex-shrink-0 ${iconColor[type]}`} />
      <div className="flex-1 mr-2">
        <p className="text-sm font-medium">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}