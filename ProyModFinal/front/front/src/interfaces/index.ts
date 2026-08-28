export interface IProduct {
  id: string;
  name: string;
  image: string;
  price: number;
}

export interface ICard {
  id?: string;
  name: string;
  image: string;
  slug: string; //CORROBORAR QUE BACK LO TRAIGA
}

export interface ICardProduct extends ICard {
  sale_price: number;
  stock?: number;
  id?: string;
}

export interface ApiProduct {
  slug: string; //CORROBORAR QUE BACK LO TRAIGA
  id: string;
  name: string;
  sale_price: number;
  image?: string | null;
  variants?: {
    image: string[];
    color: string;
    descripcion: string;
    variants2: {
      talle: string;
      stock: number | string;
    }[];
  }[];
}

interface IBrand {
  id: string;
  name: string;
  image: string;
  brandKey?: string;
  subcategories?: string[];
}

export type { IBrand };

export interface IRole {
  id: string;
  name: string;
  description: string;
}

export interface IUser {
  id: string;
  email: string;
  type: "employee" | "client";
  first_name?: string;
  last_name?: string;
  image?: string;

  employee?: {
    roles: string[];
  };
  client?: {
    is_premium: boolean;
    membership_id: string | null;
  };
}

export interface IAuthMeUser {
  userId: string;
  email: string;
  name: string;
  roles: string[];
}

export interface IEmployee {
  userId: string;
  email: string;
  name: string;
  roles: string[];
}


export interface ILogin {
  email: string;
  password: string;
}

export interface IRegister {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface IRegisterEmployee {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  roles: string[];
}

type RecordSearchParams = { [key: string]: string | string[] | undefined };
export type Params = Promise<{ slug: string }>;
export type SearchParams = Promise<RecordSearchParams>;
