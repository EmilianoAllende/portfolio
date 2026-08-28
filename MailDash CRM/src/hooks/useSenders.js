import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/apiClient';

export const useSenders = () => {
    const [senders, setSenders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadSenders = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await apiClient.getSenders();
            // Filtramos solo los activos
            const activeSenders = data.filter(s => s.is_active !== false);
            setSenders(activeSenders);
        } catch (err) {
            console.error('Error cargando remitentes:', err);
            setError(err);
            setSenders([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSenders();
    }, [loadSenders]);

    return {
        senders,
        isLoading,
        error,
        reload: loadSenders
    };
};
