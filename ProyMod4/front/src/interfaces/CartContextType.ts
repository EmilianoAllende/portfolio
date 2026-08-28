import { IProduct } from "./Product";

export interface ICartContextType {
    items: IProduct[],
    addItemToCart: (items: IProduct) => void,
    removeItemFromCart: (id: number) => void,
    emptyCart: () => void,
    countItems: (id: number) => number,
};