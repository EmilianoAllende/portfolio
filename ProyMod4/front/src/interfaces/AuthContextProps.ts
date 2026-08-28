import { Order, UserSession } from "@/interfaces/UserSession";
import { LoginData } from "./LoginData";

export interface AuthContextProps {
    user: UserSession | null;
    setUser: (user: UserSession | null) => void;
    login: (form: LoginData) => void;
    logout: () => void;
    orders: Order[];
    setOrders: (orders: Order[]) => void;
    addOrder?: (orderId: number) => void;
    token: string | null;
};