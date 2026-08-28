"use client";

import { useRouter } from "next/navigation";
import { useContext } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { AuthContext } from "@/helpers/authContext";
import { useAuthForm } from "@/hooks/useAuthForm";
import { validateLoginForm } from "@/helpers/validateLoginForm";
import Link from "next/link";

const LoginForm = () => {
    const { login } = useContext(AuthContext);
    const router = useRouter();

    const {
        data,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleValidation,
        isFormValid,
    } = useAuthForm({
        initialValues: {
        email: "",
        password: "",
        },
        validate: validateLoginForm,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors = handleValidation();

        if (Object.values(validationErrors).some(error => error !== "")) return;
        if (!isFormValid) return;

        try {
            await login(data)

            Swal.fire({
                icon: "success",
                title: "Welcome!",
                text: "You've successfully logged in.",
            });

            router.push("/home");
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                Swal.fire({
                icon: "error",
                title: "Oops...",
                text: error.response?.data?.message || "An unexpected error occurred.",
                });
            } else {
                console.error("Unexpected error:", error);
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Something went wrong. Please try again.",
                });
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm mx-auto">
            <div>
                <label htmlFor="email" className="block mb-1 bg-primaryColor rounded-md p-1 font-semibold text-quaternaryColor w-fit px-10 mx-auto">Email</label>
                <input
                type="email"
                id="email"
                name="email"
                value={data.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full border px-3 py-2 mt-1 bg-primaryColor text-tertiaryColor text-sm rounded-lg p-3"
                />
                {touched.email && errors.email && (
                <p className="text-red-500 text-sm mt-2 text-center font-semibold">{errors.email}</p>
                )}
            </div>

            <div>
                <label htmlFor="password" className="block mb-1 bg-primaryColor rounded-md p-1 font-semibold text-quaternaryColor w-fit px-6 mx-auto">Password</label>
                <input
                type="password"
                id="password"
                name="password"
                value={data.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full border px-3 py-2 mt-1 bg-primaryColor text-tertiaryColor text-sm rounded-lg p-3"
                />
                {touched.password && errors.password && (
                <p className="text-red-500 text-sm mt-2 text-center font-semibold">{errors.password}</p>
                )}
            </div>

            <button
                type="submit"
                className="bg-green-300 text-primaryColor rounded-full py-2 px-6 w-fit font-semibold mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isFormValid}
            >
                LOGIN
            </button>

            <div className="flex">
                <div className="bg-tertiaryColor my-auto rounded-lg py-2 px-4 font-semibold text-primaryColor">
                    <p>If you are no&apos;t registered yet ➜</p>
                </div>

                <Link href="/auth/register">
                    <button
                        type="submit"
                        className="bg-secondaryColor rounded-full py-2 px-4 text-tertiaryColor"
                    >
                        REGISTER
                    </button>
                </Link>
            </div>

        </form>
    );
};

export default LoginForm;
