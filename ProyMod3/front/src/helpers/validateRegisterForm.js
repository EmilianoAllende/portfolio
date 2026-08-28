export const validateRegisterForm = (values) => {
  let errors = {};

  if (!values.name) {
    errors.name = "El nombre es requerido";
  } else if (values.name.length < 3) {
    errors.name = "El nombre tiene que tener mínimo tres caracteres";
  }

  if (!values.email) {
    errors.email = "El email es requerido";
  } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = "El email es inválido";
  }

  if (!values.birthdate) {
    errors.birthdate = "La fecha de nacimiento es requerida";
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(values.birthdate)) {
    errors.birthdate = "La fecha es inválida";
  }

  if (!values.nDni) {
    errors.nDni = "El DNI es requerido";
  } else if (values.nDni.length < 7) {
    errors.nDni = "El DNI es inválido";
  }

  if (!values.username) {
    errors.username = "El usuario es requerido";
  } else if (values.username.length < 3) {
    errors.username =
      "El nombre de usuario tiene que tener mínimo tres caracteres";
  }

  if (!values.password) {
    errors.password = "La contraseña es requerida";
  } else if (!/^(?=.*[a-zA-Z])(?=.*\d).{6,}$/.test(values.password)) {
    errors.password = "La contraseña debe tener letras y números";
  }
  if (values.repeatPassword !== values.password) {
    errors.repeatPassword = "Las contraseñas no coinciden";
  }

  return errors;
};