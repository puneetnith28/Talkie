import * as React from 'react';
import { cn } from '../utils';
import { X } from 'lucide-react';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: DialogProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };
    if (open) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={() => onOpenChange(false)}
      />

      {/* Content */}
      <div
        className={cn(
          'relative z-50 w-full max-w-lg rounded-2xl border border-white/[0.12] bg-[#111215] p-6 shadow-2xl transition-all animate-in zoom-in-95',
          className
        )}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div>
            {title && <h2 className="text-lg font-semibold text-white">{title}</h2>}
            {description && <p className="text-xs text-white/60 mt-1">{description}</p>}
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-full p-1.5 text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="pt-4">{children}</div>
      </div>
    </div>
  );
}
