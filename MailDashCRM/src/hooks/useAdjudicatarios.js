import { useState, useCallback } from "react";
import { adjudicatariosAPI } from "../api/adjudicatariosClient";

/**
 * Hook independiente para gestionar el estado del módulo de Adjudicatarios.
 * Sigue los patrones de MailDash CRM (Manejo de estados, normalización n8n y notificaciones).
 */
export const useAdjudicatarios = (isAuthenticated, setNotification) => {
    const [adjudicaciones, setAdjudicaciones] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isReprocessing, setIsReprocessing] = useState(false);
    const [error, setError] = useState(null);
    const [useTest, setUseTest] = useState(false);

    const fetchAdjudicaciones = useCallback(async (params = {}) => {
        if (!isAuthenticated) return;
        
        setIsLoading(true);
        setError(null);
        try {
            const response = await adjudicatariosAPI.getRecent(params, useTest);
            
            // Normalización total: n8n puede devolver [{json:{}}], [{}], o {} directamente
            const rawData = response.data;
            console.log("DEBUG Adjudicaciones - Raw:", rawData);
            
            let normalized = [];
            if (Array.isArray(rawData)) {
                normalized = rawData.map(item => item.json || item);
            } else if (rawData && typeof rawData === 'object') {
                normalized = [rawData.json || rawData];
            }

            // Mapeo de campos críticos para la vista
            const finalData = normalized.map(item => ({
                ...item,
                id: item.id || item.tender_id || item._id, // Asegurar un ID para la key
                fecha: item.fecha_captura || item.fecha || "-"
            }));
                
            setAdjudicaciones(finalData);
        } catch (err) {
            console.error("❌ Error en fetchAdjudicaciones:", err);
            const errorMessage = err.response?.data?.message || err.message || "Network Error";
            setError(errorMessage);
            if (setNotification) {
                setNotification({
                    type: "error",
                    title: "Error Adjudicatarios",
                    message: `No se pudieron sincronizar: ${errorMessage}`
                });
            }
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, setNotification, useTest]);

    const handleRetryExtraction = async (id) => {
        try {
            await adjudicatariosAPI.triggerExtraction(id);
            if (setNotification) {
                setNotification({
                    type: "success",
                    message: "Extracción disparada. Se reflejará en unos segundos."
                });
            }
            fetchAdjudicaciones();
        } catch (err) {
            console.error("Error en reintento:", err);
        }
    };

    const handleUpdateContact = async (id, email) => {
        try {
            await adjudicatariosAPI.updateContact(id, email);
            setAdjudicaciones(prev => 
                prev.map(item => item.id === id ? { ...item, email, status: "FOUND_EMAIL" } : item)
            );
        } catch (err) {
            console.error("Error al actualizar contacto:", err);
        }
    };

    const handleReprocess = async (params = {}) => {
        setIsReprocessing(true);
        try {
            await adjudicatariosAPI.reprocessManual(params);
            if (setNotification) {
                setNotification({
                    type: "success",
                    title: "Reproceso Iniciado",
                    message: "n8n está procesando los contactos pendientes con los filtros actuales."
                });
            }
        } catch (err) {
            console.error("Error en reproceso manual:", err);
            // ... (error handling remains same)
            if (setNotification) {
                setNotification({
                    type: "error",
                    title: "Error de Reproceso",
                    message: "No se pudo iniciar el reproceso manual."
                });
            }
        } finally {
            setIsReprocessing(false);
        }
    };

    // Eliminamos el useEffect que autodisparaba la carga.
    // Ahora será la vista quien decida cuándo cargar inicialmente con los filtros correctos.

    return {
        adjudicaciones,
        isLoading,
        error,
        refresh: fetchAdjudicaciones,
        retryExtraction: handleRetryExtraction,
        updateContact: handleUpdateContact,
        reprocess: handleReprocess,
        isReprocessing,
        useTest,
        setUseTest
    };
};
