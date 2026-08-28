import React from "react";

export const Badge = ({ className = "", children }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 ${className}`}>
    {children}
  </span>
);
