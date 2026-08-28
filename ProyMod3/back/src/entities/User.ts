import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Credential } from "./Credential";
import { Appointment } from "./Appointments";

@Entity({
  name: "Users",
})
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ type: "date" })
  birthdate: Date;

  @Column()
  nDni: number;

  @OneToOne(() => Credential, (cred) => cred.user, {
    cascade: true,
    onDelete: "CASCADE",
  })
  @JoinColumn()
  credential: Credential;

  @OneToMany(() => Appointment, (app) => app.user)
  appointments: Appointment[];
}
