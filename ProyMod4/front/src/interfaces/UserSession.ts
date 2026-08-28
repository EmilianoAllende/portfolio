import { IProduct } from "./Product";

export interface UserSession {
    id: number;
    name: string;
    email: string;
    address: string;
    phone: string;
    role: string;
    credential: Credential;
    orders: Order[];
    token: string;
};

export interface Order {
    id: number;
    status: string;
    date: string;
    products: IProduct[];
};

interface Credential {
    id: number;
    password: string;
};