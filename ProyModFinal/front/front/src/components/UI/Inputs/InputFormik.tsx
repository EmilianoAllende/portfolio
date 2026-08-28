"use client"
import { Field, ErrorMessage } from "formik";

interface InputProps {
  name: string;
  label?: string;
  type?:
    | "text"
    | "email"
    | "password"
    | "tel"
    | "number" 
    | "select"
    | "textarea"
    | "checkbox"
    | "radio";
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[]; // Para select, radio
}

const InputFormik: React.FC<InputProps> = ({
  name,
  label,
  type = "text",
  placeholder = "",
  required = false,
  options = [],
}) => {
  return (
    <label htmlFor={name} className="block mt-4">
      <p className="font-semibold text-secondary pb-1">{label}</p>

      {/* Campo dinámico */}
      {type === "select" ? (
        <Field
          as="select"
          id={name}
          name={name}
          className="w-full py-3 mb-1 border border-zinc-500 rounded-lg px-3 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
        >
          <option value="">Seleccione una opción</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Field>
      ) : type === "textarea" ? (
        <Field
          as="textarea"
          id={name}
          name={name}
          placeholder={placeholder}
          className="w-full py-3 mb-1 border border-zinc-500 rounded-lg px-3 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
        />
      ) : type === "checkbox" || type === "radio" ? (
        options.map((opt) => (
          <label key={opt.value} className="flex items-center space-x-2 mt-1">
            <Field type={type} name={name} value={opt.value} />
            <span>{opt.label}</span>
          </label>
        ))
      ) : (
        <Field
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          className="w-full py-3 mb-1 border border-zinc-500 rounded-lg px-3 transition hover:outline-1 hover:outline-gray-600 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
        />
      )}

      <ErrorMessage name={name}>
        {(err) => <div className="text-sm text-red-500 mt-1">{err}</div>}
      </ErrorMessage>
    </label>
  );
};

export default InputFormik;
