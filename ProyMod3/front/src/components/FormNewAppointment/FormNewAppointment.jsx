import { useState } from "react";
import { useScheduleAppointmentMutation } from "../../redux/features/appointments/appointmentsApi";
import { useNavigate } from "react-router-dom";
import { MYAPPPOINTMENTS } from "../../utils/routes";
import { useSelector } from "react-redux";
import { useGetUserByIdQuery } from "../../redux/features/users/usersApi";
import "./FormNewAppointment.css"; 

const FormNewAppointment = () => {
  const navigate = useNavigate();
  const userId = useSelector((state) => state.usersSlice.user.id);
  const { refetch } = useGetUserByIdQuery(userId);

  const [newAppointment, setNewAppointment] = useState({
    userId: userId,
    date: "",
    time: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const [scheduleAppointment] = useScheduleAppointmentMutation();

  const handleInputChange = (e) => {
    setNewAppointment({
      ...newAppointment,
      [e.target.name]: e.target.value,
    });
  };

  const isWeekday = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDay();
    return day >= 1 && day <= 5;
  };

  const isWithinWorkingHours = (timeString) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours >= 9 && hours < 17;
  };

  const isFutureDate = (dateString) => {
    const selectedDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate > today;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFutureDate(newAppointment.date)) {
      alert("La fecha debe ser posterior a la fecha actual.");
      return;
    }

    if (!isWeekday(newAppointment.date)) {
      alert("Solo se pueden reservar turnos los días hábiles (lunes a viernes).");
      return;
    }

    if (!isWithinWorkingHours(newAppointment.time)) {
      alert("Solo se pueden reservar turnos entre las 9:00 y 17:00.");
      return;
    }

    setErrorMessage("");

    const result = await scheduleAppointment(newAppointment);
    if (result.error) {
      alert("Error al reservar el turno");
    } else {
      alert("Turno reservado con éxito");
      refetch();
      navigate(MYAPPPOINTMENTS);
    }
  };

  return (
    <div className="form-wrapper"> 
      <h2>Reservar nuevo turno</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-container">
          <label htmlFor="date">Fecha:</label>
          <input
            type="date"
            id="date"
            name="date"
            required
            onChange={handleInputChange}
          />
        </div>

        <div className="form-container">
          <label htmlFor="time">Hora:</label>
          <input
            type="time"
            id="time"
            name="time"
            required
            onChange={handleInputChange}
          />
        </div>

        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

        <button type="submit">Reservar turno</button>
      </form>
    </div>
  );
};

export default FormNewAppointment;
