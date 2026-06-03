// src/components/ui/Input.tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  iconRight,
  className = '',
  id,
  ...props
}) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3 text-text-muted pointer-events-none">{icon}</span>
        )}
        <input
          id={inputId}
          className={`
            w-full h-9 bg-bg-tertiary border rounded-md text-sm text-text-primary
            placeholder:text-text-muted transition-all duration-150 outline-none
            focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20
            disabled:opacity-50 disabled:cursor-not-allowed
            ${icon ? 'pl-9' : 'pl-3'}
            ${iconRight ? 'pr-9' : 'pr-3'}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-white/10'}
            ${className}
          `}
          {...props}
        />
        {/* FIX 2: remove pointer-events-none from iconRight so password toggle button is clickable */}
        {iconRight && <span className="absolute right-3 text-text-muted">{iconRight}</span>}
      </div>
      {error && <p className="text-xs text-red-400 mt-0.5">{error}</p>}
    </div>
  );
};
