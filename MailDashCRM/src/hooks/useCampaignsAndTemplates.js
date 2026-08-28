import { useState, useCallback, useEffect } from "react";
import apiClient from "../api/apiClient";

export const useCampaignsAndTemplates = (setNotification, isAuthenticated) => {
    const [selectedCampaignId, setSelectedCampaignId] = useState(null);
    const [campaignTemplates, setCampaignTemplates] = useState([]);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);

    const fetchTemplates = useCallback(async () => {
        setIsLoadingTemplates(true);
        try {
            const response = await apiClient.getTemplates();

            if (Array.isArray(response.data)) {
                const mappedTemplates = response.data.map(template => {
                    let parsedBuilder = template.builder_config;
                    if (typeof parsedBuilder === 'string') {
                        try {
                            parsedBuilder = JSON.parse(parsedBuilder);
                        } catch (e) {
                            console.warn("Error al parsear builder_config:", e);
                            parsedBuilder = {};
                        }
                    }
                    parsedBuilder = parsedBuilder || {
                        campaignType: '', instructions: '',
                        examplesGood: '', examplesBad: '', useMetadata: true
                    };

                    return {
                        ...template,
                        builder: parsedBuilder,
                        id: template.id,
                        title: template.title || '',
                        description: template.description || '',
                        mode: template.mode || 'builder',
                        rawPrompt: template.rawPrompt || '',
                        // 🔥 NUEVO: null/undefined en DB → true (activa por defecto)
                        active: template.active !== false,
                    };
                });
                setCampaignTemplates(mappedTemplates);
            } else {
                console.error("Error: la API de plantillas no devolvió un array.", response.data);
                setCampaignTemplates([]);
            }
        } catch (err) {
            console.error("Error al cargar plantillas:", err);
            setCampaignTemplates([]);
        } finally {
            setIsLoadingTemplates(false);
        }
    }, []);

    const handleSaveTemplate = useCallback(
        async (templateData) => {
            try {
                await apiClient.saveTemplate(templateData);
                setNotification({
                    type: "success",
                    title: "Plantilla Guardada",
                    message: "Los cambios se guardaron en la base de datos.",
                });
                await fetchTemplates();
            } catch (err) {
                console.error("Error al guardar plantilla:", err);
                setNotification({
                    type: "error",
                    title: "Error al Guardar",
                    message: "No se pudo guardar la plantilla.",
                });
            }
        },
        [fetchTemplates, setNotification]
    );

    const handleDeleteTemplate = useCallback(
        async (templateId) => {
            try {
                await apiClient.deleteTemplate(templateId);
                setNotification({
                    type: "success",
                    title: "Plantilla Eliminada",
                    message: "La plantilla fue eliminada.",
                });
                await fetchTemplates();
            } catch (err) {
                console.error("Error al eliminar plantilla:", err);
                setNotification({
                    type: "error",
                    title: "Error al Eliminar",
                    message: "No se pudo eliminar la plantilla.",
                });
            }
        },
        [fetchTemplates, setNotification]
    );

    // 🔥 NUEVO: Cambia el estado activo/inactivo de una campaña
    const handleToggleCampaignStatus = useCallback(
        async (templateId, newActiveState) => {
            // Buscamos la plantilla completa para hacer un update sin perder datos
            const currentTemplate = campaignTemplates.find(t => t.id === templateId);
            if (!currentTemplate) return;

            try {
                const now = new Date().toISOString();
                await apiClient.saveTemplate({
                    ...currentTemplate,
                    active: newActiveState,
                    updatedAt: now,
                });
                setNotification({
                    type: "success",
                    title: newActiveState ? "Campaña Activada" : "Campaña Archivada",
                    message: newActiveState
                        ? `"${currentTemplate.title}" está activa y visible en todos los módulos.`
                        : `"${currentTemplate.title}" fue archivada. No aparecerá en módulos de envío.`,
                });
                await fetchTemplates();
            } catch (err) {
                console.error("Error al cambiar estado de campaña:", err);
                setNotification({
                    type: "error",
                    title: "Error",
                    message: "No se pudo cambiar el estado de la campaña.",
                });
            }
        },
        [campaignTemplates, fetchTemplates, setNotification]
    );

    useEffect(() => {
        if (isAuthenticated) {
            fetchTemplates();
        }
    }, [isAuthenticated, fetchTemplates]);

    return {
        campaignTemplates,
        isLoadingTemplates,
        selectedCampaignId,
        setSelectedCampaignId,
        fetchTemplates,
        handleSaveTemplate,
        handleDeleteTemplate,
        handleToggleCampaignStatus, 
    };
};
