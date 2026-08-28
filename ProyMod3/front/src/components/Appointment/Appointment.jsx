import { Container } from "./styled";

const Appointment = ({ name, date, time, status, handleCancel }) => {
  return (
    <Container>
      <h3>{name}</h3>
      <p>{date}</p>
      <p>{time}</p>
      <p className={status === "active" ? "active" : "canceled"}>{status}</p>
      <button onClick={handleCancel}>Cancelar</button>
    </Container>
  );
};

export default Appointment;
