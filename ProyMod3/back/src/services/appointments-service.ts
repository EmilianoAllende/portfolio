import { AppDataSource } from "../config/data.source";
import { INewAppointmentDTO } from "../dto/NewAppointmentDTO";
import { Appointment } from "../entities/Appointments";
import { User } from "../entities/User";
import { StatusEnum } from "../enums/StatusEnum";

const AppointmentEntity = AppDataSource.getRepository(Appointment);

const getAllAppointmentsService = async (): Promise<Appointment[]> => {
  const allAppointmens = await AppointmentEntity.find({
    relations: { user: true },
  });
  return allAppointmens;
};

const getAppointmentsByIdService = async (
  id: number
): Promise<Appointment | null> => {
  const foundApp: Appointment | null = await AppointmentEntity.findOne({
    where: { id },
    relations: { user: true },
  });

  return foundApp;
};

const scheduleNewAppointmentService = async (
  appData: INewAppointmentDTO
): Promise<Appointment | null> => {
  const { date, time, userId } = appData;

  const foundUser = await AppDataSource.getRepository(User).findOneBy({
    id: userId,
  });

  if (foundUser) {
    const newAppointment: Appointment = await AppointmentEntity.create({
      date,
      time,
      user: foundUser,
    });

    AppointmentEntity.save(newAppointment);

    return newAppointment;
  }
  return null;
};

const cancelAppointmentService = async (id: number): Promise<boolean> => {
  const foundApp = await getAppointmentsByIdService(id);

  if (foundApp) {
    foundApp.status = StatusEnum.CANCELED;
    AppointmentEntity.save(foundApp);
    return true;
  }
  return false;
};

export {
  getAllAppointmentsService,
  getAppointmentsByIdService,
  scheduleNewAppointmentService,
  cancelAppointmentService,
};
