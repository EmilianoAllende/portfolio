import { useCallback } from "react";
import apiClient from "../../api/apiClient";

export const usePreviewGenerator = ({
    selectedOrg,
    selectedCampaignId,
    setNotification,
    campaignTemplates,
    setIsPreviewLoading,
    setEmailPreview,
}) => {
    const handleGeneratePreview = useCallback(async (orgToPreview, campaignIdToPreview) => {
        const organization = orgToPreview || selectedOrg;
        const campaignId = campaignIdToPreview || selectedCampaignId;

        if (!organization || !campaignId) {
            setNotification?.({
                type: "warning",
                title: "Selección Requerida",
                message: "Por favor, selecciona una organización y una campaña.",
            });
            return;
        }
        
        setIsPreviewLoading(true);
        setEmailPreview(null);
        
        try {
            let rawContact = organization.nombre_contacto || organization.nombres_org || organization.contacto || "";
            if (Array.isArray(rawContact)) rawContact = rawContact[0]; 
            if (typeof rawContact === 'string') {
                rawContact = rawContact.replace(/[[\]"]/g, '').trim(); 
            }

            const safeOrg = {
                ...organization,
                organizacion: organization.organizacion || organization.nombre || "Empresa",
                nombre: organization.nombre || organization.organizacion || "Empresa",
                nombre_contacto: rawContact, 
                id: organization.id || "unknown"
            };

            const campaignTemplate = campaignTemplates.find(t => t.id === campaignId);
            const campaignButton = campaignTemplate?.builder?.buttonText && campaignTemplate?.builder?.buttonUrl
                ? {
                    text: campaignTemplate.builder.buttonText,
                    url: campaignTemplate.builder.buttonUrl
                }
                : null;

            const payload = {
                organization: safeOrg,
                campaignId: campaignId,
                campaignButton: campaignButton,
            };

            const response = await apiClient.generatePreview(payload);

            setEmailPreview(response.data);
            setNotification?.({
                type: "success",
                title: "Borrador Generado",
                message: "El borrador ha sido generado exitosamente.",
            });
        } catch (err) {
            console.error("Error al generar el borrador:", err);
            setNotification?.({
                type: "error",
                title: "Error al Generar",
                message: "No se pudo generar el borrador. Verifica la conexión.",
            });
        } finally {
            setIsPreviewLoading(false);
        }
    }, [selectedOrg, selectedCampaignId, setNotification, campaignTemplates, setIsPreviewLoading, setEmailPreview]);

    return {
        handleGeneratePreview
    };
};
