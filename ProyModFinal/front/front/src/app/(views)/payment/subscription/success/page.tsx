'use client';

import { routes } from '@/app/routes';
import { CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
// import { useEffect } from 'react';
// import { useAuthStore } from '@/stores/authStore';

export default function PaymentSuccessPage() {
    const router = useRouter();
    // const user = useAuthStore((state) => state.user);
    // useEffect(() => {
    //     if (!user) {
    //         console.log("usuario de pago exitoso: ", );
    //             router.push(routes.user.profile);
    //     }
    // }, [user, router]);

    // if (!user) return null;


    // useEffect(() => {
    //     if (!user) {
    //             router.push(routes.public.login);
    //     }
    // }, [user, router]);

    // if (!user) return null;

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center space-y-6">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
                <h1 className="text-3xl font-bold text-gray-800">¡Pago exitoso!</h1>
                <p className="text-gray-600">Tu suscripción ha sido activada correctamente. 🎉</p>
                <button
                onClick={() => router.push(routes.client.profileClient)}
                className="mt-4 bg-primary text-white px-6 py-2 rounded-2xl hover:bg-primary/90 transition-all"
                >
                    Ir al Dashboard
                </button>
            </div>
        </div>
    );
};