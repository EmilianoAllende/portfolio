import { IProduct } from "@/interfaces/Product";
import { notFound } from "next/navigation";
import swal from "sweetalert";
import axios from "axios";

const apiUrl = process.env.NEXT_PUBLIC_API_URL
    // || "http://localhost:3001";

export const getProducts = async (): Promise<IProduct[]> => {
    try {
        const fetch = await axios.get(apiUrl + "/products")
        // Error común, olvidarse del [data].
        return fetch.data;
    } catch (error) {
        swal({
            title:'Error',
            text:`Error obtaining the Products: ${error}.`,
            icon: 'error',
        })
    }
    return [];
};

export const getFeaturedProducts = async (): Promise<IProduct[]> => {
    const res = await getProducts();
    const featured = res.slice(0, 3);
    return featured;
};

export const getProductById = async (id: number): Promise<IProduct> => {
    const res = await getProducts();
    const product = res.filter((product) => product.id === id)[0];
    if(!product) {notFound()}
    return product;
};

export const getProductByCategoryId = async (categoryId: number) => {
    try {
        const products: IProduct[] = await getProducts();
        const productsFiltered: IProduct[] = products.filter((product) => product.categoryId === categoryId);
        return productsFiltered
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new Error(error.message);
        } else {
            throw new Error("Unknown error occurred while filtering products by category.");
        }
    };
};