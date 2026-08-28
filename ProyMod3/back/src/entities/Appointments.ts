import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { StatusEnum } from "../enums/StatusEnum";
import { User } from "./User";

@Entity({
  name: "appointments",
})
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "date" })
  date: Date;

  @Column()
  time: string;

  @Column({
    type: "enum",
    enum: StatusEnum,
    default: StatusEnum.ACTIVE,
  })
  status: StatusEnum;

  @ManyToOne(() => User, (user) => user.appointments)
  user: User;
}
