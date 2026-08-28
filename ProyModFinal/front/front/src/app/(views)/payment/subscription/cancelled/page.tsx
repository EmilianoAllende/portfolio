'use client';

import { useRouter } from 'next/navigation';
import { XCircle } from 'lucide-react';
import { routes } from '@/app/routes';
import { ButtonPrimary } from '@/components/UI/Buttons/Buttons';
// import { useEffect } from 'react';
// import { useAuthStore } from '@/stores/authStore';

export default function PaymentCancelledPage() {
    const router = useRouter();
    // const user = useAuthStore((state) => state.user);

    // useEffect(() => {
    //     if (!user) {
    //     router.push(routes.user.profile);
    //     }
    // }, [user, router]);

    // if (!user) return null;

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center space-y-6">
                <XCircle className="h-16 w-16 text-red-600 mx-auto" />
                <h1 className="text-3xl font-bold text-gray-800">Pago cancelado</h1>
                <p className="text-gray-600">Tu suscripción no se completó. Por favor intenta nuevamente.</p>
                <ButtonPrimary
                onClick={() => router.push(routes.client.subscription)}
                className="mt-4 bg-neutral-600 text-white px-6 py-2 rounded-2xl hover:bg-neutral-700 transition-all"
                textContent='Volver a planes'
                />
            </div>
        </div>
    );
};