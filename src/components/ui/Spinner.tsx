// src/components/ui/Spinner.tsx
import { CSSProperties } from 'react';

interface SpinnerProps {
  fullScreen?: boolean;
  className?: string;
  style?: CSSProperties;
}

export default function Spinner({ fullScreen = false, className = '', style }: SpinnerProps) {
  const spinner = (
    <svg
      className={`animate-spin h-5 w-5 text-white ${className}`}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}