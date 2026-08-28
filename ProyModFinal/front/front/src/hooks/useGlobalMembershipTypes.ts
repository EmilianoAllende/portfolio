import { useEffect, useState } from 'react';
import api from '@/lib/axiosInstance';
import IMembershipType from '@/interfaces/membershipType';

export function useGlobalMembershipTypes() {
    const [types, setTypes] = useState<IMembershipType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchGlobalMembershipTypes = async () => {
            try {
                const response = await api.get('/global-membership-types');
                setTypes(response.data);
            } catch (err) {
                console.error('Error al obtener tipos de membresía globales:', err);
                setError('No se pudieron cargar los tipos de membresía globales.');
            } finally {
                setLoading(false);
            }
        };

        fetchGlobalMembershipTypes();
    }, []);

    return { types, loading, error };
};