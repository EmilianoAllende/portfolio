import { validateEmail, validatePassword } from "./validateCredentials";

export const validateLoginForm = (data: Record<string, string>): Record<string, string> => {
    const errors = {
        email: "",
        password: "",
    };

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

    return errors;
};