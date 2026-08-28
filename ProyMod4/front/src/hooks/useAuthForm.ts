import { useState } from "react";

//? Tipos auxiliares basados en el tipo de formulario
type ErrorMessages<FormValues> = Partial<Record<keyof FormValues, string>>;
type TouchedFields<FormValues> = Partial<Record<keyof FormValues, boolean>>;

//! Propiedades que recibe el hook
interface UseAuthFormProps<FormValues> {
  initialValues: FormValues;
  validate: (data: FormValues) => ErrorMessages<FormValues>;
};

//* Hook genérico
export function useAuthForm<FormValues extends Record<string, string>>({
  initialValues,
  validate,
}: UseAuthFormProps<FormValues>) {
  const [data, setData] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<ErrorMessages<FormValues>>({});
  const [touched, setTouched] = useState<TouchedFields<FormValues>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));

    const newErrors = validate({ ...data, [name]: value } as FormValues);
    setErrors(newErrors);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const validationErrors = validate(data);
    setErrors(validationErrors);
  };

  const handleValidation = () => {
    const validationErrors = validate(data);
    setErrors(validationErrors);

    const touchedFields = Object.keys(data).reduce((acc, key) => {
      acc[key as keyof FormValues] = true;
      return acc;
    }, {} as TouchedFields<FormValues>);

    setTouched(touchedFields);
    return validationErrors;
  };

  const isFormValid = Object.values(errors).every(error => !error);

  return {
    data,
    setData,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleValidation,
    isFormValid,
  };
};