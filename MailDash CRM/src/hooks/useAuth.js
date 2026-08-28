// src/hooks/useAuth.js
import { useState, useCallback } from "react";

const sanitizeSessionUser = (rawUser) => {
    if (!rawUser || typeof rawUser !== "object") return null;

    const displayUser =
        rawUser.usuario ||
        rawUser.username ||
        rawUser.name ||
        rawUser.id ||
        null;

    return {
        ...rawUser,
        id: rawUser.id || displayUser,
        usuario: rawUser.usuario || displayUser,
    };
};

export const useAuth = () => {
    const [currentUser, setCurrentUser] = useState(() => {
        try {
            const item = sessionStorage.getItem("currentUser");

            if (!item || item === "undefined" || item === "null") {
                if (item) sessionStorage.removeItem("currentUser");
                return null;
            }

            const parsed = JSON.parse(item);
            return sanitizeSessionUser(parsed);
        } catch (e) {
            console.error("Error reading currentUser from sessionStorage:", e);
            sessionStorage.removeItem("currentUser");
            return null;
        }
    });

    // Inicializamos isAuthenticated basado en si existe un usuario válido
    const [isAuthenticated, setIsAuthenticated] = useState(() => !!currentUser);

    const handleLogout = useCallback(() => {
        sessionStorage.removeItem("currentUser");
        setCurrentUser(null);
        setIsAuthenticated(false);
    }, []);

    const handleLoginSuccess = useCallback((userData) => {
        const safeUser = sanitizeSessionUser(userData);

        sessionStorage.setItem("currentUser", JSON.stringify(safeUser));
        setCurrentUser(safeUser);
        setIsAuthenticated(true);
    }, []);

    return {
        currentUser,
        setCurrentUser,      
        isAuthenticated,
        setIsAuthenticated,  
        handleLoginSuccess,
        handleLogout,
    };
};
