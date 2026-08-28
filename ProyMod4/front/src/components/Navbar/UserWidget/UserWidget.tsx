"use client";

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

export const UserWidget = () => {
    const { user, logout } = useAuth();

    const { emptyCart } = useCart()
    return (
        user ? (
            <div className="flex flex-col">
                <button onClick={() => {
                    logout();
                    emptyCart();
                }} className='bg-red-700 rounded-full text-quaternaryColor px-2 text-center'>
                    LOG OUT
                </button>
            </div>
        ) : (
            <div className='flex flex-col'>
                <Link href={"/auth/login"} className='bg-blue-900 rounded-full text-quaternaryColor py-1 mb-2 text-center font'>LOG IN</Link>
                <Link href={"/auth/register"} className='bg-teal-900 rounded-full text-quaternaryColor p-1 text-center'>REGISTER</Link>
            </div>
        )
    );
};