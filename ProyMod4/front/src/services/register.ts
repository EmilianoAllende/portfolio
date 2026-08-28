import axios from "axios";
import { RegisterData } from "@/interfaces/RegisterData";

export default async function register(registerForm: RegisterData) {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/register`, registerForm);
    return response.data;

};
