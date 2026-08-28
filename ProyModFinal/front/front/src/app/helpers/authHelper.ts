import { IAuthMeUser } from "@/interfaces";

// Verifica si el usuario es un empleado
export const isEmployee = (user: IAuthMeUser | null): boolean => {
  return (user?.roles?.length ?? 0) > 0;
};

// Verifica si el usuario es un cliente
export const isClient = (user: IAuthMeUser | null): boolean => {
  return (user?.roles?.length ?? 0) === 0;
};

// Verifica si el empleado tiene un rol específico
export const hasRole = (
  user: IAuthMeUser | null,
  roleName: string
): boolean => {
  return user?.roles?.includes(roleName.toUpperCase()) ?? false;
};

// Roles específicos para comodidad
export const isSuperAdmin = (user: IAuthMeUser | null): boolean =>
  hasRole(user, "SUPERADMIN");

export const isAdmin = (user: IAuthMeUser | null): boolean =>
  hasRole(user, "ADMIN");

export const isCashier = (user: IAuthMeUser | null): boolean =>
  hasRole(user, "CASHIER");
