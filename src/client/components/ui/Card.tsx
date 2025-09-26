import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';


export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'glass' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => {
    // Enhanced base styles with professional effects
    const baseStyles = `
      bg-gradient-to-br from-white to-gray-50/30 rounded-2xl border 
      transition-all duration-300 ease-out transform hover:scale-[1.01]
      backdrop-blur-sm shadow-sm hover:shadow-xl
    `;
    
    // Enhanced variant styles with sophisticated effects
    const variants = {
      default: `
        border-gray-200/60 shadow-gray-200/50 hover:shadow-gray-300/60
        hover:border-gray-300/80 hover:from-white hover:to-gray-50/50
      `,
      interactive: `
        border-gray-200/60 shadow-gray-200/50 hover:shadow-blue-200/40
        cursor-pointer hover:border-blue-300/60 hover:from-blue-50/30 hover:to-indigo-50/30
        active:scale-[0.99] hover:scale-[1.02]
      `,
      glass: `
        bg-white/70 backdrop-blur-lg border-white/30 shadow-gray-200/30
        hover:bg-white/80 hover:border-white/40 hover:shadow-gray-300/40
      `,
      elevated: `
        border-gray-200/40 shadow-lg shadow-gray-300/25 hover:shadow-xl hover:shadow-gray-400/30
        hover:border-gray-300/60 hover:-translate-y-1
      `,
    };
    
    // Enhanced padding styles with better proportions
    const paddings = {
      none: '',
      sm: 'p-5',
      md: 'p-7', 
      lg: 'p-9',
      xl: 'p-12',
    };

    return (
      <div
        className={cn(
          baseStyles,
          variants[variant],
          paddings[padding],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card Header Component
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, subtitle, action, children, ...props }, ref) => {
    return (        <div className={cn('flex items-start justify-between mb-6 pb-4 border-b border-gray-100', className)}
        ref={ref}
        {...props}
      >
        <div className="flex-1">
          {title && (
            <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-500 leading-relaxed">{subtitle}</p>
          )}
          {children}
        </div>
        {action && <div className="ml-4">{action}</div>}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// Card Title Component
const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    return (
      <h3
        className={cn('text-lg font-semibold text-gray-900', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

CardTitle.displayName = 'CardTitle';

// Card Content Component
const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn('text-gray-700', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

CardContent.displayName = 'CardContent';

// Card Footer Component
const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn('mt-6 pt-4 border-t border-gray-100', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
