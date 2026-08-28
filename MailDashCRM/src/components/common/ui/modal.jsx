import React from "react";

export const Modal = ({ open = false, onOpenChange, children, className = "" }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div
        className={`relative bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-2xl w-full mx-4 overflow-hidden ${className}`}
      >
        {children}
      </div>
    </div>
  );
};
