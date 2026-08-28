"use client";
import { Field, ErrorMessage, useField } from "formik";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputFormikProps {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

const PasswordInputFormik: React.FC<PasswordInputFormikProps> = ({
  name,
  label,
  placeholder = "",
  required = false,
}) => {
  const [field] = useField(name);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <label htmlFor={name} className="block mt-4">
      {label && <p className="font-semibold text-secondary pb-1">{label}</p>}

      <div className="relative">
        <Field
          id={name}
          {...field}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          required={required}
          // autocomplete="current-password"
          className="w-full py-3 mb-1 border border-zinc-500 rounded-lg px-3 pr-10 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute top-1/2 right-3 transform -translate-y-1/2 text-zinc-600 hover:text-zinc-800 focus:outline-none"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <ErrorMessage name={name}>
        {(err) => <div className="text-sm text-red-500 mt-1">{err}</div>}
      </ErrorMessage>
    </label>
  );
};

export default PasswordInputFormik;
