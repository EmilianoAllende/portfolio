import React from "react";
import { RegisterFormInputProps } from "@/interfaces/RegisterFormInputProps";

const RegisterFormInput: React.FC<RegisterFormInputProps> = ({
  id,
  label,
  name,
  type,
  value,
  error,
  handleChange,
  handleBlur,
}) => {
  return (
    <div className="bg-secondaryColor mt-2 rounded-xl">
      <label className="block mb-1 bg-primaryColor rounded-md p-1 font-semibold text-quaternaryColor" htmlFor={id}>
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={label}
      />
      {<p className="text-red-500 text-sm px-4">{error}</p>}
    </div>
  );
};

export default RegisterFormInput;