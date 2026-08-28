import { useEffect, useState } from 'react';
import api from '@/lib/axiosInstance';
import IMembershipType from '@/interfaces/membershipType';

export function useMembershipTypes() {
    const [types, setTypes] = useState<IMembershipType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMembershipTypes = async () => {
            try {
                const response = await api.get('/membership-types');
                setTypes(response.data);
            } catch (err) {
                console.error('Error al obtener tipos de membresía:', err);
                setError('No se pudieron cargar los tipos de membresía.');
            } finally {
                setLoading(false);
            }
        };

        fetchMembershipTypes();
    }, []);

    return { types, loading, error };
};