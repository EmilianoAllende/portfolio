"use client";

import { IProduct } from "@/interfaces/Product";
import { useContext, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { CartContext } from "@/helpers/cartContext";

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<IProduct[]>([]);

    useEffect(() => {
        const savedItems = localStorage.getItem("cart");
        setItems(savedItems ? JSON.parse(savedItems) : []);
    }, []);

    const updateLocalStorage = (updatedCart: IProduct[]) => {
        setItems(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
    };

    const addItemToCart = (item: IProduct) => {
        if (items.some((prod) => prod.id === item.id)) {
            Swal.fire({
                title: "Error!",
                text: "Product already in cart.",
                icon: "error",
            });
            return;
        }
        updateLocalStorage([...items, item]);
    };

    const removeItemFromCart = (id: number) => {
        updateLocalStorage(items.filter((e) => e.id !== id));
    };

    const emptyCart = () => {
        setItems([]);
        localStorage.removeItem("cart");
    };

    const countItems = (id: number) => {
        return items.filter((e) => e.id === id).length;
    };

    return (
        <CartContext.Provider value={{ items, emptyCart, removeItemFromCart, addItemToCart, countItems }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);