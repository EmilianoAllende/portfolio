const validateLogin = (user) => {
  let errors = {};

  if (!user.username) {
    errors.username = "El usuario es requerido";
  } else if (user.username.length < 3) {
    errors.username = "El usuario debe tener al menos 3 caracteres";
  }

  if (!user.password) {
    errors.password = "La contraseña es requerida";
  } else if (user.password.length < 6) {
    errors.password = "La contraseña debe tener al menos 6 caracteres";
  }

  return errors;
};

export default validateLogin;
