"use client"

import { useState } from 'react';
import Link from 'next/link';

export default function EditListsMenu() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen((prev) => !prev);
    };

    return (
        <div className="relative inline-block text-left">
            <button
                onClick={toggleMenu}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
            >
                Editar Listas
            </button>

            {isOpen && (
                <div className="absolute mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-10">
                    <Link
                        href="/dashboard/categories"
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >
                        Categorías
                    </Link>

                    <Link
                        href="/dashboard/subcategories"
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >
                        Subcategorías
                    </Link>

                    <Link
                        href="/dashboard/products"
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >
                        Productos
                    </Link>
                </div>
            )}
        </div>
    );
};