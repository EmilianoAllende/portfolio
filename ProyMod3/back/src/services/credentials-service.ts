import ICredentialsUserDTO from "../dto/credentialsUsersDTO";
import ICredential from "../interfaces/ICredential";
import { AppDataSource } from "../config/data.source";
import { Credential } from "../entities/Credential";

const CredentialsEntity = AppDataSource.getRepository(Credential);

const createUserCredentialsService = async (
  creds: ICredentialsUserDTO
): Promise<Credential> => {
  const { username, password } = creds;

  const newCreds: Credential = CredentialsEntity.create({
    username,
    password,
  });

  await CredentialsEntity.save(newCreds);
  return newCreds;
};

const checkCredentials = async (
  creds: ICredentialsUserDTO
): Promise<number> => {
  const { username, password } = creds;

  const foundCrendential: Credential | null = await CredentialsEntity.findOne({
    where: { username },
    relations: { user: true },
  });

  if (foundCrendential?.password === password) return foundCrendential.user.id;
  return 0;
};
export { createUserCredentialsService, checkCredentials };
