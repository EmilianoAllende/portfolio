"use client";
import React from "react";
import { useCartStore } from "@/stores/cartStore";

export const PaymentSelector = () => {
  const paymentMethod = useCartStore((state) => state.paymentMethod);
  const setPaymentMethod = useCartStore((state) => state.setPaymentMethod);

  return (
    <div className="mb-3">
      <label className="block mb-1 font-semibold">Método de pago:</label>
      <select
        value={paymentMethod}
        onChange={(e) =>
          setPaymentMethod(e.target.value as "Tarjeta" | "Efectivo")
        }
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="Tarjeta">Tarjeta</option>
        <option value="Efectivo">Efectivo</option>
      </select>
    </div>
  );
};
