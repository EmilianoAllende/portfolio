import React from "react";
import { ChevronDown } from "lucide-react";

// Simple select wrapper that collects items and renders a native select
export const Select = ({ value, onValueChange, children }) => {
  let items = [];

  React.Children.forEach(children, (child) => {
    if (child?.type?.name === "SelectContent") {
      React.Children.forEach(child.props.children, (contentChild) => {
        if (contentChild?.type?.name === "SelectItem") {
          items.push(contentChild);
        }
      });
    }
  });

  return (
    <div className="relative w-full">
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="w-full px-3 py-2 pr-8 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
      >
        {items.map((item) => (
          <option key={item.props.value} value={item.props.value}>
            {item.props.children}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500"
      />
    </div>
  );
};

export const SelectTrigger = ({ children }) => <>{children}</>;
export const SelectContent = ({ children }) => <>{children}</>;
export const SelectItem = ({ value, children }) => null;
export const SelectValue = () => null;
export const SelectGroup = ({ children }) => <>{children}</>;
