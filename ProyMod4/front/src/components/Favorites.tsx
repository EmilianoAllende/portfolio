"use client";

import { useFavorites } from "@/contexts/FavoritesContext";
import Card from "@/components/Card/Card";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export const Favorites = () => {
    const { favorites } = useFavorites();
    const { user } = useAuth();
    const router = useRouter();

    if(!user) {
        router.push("/home");
    };

    if (favorites.length === 0) {
        return (
            <div className="bg-primaryColor mt-10 py-4 px-2 w-fit justify-self-center rounded">
                <p className="text-center text-xl bg-tertiaryColor text-primaryColor font-semibold rounded-lg px-2">You have no favorite products yet.</p>
            </div>

        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 mt-7">
            {favorites.map(product => (
                <Card key={product.id} product={product} />
            ))}
        </div>
    );
};