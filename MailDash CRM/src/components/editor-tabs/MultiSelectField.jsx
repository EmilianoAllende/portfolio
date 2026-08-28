import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';

export const MultiSelectField = ({
    label,
    name,
    options,
    disabled = false,
    value,
    onChange,
    placeholder = "Seleccionar...",
    compactDisplay = false,
    selectedSummaryText = "Seleccionados",
    ...props
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Convert value string to array
    const selectedValues = (value || "").split(',').map(v => v.trim()).filter(Boolean);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (optionValue) => {
        if (disabled) return;
        
        let newValues;
        if (selectedValues.includes(optionValue)) {
            newValues = selectedValues.filter(v => v !== optionValue);
        } else {
            newValues = [...selectedValues, optionValue];
        }
        
        // Create synthetic event for onChange
        const syntheticEvent = {
            target: {
                name,
                value: newValues.join(',')
            }
        };
        onChange(syntheticEvent);
    };

    const removeOption = (e, optionValue) => {
        e.stopPropagation();
        if (disabled) return;
        
        const newValues = selectedValues.filter(v => v !== optionValue);
        const syntheticEvent = {
            target: {
                name,
                value: newValues.join(',')
            }
        };
        onChange(syntheticEvent);
    };

    const displayText = selectedValues.length === 0
        ? placeholder
        : selectedSummaryText;

    return (
        <div className="relative group" ref={containerRef}>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">
                {label}
            </label>
            
            <div 
                className={`
                    w-full rounded-lg border transition-all
                    ${disabled 
                        ? 'bg-gray-100 border-gray-200 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700' 
                        : 'bg-gray-50 border-gray-300 cursor-pointer hover:border-gray-400 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 dark:bg-gray-700/50 dark:border-gray-600 dark:hover:border-gray-500'}
                    ${compactDisplay ? 'h-[44px] px-3 py-2 flex items-center gap-2 overflow-hidden' : 'min-h-[44px] p-1.5 flex flex-wrap gap-1.5 items-center'}
                `}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                {...props}
            >
                {compactDisplay ? (
                    <>
                        <span className={`text-sm select-none pointer-events-none truncate ${selectedValues.length === 0 ? 'text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-200 font-medium'}`}>
                            {displayText}
                        </span>
                        {selectedValues.length > 0 && (
                            <span className="ml-auto mr-1 inline-flex min-w-6 items-center justify-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                {selectedValues.length}
                            </span>
                        )}
                    </>
                ) : selectedValues.length === 0 && (
                    <span className="text-gray-500 dark:text-gray-400 text-sm ml-2.5 py-1 select-none pointer-events-none">
                        {placeholder}
                    </span>
                )}

                {!compactDisplay && selectedValues.map(val => {
                    const option = options.find(o => o.value === val);
                    const displayLabel = option ? option.label : val;
                    return (
                        <span 
                            key={val} 
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 transition-colors"
                        >
                            {displayLabel}
                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={(e) => removeOption(e, val)}
                                    className="p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full transition-colors focus:outline-none"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </span>
                    );
                })}
                
                <div className="ml-auto pr-2 text-gray-400 pointer-events-none">
                    <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {/* Dropdown Menu */}
            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                    {options.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                            No hay opciones disponibles
                        </div>
                    ) : (
                        options.map((option) => {
                            const isSelected = selectedValues.includes(option.value);
                            return (
                                <div
                                    key={option.value}
                                    onClick={() => toggleOption(option.value)}
                                    className={`
                                        flex items-center justify-between px-4 py-2 text-sm cursor-pointer transition-colors
                                        ${isSelected 
                                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 font-medium' 
                                            : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700'}
                                    `}
                                >
                                    <span>{option.label}</span>
                                    {isSelected && <Check size={16} className="text-blue-600 dark:text-blue-400" />}
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};
