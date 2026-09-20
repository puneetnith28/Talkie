import * as React from 'react';
import { cn } from '../utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-white/70">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          className={cn(
            'flex min-h-[90px] w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 transition-all duration-200 outline-none focus:border-emerald-500/80 focus:bg-white/[0.05] focus:ring-1 focus:ring-emerald-500/80 disabled:cursor-not-allowed disabled:opacity-40 resize-y',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400 mt-0.5">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
