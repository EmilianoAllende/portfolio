"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import catgoriesToPreload from "@/helpers/categories";

export default function CategoriesBar() {
    const [show, setShow] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            setShow(true);
        } else {
            setShow(false);
        }

        setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    return (
        <div
        className={`hidden md:flex fixed top-8 left-0 w-full justify-center items-center bg-orange-200 shadow-md py-2 transition-transform duration-300 ${
            show ? "translate-y-0" : "translate-y-full"
        }`}
        >
        <p className="font-black text-xl mr-4">C A T E G O R I E S :</p>
        <div className="flex flex-row gap-3 font-bold text-lg text-center">
            {catgoriesToPreload.map(category => (
            <Link key={category.id} href={`/categories/${category.id}`} className="hover:underline">
                {category.name}
            </Link>
            ))}
        </div>
        </div>
    );
};
