import { forwardRef, type LabelHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';


export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => {
    return (
      <label
        className={cn(
          'block text-sm font-semibold mb-2 transition-colors duration-200',
          'bg-gradient-to-r from-gray-700 to-slate-700 bg-clip-text text-transparent',
          'hover:from-gray-800 hover:to-slate-800',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
        {required && (
          <span 
            className="text-red-500 ml-1 font-bold" 
            aria-label="required field"
          >
            *
          </span>
        )}
      </label>
    );
  }
);

Label.displayName = 'Label';

export { Label };
