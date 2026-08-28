"use client"
import React from "react";

interface InputProps {
  label?: string;
  name: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  name,
  type = "",
  placeholder = "",
  value,
  onChange,
  required = false,
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="block text-md font-semibold text-[#4e4090]">
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        {...(type !== "file" ? { value } : {})} // solo pasar value si no es file
        onChange={onChange}
        className="w-full px-4 py-2 border-0 border-b-2 border-[#4e4090] focus:outline-none focus:ring-0"
      />
    </div>
  );
};

export default Input;