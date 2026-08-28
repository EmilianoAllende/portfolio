import React from "react";

export const Card = ({ className = "", children }) => (
  <div className={`rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ className = "", children }) => (
  <div className={`px-6 py-4 border-b border-slate-200 dark:border-slate-700 ${className}`}>
    {children}
  </div>
);

export const CardContent = ({ className = "", children }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ className = "", children }) => (
  <div className={`px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2 ${className}`}>
    {children}
  </div>
);
