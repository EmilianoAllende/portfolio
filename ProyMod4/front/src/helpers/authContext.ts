import { createContext } from "react";
import { AuthContextProps } from "@/interfaces/AuthContextProps";

export const AuthContext = createContext<AuthContextProps>({
    user: null,
    setUser: () => {},
    login: () => {},
    logout: () => {},
    orders: [],
    setOrders: () => {},
    token: null,
    addOrder: () => {},
});