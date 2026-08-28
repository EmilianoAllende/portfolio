import { Request, Response } from "express";
import {
  cancelAppointmentService,
  getAllAppointmentsService,
  getAppointmentsByIdService,
  scheduleNewAppointmentService,
} from "../services/appointments-service";


const getAllAppointments = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const allApps = await getAllAppointmentsService();
    if (!allApps.length)
      return res.status(404).json({ error: "No hay turnos para mostrar" });
    return res.status(200).json(allApps);
  } catch (error) {
    return res.status(500).json(error);
  }
};


const getAppointmentsById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const appById = await getAppointmentsByIdService(+id);

    if (!appById)
      return res.status(404).json({ error: "No existe turno con ese ID" });
    return res.status(200).json(appById);
  } catch (error) {
    return res.status(500).json(error);
  }
};


const scheduleNewAppointments = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { date, time, userId } = req.body;


    if (!date || !time || !userId)
      return res.status(400).json({ error: "Datos incompletos" });

    const newAppointment = await scheduleNewAppointmentService({
      date,
      time,
      userId,
    });

    return res
      .status(201)
      .json({ message: "Nuevo turno creado con éxito", newAppointment });
  } catch (error) {
    return res.status(500).json(error);
  }
};


const cancelAppointments = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const response = await cancelAppointmentService(+id);
    if (!response) return res.status(404).json({ error: "Turno inexistente" });
    return res.status(200).json({
      status: "success",
      message: "Turno cancelado",
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};

export {
  getAllAppointments,
  getAppointmentsById,
  scheduleNewAppointments,
  cancelAppointments,
};
