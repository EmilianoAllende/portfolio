"use client";

import { useEffect, useState, useContext } from "react";
import { Order, UserSession } from "@/interfaces/UserSession";
import { LoginData } from "@/interfaces/LoginData";
import axios from "axios";
import { useCart } from "./CartContext";
import { AuthContext } from "@/helpers/authContext";
import Swal from "sweetalert2";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  const { emptyCart } = useCart();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      const fullUser = { ...JSON.parse(storedUser), token: storedToken };
      setUser(fullUser);
      setToken(storedToken);

    } else {
      setUser(null);
      setToken(null);
    }
  }, []);

  const fetchOrders = async (userId: number, token: string, setOrders: (orders: Order[]) => void) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/orders?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    if (user?.id && token) {
      fetchOrders(user.id, token, setOrders);
    }
  }, [user, token]);

  const login = async (form: LoginData) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/users/login`,
        form
      );
      setUser({ ...response.data.user, token: response.data.token });

      localStorage.setItem("user", JSON.stringify({ ...response.data.user, token: response.data.token }));
      localStorage.setItem("token", response.data.token);

    } catch (error) {
      if (error instanceof Error) {
        console.log("Este es el error del AuthContext", error.message);
      }
      else {
        console.log("Error desconocido en AuthContext", error);
      }
    }
    
  };

  const logout = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You will be logged out of your account.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    });

    if (result.isConfirmed) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      emptyCart();
      setUser(null);
      setToken(null);

      await Swal.fire({
        title: 'Logged out',
        text: 'You have been successfully logged out.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    }
  };


  const addOrder = () => {

    emptyCart();

    if (user?.id && token) {
      fetchOrders(user.id, token, setOrders);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        logout,
        orders,
        setOrders,
        login,
        token,
        addOrder,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);