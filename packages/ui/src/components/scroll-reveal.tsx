import * as React from 'react';
import { cn } from '../utils';

export interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  threshold?: number;
  rootMargin?: string;
  delay?: number; // delay in ms (e.g. 100, 200)
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number; // distance in px (default: 20)
  duration?: number; // duration in ms (default: 600)
  className?: string;
  children?: React.ReactNode;
}

export function ScrollReveal({
  threshold = 0.1,
  rootMargin = '0px 0px -40px 0px',
  delay = 0,
  direction = 'up',
  distance = 20,
  duration = 600,
  className,
  children,
  ...props
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // If running on server or without IntersectionObserver support
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  const getTransform = () => {
    if (isVisible) return 'none';
    switch (direction) {
      case 'up':
        return `translateY(${distance}px)`;
      case 'down':
        return `translateY(-${distance}px)`;
      case 'left':
        return `translateX(${distance}px)`;
      case 'right':
        return `translateX(-${distance}px)`;
      case 'none':
      default:
        return 'none';
    }
  };

  const style: React.CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transform: getTransform(),
    transition: `opacity ${duration}ms cubic-bezier(0.05, 0.7, 0.1, 1.0) ${delay}ms, transform ${duration}ms cubic-bezier(0.05, 0.7, 0.1, 1.0) ${delay}ms`,
    willChange: 'opacity, transform',
  };

  return (
    <div ref={ref} style={style} className={cn(className)} {...props}>
      {children}
    </div>
  );
}
