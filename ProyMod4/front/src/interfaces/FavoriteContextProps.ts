import { IProduct } from "@/interfaces/Product";

export interface FavoriteContextProps {
    favorites: IProduct[];
    toggleFavorite: (product: IProduct) => void;
    isFavorite: (productId: number) => boolean;
};