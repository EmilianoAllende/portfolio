"use client";

import { ShoppingCart, Minus, Plus, Trash2 } from "lucide-react";
import { useState, useRef } from "react";
import { useCartStore } from "@/stores/cartStore";
import { getTotalAmount } from "@/lib/getTotalAmount";
import { CheckoutHandler } from "./Checkout/CheckoutHandler";
import { PaymentSelector } from "./Checkout/PaymentSelector";
import { useOutsideClick } from "@/hooks/useOutsideClick"; // Hook para cerrar al hacer clic afuera

export const CartDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const items = useCartStore((state) => state.items);
  const increaseItem = useCartStore((state) => state.increaseItem);
  const decreaseItem = useCartStore((state) => state.decreaseItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const total = getTotalAmount(items);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  // Usamos una referencia para detectar clics fuera del dropdown y cerrarlo
  const dropdownRef = useRef<HTMLDivElement>(null);
  useOutsideClick(dropdownRef, () => setIsOpen(false));

  const handleCheckoutSuccess = () => {
    clearCart();
    setIsOpen(false);
  };


  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-white p-2 rounded-md hover:bg-[#6e5cc4] transition-colors cursor-pointer"
      >
        <ShoppingCart className="w-6 h-6" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute top-full right-0 mt-3 w-80 max-w-sm bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-sm z-50 transition-all duration-200 ease-in-out"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-800">Carrito</h3>
            <span className="text-xs text-gray-400">{totalItems} ítems</span>
          </div>
          {items.length === 0 ? (
            <p className="text-gray-500 py-4 text-center">Tu carrito está vacío.</p>
          ) : (
            <>
              <ul className="max-h-60 overflow-y-auto divide-y divide-gray-100">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="py-3 flex justify-between items-start"
                  >
                    <div className="flex flex-col w-3/4">
                      <span className="font-medium text-gray-800">{item.name}</span>
                      <span className="text-xs text-gray-500">
                        x{item.quantity} · ${item.price.toFixed(2)} c/u
                      </span>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => decreaseItem(item.id)}
                          className="p-1 border rounded hover:bg-gray-100"
                        >
                          <Minus size={14} className="cursor-pointer text-gray-600" />
                        </button>
                        <button
                          onClick={() => increaseItem(item.id)}
                          className="p-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                          disabled={
                            item.stock !== undefined &&
                            item.quantity >= item.stock
                          }
                        >
                          <Plus size={14} className="cursor-pointer text-gray-600" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="font-bold whitespace-nowrap text-gray-800">
                        ${(item.quantity * item.price).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-100 pt-3 mt-3">
                <div className="flex justify-between font-semibold text-gray-800 mb-3">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <PaymentSelector />
                <CheckoutHandler onSuccess={handleCheckoutSuccess} />

              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};