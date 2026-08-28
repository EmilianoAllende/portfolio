"use client";

import { useCart } from "@/contexts/CartContext";
import { IProduct } from "@/interfaces/Product";
import { useEffect, useState } from "react";

export default function AddProduct({ product }: { product: IProduct }) {
    const { addItemToCart, countItems } = useCart();
    const [disabled, setDisabled] = useState(false);

    useEffect(() => {
        setDisabled(countItems(product.id) >= product.stock);
    }, [product, countItems]);

    return <button onClick={() => addItemToCart(product)} disabled={disabled}>ADD TO CART</button>;
};