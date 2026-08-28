import React from 'react';

export const SectionHeader = ({ icon: Icon, title, colorClass, bgClass }) => (
    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-xl">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${bgClass}`}>
                <Icon className={`w-5 h-5 ${colorClass}`} />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                {title}
            </h3>
        </div>
    </div>
);

export const SectionCard = ({ children, colorClass, bgClass, title, subtitle }) => (
    <div className={`p-4 rounded-lg ${bgClass} border border-gray-100 dark:border-gray-700`}>
        <h3 className={`mb-2 text-sm font-bold ${colorClass} uppercase tracking-wide`}>{title}</h3>
        {subtitle && (
            <div className="mb-4 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                {Array.isArray(subtitle) ? subtitle.map((line, i) => <p key={i}>{line}</p>) : <p>{subtitle}</p>}
            </div>
        )}
        {children}
    </div>
);

export const InputField = ({ label, name, icon: Icon, type = "text", className = "", disabled, value, onChange, ...props }) => (
    <div className={`group ${className}`}>
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">
            {label}
        </label>
        <div className="relative">
            {Icon && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon className={`h-4 w-4 transition-colors ${disabled ? 'text-gray-400' : 'text-gray-400 group-focus-within:text-blue-500'}`} />
                </div>
            )}
            <input
                type={type}
                name={name}
                value={value || ""}
                onChange={onChange}
                disabled={disabled}
                className={`
                    block w-full rounded-lg border 
                    ${disabled
                        ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500'
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700/50 dark:border-gray-600 dark:text-white dark:focus:bg-gray-700'}
                    shadow-sm sm:text-sm py-2.5 transition-all 
                    ${Icon ? 'pl-10' : 'pl-4'}
                `}
                {...props}
            />
        </div>
    </div>
);

export const SelectField = ({ label, name, options, disabled = false, value, onChange, ...props }) => (
    <div>
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">
            {label}
        </label>
        <div className="relative">
            <select
                name={name}
                value={value || ""}
                onChange={onChange}
                disabled={disabled}
                className={`block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white shadow-sm focus:bg-white dark:focus:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm py-2.5 pl-4 transition-all appearance-none ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                {...props}
            >
                {options}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
            </div>
        </div>
    </div>
);

export const TextAreaField = ({ label, name, rows = 3, placeholder, value, onChange, className = "", ...props }) => (
    <div className={className}>
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">
            {label}
        </label>
        <textarea
            name={name}
            value={value || ""}
            onChange={onChange}
            rows={rows}
            placeholder={placeholder}
            className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white shadow-sm focus:bg-white dark:focus:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm py-3 px-4 transition-all resize-none"
            {...props}
        />
    </div>
);
