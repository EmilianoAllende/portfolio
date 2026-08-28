"use client";

import Link from "next/link";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/helpers/authContext";
import Logo from "@/utils/techhome-logo.png";
import HomeIcon from "@/utils/home-house-ui-svgrepo-com.svg";
import CartIcon from "@/utils/shopping-cart-with-product-inside-svgrepo-com.svg";
import CartStatus from "../CartStatus";
import { getProducts } from "@/services/getProducts";
import { IProduct } from "@/interfaces/Product";
import SearchBar from "../SearchBar";
import { UserWidget } from "./UserWidget/UserWidget";
import userIcon from '@/utils/user-application-identity-authentication-login-svgrepo-com.svg'

export default function Navbar() {
    const { user } = useContext(AuthContext);
    const [products, setProducts] = useState<IProduct[]>([]);

    useEffect(() => {
        const fetchProducts = async () => {
        try {
            const allProducts = await getProducts();
            setProducts(allProducts);
        } catch (error) {
            console.error("Error loading products", error);
        }
        };
        fetchProducts();
    }, []);

    return (
        <nav className="w-screen flex-col">
            <div className="w-11/12">
                <div className="md:flex flex-row lg:w-11/12 items-center mx-auto">
                    <Image src={Logo} alt="tech-home-logo.png" width={50} className="w-16 m-1" />
                    <div className="text-justify my-auto font-black">
                        <h1>Tech<br />Home</h1>
                    </div>

                    <div className="ml-7">
                        <Link href="/home">
                            <Image src={HomeIcon} width={50} height={50} alt="home-icon" />
                        </Link>
                    </div>

                    <div className="ml-7">
                        <Link href="/products">
                            <h3 className="font-black bg-primaryColor text-quaternaryColor rounded-full px-2">PRODUCTS</h3>
                        </Link>
                    </div>

                    {/* SearchBar */}
                    <div className="ml-5 w-auto">
                        <SearchBar products={products} />
                    </div>

                    <div className=" ml-3">
                        <CartStatus  />
                        <Link href="/cart" className="-z-50">
                            <Image src={CartIcon} width={40} height={40} alt="cart-icon" />
                        </Link>
                    </div>

                    <div className="flex mx-auto space-x-4">
                            <Link href="/about" className="m-auto">
                                <h3 className="font-black bg-primaryColor text-quaternaryColor rounded-full px-2">ABOUT</h3>
                            </Link>

                        {user && (
                            <Link href="/favorites" className="text-primaryColor hover:underline m-auto">
                                <h3 className="font-black bg-primaryColor text-quaternaryColor rounded-full px-2">FAVORITES</h3>
                            </Link>
                        )}
                    </div>


                    <div className="flex">
                        {user && (
                            <Link href="/dashboard"  className="mr-2">
                                <Image src={userIcon} alt="userIcon" />
                            </Link>
                        )}

                        <UserWidget />
                    </div>
                </div>
            </div>
        </nav>
    );
};