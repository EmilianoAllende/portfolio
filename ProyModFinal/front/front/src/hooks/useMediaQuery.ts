'use client';

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        // Es importante asegurarse de que window esté disponible (solo se ejecuta en el cliente)
        const media = window.matchMedia(query);
        
        // Función para actualizar el estado si el resultado de la media query cambia
        const listener = () => {
        setMatches(media.matches);
        };

        // Llama al listener una vez al inicio para establecer el estado inicial
        listener();

        // Añade el listener para cambios futuros (ej. si el usuario redimensiona la ventana)
        media.addEventListener('change', listener);

        // Función de limpieza para remover el listener cuando el componente se desmonte
        return () => media.removeEventListener('change', listener);
    }, [query]); // El efecto se vuelve a ejecutar solo si la query cambia

    return matches;
};