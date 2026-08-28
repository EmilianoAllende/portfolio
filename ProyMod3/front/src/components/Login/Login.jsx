import { useState } from "react";
import { Container, FormGroup, Input, Button, ErrorMessage } from "./styled";
import { Link, useNavigate } from "react-router-dom";
import { MYAPPPOINTMENTS, REGISTER } from "../../utils/routes";
import { useLoginUserMutation } from "../../redux/features/users/usersApi";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../redux/features/users/usersSlice";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loginUserMutation, { isLoading, isError }] = useLoginUserMutation();

  const [user, setUser] = useState({
    username: "",
    password: "",
  });

  const handleInput = (e) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value,
    });
  };

  const submitLogin = async (e) => {
    try {
      e.preventDefault();
      const userData = await loginUserMutation(user);

      dispatch(setCredentials(userData.data));
      navigate(MYAPPPOINTMENTS);
    } catch (error) {
      console.log(error);
      alert(error.message || "Error al iniciar sesión");
    }
  };

  return (
    <Container>
      <form onSubmit={submitLogin}>
        <FormGroup>
          <h2>Ingresa</h2>
          <label>
            Usuario
            <Input
              name="username"
              type="text"
              value={user.username}
              onChange={handleInput}
            />
          </label>
        </FormGroup>

        <FormGroup>
          <label>
            Contraseña
            <Input
              name="password"
              type="password"
              value={user.password}
              onChange={handleInput}
            />
          </label>
        </FormGroup>

        <FormGroup>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Ingresando..." : "Iniciar sesión"}
          </Button>

          {isError && <ErrorMessage>Error: {isError}</ErrorMessage>}
        </FormGroup>
      </form>
      <p>
        ¿Sos nuevo? Bienvenido, regístrate <Link to={REGISTER}>aquí</Link>
      </p>
    </Container>
  );
};

export default Login;
