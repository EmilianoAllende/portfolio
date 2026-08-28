import validator from "validator";

export const validateEmail = (email: string) => {
    let validation = "";
    if (!validator.isEmail(email)) validation = "Not a valid e-mail address.";
    return validation;
};

export const validatePassword = (password: string) => {
    let validation = "";
    if (!validator.isStrongPassword(password)) {
        validation =
        'Passwords must contain: 1 lower case letter [a-z], 1 upper case letter [A-Z], 1 numeric character [0-9], and 1 special character [/~`!?@#$.%<^>&*,()-_+={}[]|:"].';
    }
    return validation;
};