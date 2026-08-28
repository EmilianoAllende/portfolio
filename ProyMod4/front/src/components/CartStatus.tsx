"use client";

import { useCart } from "@/contexts/CartContext";

export default function CartStatus() {
    const { items } = useCart();
    return <p className="z-50 bg-red-600 rounded-full text-center text-yellow-100">{items.length}</p>
};