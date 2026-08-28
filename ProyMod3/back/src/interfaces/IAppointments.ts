import { StatusEnum } from "../enums/StatusEnum";

interface IAppointments {
  id: number;
  date: Date;
  time: string;
  userId: number;
  status: StatusEnum;
}

export default IAppointments;
