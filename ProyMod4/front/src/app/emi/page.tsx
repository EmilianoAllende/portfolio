"use client"

import { AuthContext } from '@/helpers/authContext';
import { useRouter } from 'next/navigation';
import React, { useContext, useEffect } from 'react'

export default function Emi() {
    const { user } = useContext(AuthContext);
    const router = useRouter();
    useEffect(
        () => {
            if (!user) {
                router.push("/home");
            }
        }, [user, router]
    )
    return (
        <div className='text-red-100 font-semibold text-lg bg-blue-950 place-self-center'>
            HOLA
        </div>
    )
};