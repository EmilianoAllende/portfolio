import { User } from "./User";
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({
  name: "credentials",
})
export class Credential {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @OneToOne(() => User, (user) => user.credential)
  user: User;
}
