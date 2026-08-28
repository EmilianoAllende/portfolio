'use client';

import { ButtonPrimary } from '@/components/UI/Buttons/Buttons';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';

const SubscriptionButton = () => {
    const router = useRouter();
    const roles = useAuthStore((s) => s.user?.roles || []);

    const hasRole = (role: string) => roles.includes(role.toUpperCase());

    const handleClick = () => {
        if (hasRole('CLIENT')) {
            router.push('/user/client-subscription');
        } else if (hasRole('EMPLOYEE')) {
            router.push('/user/company-subscription');
        } else {
            console.warn('El usuario no tiene un rol válido para suscripción.');
        }
    };

    return (
        <ButtonPrimary textContent='Suscribirme' onClick={handleClick} className="w-full sm:w-auto" />
    );
};

export default SubscriptionButton;