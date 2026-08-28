import { DataSource } from "typeorm";
import { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DB } from "./envs";
import { User } from "../entities/User";
import { Appointment } from "../entities/Appointments";
import { Credential } from "../entities/Credential";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: DB_HOST,
  port: Number(DB_PORT),
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_DB,
  synchronize: false,
  logging: false,
  entities: [User, Appointment, Credential],
  subscribers: [],
  migrations: [],
});

export const initializeDataSource = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Conexión con la DB establecida correctamente");
  } catch (error) {
    console.error("Error de conexión con la DB", error);
  }
};
