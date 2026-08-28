'use client';

import { useRouter } from 'next/navigation';
import { useAuthForm } from '@/hooks/useAuthForm';
import { validateRegisterForm } from '@/helpers/validateRegisterForm';
import Swal from 'sweetalert2';
import {  useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import eye from '@/utils/eye-svgrepo-com.svg'

type RegisterFormData = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
    address: string;
};

const initialValues: RegisterFormData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
};


export default function RegisterForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [type, setType ] = useState("password")

    const {
        data,
        setData,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleValidation,
        isFormValid,
    } = useAuthForm<RegisterFormData>({
        initialValues,
        validate: validateRegisterForm,
    });



    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const validationErrors = handleValidation();

        if (Object.values(validationErrors).some((error) => error !== '')) {
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message || 'Something went wrong');
            }

            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Account created. You can now login.',
            });

            setData(initialValues);
            router.push('/auth/login');
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: error.response?.data?.message || 'An unexpected error occurred.',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Something went wrong. Please try again.',
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="flex flex-col gap-4 w-full max-w-md mx-auto" onSubmit={handleSubmit}>
            <input
                type="text"
                name="name"
                placeholder="Name"
                value={data.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full border px-3 py-2 mt-1 bg-primaryColor text-tertiaryColor text-sm rounded-lg p-3"
            />
            {touched.name && errors.name && <p className="text-red-500">{errors.name}</p>}

            <input
                type="email"
                name="email"
                placeholder="Email"
                value={data.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full border px-3 py-2 mt-1 bg-primaryColor text-tertiaryColor text-sm rounded-lg p-3"
            />
            {touched.email && errors.email && <p className="text-red-500">{errors.email}</p>}

            <div className='flex'>
                <input
                type={type}
                name="password"
                placeholder="Password"
                value={data.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full border px-3 py-2 mt-1 bg-primaryColor text-tertiaryColor text-sm rounded-lg p-3"
            />
            <button onClick={(e) => { e.preventDefault()
                setType(type === "password" ? "text" : "password")}}>
                <Image src={eye} alt='eye' className='w-5'/>
            </button>
            </div>

            {touched.password && errors.password && <p className="text-red-500">{errors.password}</p>}

            <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={data.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full border px-3 py-2 mt-1 bg-primaryColor text-tertiaryColor text-sm rounded-lg p-3"
            />
            {touched.confirmPassword && errors.confirmPassword && (
                <p className="text-red-500">{errors.confirmPassword}</p>
            )}

            <input
                type="text"
                name="phone"
                placeholder="Phone"
                value={data.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full border px-3 py-2 mt-1 bg-primaryColor text-tertiaryColor text-sm rounded-lg p-3"
            />
            {touched.phone && errors.phone && <p className="text-red-500">{errors.phone}</p>}

            <input
                type="text"
                name="address"
                placeholder="Address"
                value={data.address}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full border px-3 py-2 mt-1 bg-primaryColor text-tertiaryColor text-sm rounded-lg p-3"
            />
            {touched.address && errors.address && (
                <p className="text-red-500">{errors.address}</p>
            )}

            <button
                type="submit"
                disabled={loading || !isFormValid}
                className="btn btn-primary disabled:opacity-50"
            >
                {loading ? 'Registering...' : 'Register'}
            </button>
        </form>
    );
};