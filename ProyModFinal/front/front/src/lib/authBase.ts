import { ILogin, IRegister,IRegisterEmployee, IAuthMeUser, IRole } from "@/interfaces";
import api from "@/lib/axiosInstance";

// AUTH/ME
export const getUserApi = async (): Promise<IAuthMeUser | null> => {
  try {
    const user = await api.get("/auth/me");

    
    return user.data;
  } catch (error) {
    console.error("Error al obtener usuario", error);
    return null;
  }
};

// CERRAR SESIÓN
export const logoutApi = async () => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    console.error("Error al cerrar sesión", error);
  }
};

// ROLES
export const getRolesApi = async (): Promise<IRole[]> => {
  try {
    const res = await api.get("/roles");
    return res.data;
  } catch (error) {
    console.error("Error al obtener los roles", error);
    throw new Error("No se pudieron cargar los roles.");
  }
};

// CLIENT
export const loginClientApi = async (values: ILogin) => {
  const res = await api.post("/auth/client/login", values);
  return res.data;
};

export const registerClientApi = async (values: IRegister) => {
  const res = await api.post("/auth/client/register", values);
  return res.data;
};

// EMPLOYEE
export const loginApi = async (values: ILogin) => {
  const res = await api.post("/auth/employee/login", values);
  return res.data;
};

export const registerApi = async (values: IRegisterEmployee) => {
  const res = await api.post("/auth/employee/register", values);
  return res.data;
};
