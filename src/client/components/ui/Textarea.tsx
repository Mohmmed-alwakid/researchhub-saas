import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';


export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[100px] w-full rounded-lg border-2 px-4 py-3 text-sm transition-all duration-300 transform focus:scale-[1.02]',
          'bg-gradient-to-r from-white to-gray-50 backdrop-blur-sm shadow-sm',
          'border-gray-200 placeholder:text-gray-400',
          'focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200/50 focus:shadow-lg focus:shadow-blue-100/50',
          'hover:border-gray-300 hover:shadow-md',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100',
          error && 'border-red-400 focus:border-red-500 focus:ring-red-200/50 focus:shadow-red-100/50 bg-gradient-to-r from-red-50 to-pink-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
