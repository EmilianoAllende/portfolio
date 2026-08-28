import { useState } from "react";
import axios from "axios";
import { validateRegisterForm } from "../../helpers/validateRegisterForm";
import Container from "./styled";
import { SLASH } from "../../utils/routes";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    birthdate: "",
    nDni: "",
    username: "",
    password: "",
    repeatPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleInput = (event) => {
    const { name, value } = event.target;

    setUserData({
      ...userData,
      [name]: value,
    });

    setErrors(validateRegisterForm({ ...userData, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true,
    });

    setErrors(validateRegisterForm(userData));
  };

  const submitRegisterForm = async (event) => {
    event.preventDefault();

    const validateErrors = validateRegisterForm(userData);
    setErrors(validateErrors);

    if (!Object.keys(validateErrors).length) {
      try {
        await axios.post("http://localhost:3000/users/register", userData);
        alert("Usuario creado con éxito");
        navigate(SLASH);

        setTouched({});
      } catch (error) {
        alert("Hubo un error al crear el usuario");
        console.error(error);
      }
    }
  };

  return (
    <>
      <Container>
        <h2>Formulario de registro</h2>

        <form onSubmit={submitRegisterForm}>
          <div>
            <label>
              Nombre{" "}
              <input
                name="name"
                type="text"
                value={userData.name}
                onChange={handleInput}
                onBlur={handleBlur}
              />
            </label>
            {touched.name && errors.name && <span>{errors.name}</span>}
          </div>

          <div>
            <label>
              Email{" "}
              <input
                name="email"
                type="email"
                value={userData.email}
                onChange={handleInput}
                onBlur={handleBlur}
              />
            </label>
            {touched.email && errors.email && <span>{errors.email}</span>}
          </div>

          <div>
            <label>
              Fecha de nacimiento{" "}
              <input
                name="birthdate"
                type="date"
                value={userData.birthdate}
                onChange={handleInput}
                onBlur={handleBlur}
              />
            </label>
            {touched.birthdate && errors.birthdate && (
              <span>{errors.birthdate}</span>
            )}
          </div>

          <div>
            <label>
              DNI{" "}
              <input
                name="nDni"
                type="number"
                value={userData.nDni}
                onChange={handleInput}
                onBlur={handleBlur}
              />
            </label>
            {touched.nDni && errors.nDni && <span>{errors.nDni}</span>}
          </div>

          <div>
            <label>
              Usuario{" "}
              <input
                name="username"
                type="text"
                value={userData.username}
                onChange={handleInput}
                onBlur={handleBlur}
              />
            </label>
            {touched.username && errors.username && (
              <span>{errors.username}</span>
            )}
          </div>

          <div>
            <label>
              Contraseña{" "}
              <input
                name="password"
                type="password"
                value={userData.password}
                onChange={handleInput}
                onBlur={handleBlur}
              />
            </label>
            {touched.password && errors.password && (
              <span>{errors.password}</span>
            )}
          </div>

          <div>
            <label>
              Repetir contraseña{" "}
              <input
                name="repeatPassword"
                type="password"
                value={userData.repeatPassword}
                onChange={handleInput}
                onBlur={handleBlur}
              />
            </label>
            {touched.repeatPassword && errors.repeatPassword && (
              <span>{errors.repeatPassword}</span>
            )}
          </div>

          <button type="submit">Enviar</button>
        </form>
        <p>
          ¿Ya estas registrado? Ingresa <Link to={SLASH}>Aquí</Link>
        </p>
      </Container>
    </>
  );
};

export default Register;
