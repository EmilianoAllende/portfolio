import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useGetUserByIdQuery } from '../../redux/features/users/usersApi';
import Appointment from '../Appointment/Appointment';
import { Container } from './styled';
import NoAppointments from '../NoAppointments/NoAppointments';
import { useCancelAppointmentMutation } from '../../redux/features/appointments/appointmentsApi';

const Appointments = () => {
  const [flag, setFlag] = useState(false);

  const idUser = useSelector((state) => state.usersSlice.user?.id);

  const {
    data: dataUser,
    isLoading: isLoadingUser,
    refetch: refetchUserApps,
  } = useGetUserByIdQuery(idUser);

  const [cancelAppointmentMutation] = useCancelAppointmentMutation();

  const handleCancel = async (id) => {
    await cancelAppointmentMutation(id);
    await refetchUserApps();
  };

  return (
    <Container>
      {isLoadingUser ? (
        'Cargando turnos...'
      ) : (
        <>
      
          <h2>Bienvenido, {dataUser?.name}</h2>

          {dataUser?.appointments?.length === 0 ? (
            <NoAppointments />
          ) : (
            dataUser?.appointments?.map((app) => (
              <Appointment
                key={app.id}
                id={app.id}
                name={app.user?.name}
                date={app.date}
                time={app.time}
                status={app.status}
                handleCancel={() => handleCancel(app.id)}
              />
            ))
          )}
        </>
      )}
    </Container>
  );
};

export default Appointments;
