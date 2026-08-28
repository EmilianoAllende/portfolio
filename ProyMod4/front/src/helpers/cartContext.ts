import { createContext } from "react";
import { ICartContextType } from "@/interfaces/CartContextType";


export const CartContext = createContext<ICartContextType>({
    items: [],
    addItemToCart: () => {},
    removeItemFromCart: () => {},
    emptyCart: () => {},
    countItems: () => 0,
});