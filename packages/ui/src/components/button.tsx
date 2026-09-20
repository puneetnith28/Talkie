import * as React from 'react';
import { cn } from '../utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'pill';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08090b] disabled:pointer-events-none disabled:opacity-45 disabled:cursor-not-allowed select-none active:scale-[0.97] cursor-pointer';

    const variants = {
      primary:
        'bg-[#26b65a] hover:bg-[#22c55e] text-white font-semibold shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_12px_28px_rgba(5,20,11,0.32)] rounded-full hover:shadow-[0_0_0_1px_rgba(255,255,255,0.18),0_18px_38px_rgba(5,20,11,0.45)] hover:-translate-y-0.5 active:translate-y-0',
      secondary:
        'bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/[0.08] hover:border-white/[0.16] rounded-full backdrop-blur-md hover:-translate-y-0.5 active:translate-y-0',
      outline:
        'border border-white/[0.12] hover:border-white/[0.22] hover:bg-white/[0.06] text-white/90 hover:text-white rounded-xl active:scale-[0.98]',
      ghost:
        'hover:bg-white/[0.06] text-white/70 hover:text-white rounded-xl active:scale-[0.98]',
      destructive:
        'bg-[#fa3532] hover:bg-[#ef4444] text-white shadow-sm rounded-full hover:shadow-[0_0_0_1px_rgba(250,53,50,0.3),0_12px_24px_rgba(250,53,50,0.25)] hover:-translate-y-0.5 active:translate-y-0',
      pill:
        'border border-white/[0.08] hover:border-white/[0.16] bg-white/[0.04] text-white/80 hover:text-white hover:bg-white/[0.08] rounded-full',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
      md: 'text-sm px-4 py-2 gap-2 h-10',
      lg: 'text-base px-6 py-3 gap-2.5 h-12 font-semibold',
      icon: 'size-9 p-0 rounded-lg',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <span className="inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
