import { MYAPPPOINTMENTS, SLASH } from "../../utils/routes";
import { Container, ButtonContainer } from "./styled";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const scheduleAppointmentButton = () => {
    navigate("/nuevo-turno");
  };

  const aboutUsButton = () => {
    if (pathname === "/sobre-nosotros") {
      navigate(MYAPPPOINTMENTS);
    } else {
      navigate("/sobre-nosotros");
    }
  };

  const goBackToAppointments = () => {
    navigate(MYAPPPOINTMENTS);
  };

  const logout = () => {
    localStorage.removeItem("idUser");
    navigate(SLASH);
  };

  return (
    <Container>
      <img src="src\assets\EliteHealt_rightText.png" alt="elite_healt_img" />
      <h2>Elite Healt</h2>
      <ButtonContainer>
        {pathname === MYAPPPOINTMENTS && (
          <>
            <button onClick={scheduleAppointmentButton}>Agendar turno</button>
          </>
        )}

        {pathname === "/nuevo-turno" && (
          <button onClick={goBackToAppointments}>Volver a Mis Turnos</button>
        )}

        <button onClick={aboutUsButton}>
          {pathname === "/sobre-nosotros" ? "Mis Turnos" : "Sobre Nosotros"}
        </button>
        <button onClick={logout}>Salir</button>
      </ButtonContainer>
    </Container>
  );
};

export default Navbar;