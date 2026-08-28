import { IProduct } from "@/interfaces/Product";

const apiUrl = process.env.NEXT_PUBLIC_API_URL
    // || "http://localhost:3001";

export const postOrders = async (userId: number, token: string, cart: IProduct[]) => {
    const data = { userId, products: cart?.map((item) => item.id) };

    const res = await fetch(`${apiUrl}/orders`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            'Content-Type': "application/json",
            'Authorization': token,
        },
    });
    return await res.json();
};