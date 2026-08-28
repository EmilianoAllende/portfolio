import { validateEmail, validatePassword } from "./validateCredentials";

export const validateRegisterForm = (data: Record<string, string>): Record<string, string> => {
  const errors: Record<string, string> = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    phone: "",
  };

  if (!data.name || data.name.trim() === "") {
    errors.name = "Name is required.";
  }

  if (!data.email) {
    errors.email = "Email is required.";
  } else {
    const emailError = validateEmail(data.email);
    if (emailError) errors.email = emailError;
  }

  if (!data.password) {
    errors.password = "Password is required.";
  } else {
    const passwordError = validatePassword(data.password);
    if (passwordError) errors.password = passwordError;
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Password does not match.";
  }

  if (!data.address || data.address.trim() === "") {
    errors.address = "Address is required.";
  }

  if (!data.phone || data.phone.trim() === "") {
    errors.phone = "Phone is required.";
  }

  return errors;
};