import { validateEmail, validatePassword } from "./validateLogin";

export const validateRegisterForm = (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone: string,
    address: string
  }) => {
    const errors = {
      nameError: "",
      emailError: "",
      passwordError: "",
      confirmPasswordError: "",
      addressError: "",
      phoneError: "",
    };

    if (!data.name || data.name.trim() === "") {
      errors.nameError = "Name is required.";
    }

    if (!data.email) {
      errors.emailError = "Email is required.";
    } else if (validateEmail(data.email)) {
      errors.emailError = "Invalid email address.";
    }

    if (!data.password) {
      errors.passwordError = "Password is required.";
    } else if (validatePassword(data.password)) {
      errors.passwordError = 'Passwords must contain: 1 lower case letter [a-z], 1 upper case letter [A-Z], 1 numeric character [0-9], and 1 special character [/~`!?@#$.%<^>&*,()-_+={}[]|:"].';
    }

    if (data.password !== data.confirmPassword) {
      errors.confirmPasswordError = "Password does not match.";
    }

    if (!data.address || data.address.trim() === "") {
      errors.addressError = "address is required.";
    }

    if (!data.phone || data.phone.trim() === "") {
      errors.phoneError = "Phone is required.";
    }

    return errors;
  };