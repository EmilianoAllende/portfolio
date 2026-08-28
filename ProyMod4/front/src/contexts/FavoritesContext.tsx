"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { IProduct } from "@/interfaces/Product";
import Swal from "sweetalert2";
import { FavoriteContextProps } from "@/interfaces/FavoriteContextProps";

const FavoriteContext = createContext<FavoriteContextProps>({} as FavoriteContextProps);

export const FavoriteProvider = ({ children }: { children: React.ReactNode }) => {
    const [favorites, setFavorites] = useState<IProduct[]>([]);

    useEffect(() => {
        const storedFavorites = localStorage.getItem("favorites");
        if (storedFavorites) {
            setFavorites(JSON.parse(storedFavorites));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("favorites", JSON.stringify(favorites));
    }, [favorites]);

    const toggleFavorite = (product: IProduct) => {
        const isFav = favorites.find(p => p.id === product.id);
        if (isFav) {
            setFavorites(prev => prev.filter(p => p.id !== product.id));
        } else {
            setFavorites(prev => [...prev, product]);
            Swal.fire({
                title: "Added to favorites!",
                text: `${product.name} was added to your favorites.`,
                icon: "success",
                timer: 1200,
                showConfirmButton: false,
            });
        }
    };

    const isFavorite = (productId: number) => {
        return favorites.some(p => p.id === productId);
    };

    return (
        <FavoriteContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
        {children}
        </FavoriteContext.Provider>
    );
};

export const useFavorites = () => useContext(FavoriteContext);
