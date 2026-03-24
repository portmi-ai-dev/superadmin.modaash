// app/components/ui/Select.tsx

import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface Option {
    value: string;
    label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    helperText?: string;
    options: Option[];
    fullWidth?: boolean;
    placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, helperText, options, fullWidth = true, placeholder, className, id, ...props }, ref) => {
        const selectId = id || label?.toLowerCase().replace(/\s/g, '-');

        return (
            <div className={cn(fullWidth && 'w-full')}>
                {label && (
                    <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    id={selectId}
                    className={cn(
                        'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                        'disabled:bg-gray-100 disabled:cursor-not-allowed',
                        error && 'border-red-500 focus:ring-red-500',
                        fullWidth && 'w-full',
                        className
                    )}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
            </div>
        );
    }
);

Select.displayName = 'Select';

export default Select;