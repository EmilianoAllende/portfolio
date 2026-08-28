import { createUserCredentialsService } from "./credentials-service";
import { ICreateUserDTO } from "../dto/createUserDTO";
import { User } from "../entities/User";
import { AppDataSource } from "../config/data.source";
import { Credential } from "../entities/Credential";

const UserEntity = AppDataSource.getRepository(User);
const CredentialsEntity = AppDataSource.getRepository(Credential);

const getAllUsersService = async (): Promise<User[]> => {
  const allUser: User[] = await UserEntity.find({
    relations: { credential: true, appointments: true },
  });
  return allUser;
};

const getUsersByIdService = async (id: number): Promise<User | null> => {
  return await UserEntity.findOne({
    where: { id },
    relations: { credential: true, appointments: true },
  });
};

const createUserService = async (userData: ICreateUserDTO): Promise<User> => {
  const { username, password, name, email, birthdate, nDni } = userData;

  const newCredentials = await createUserCredentialsService({
    username,
    password,
  });

  const newUser: User = UserEntity.create({
    name,
    email,
    birthdate,
    nDni,
    credential: newCredentials,
  });

  newCredentials.user = newUser;
  await UserEntity.save(newUser);
  await CredentialsEntity.save(newCredentials);
  return newUser;
};

const getUserByIdNoAppointments = async (id: number): Promise<User | null> => {
  return await UserEntity.findOne({
    where: { id },
  });
};

export {
  getAllUsersService,
  getUsersByIdService,
  createUserService,
  getUserByIdNoAppointments,
};
