/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react"; // IMPORTAR useCallback y useEffect

import { useAuth } from "./useAuth";
import { useUI } from "./useUI";
import { useCampaignsAndTemplates } from "./useCampaignsAndTemplates";
import { useOrganizationData } from "./useOrganizationData";
import { useCallCenterAndCampaignFlow } from "./useCallCenterAndCampaignFlow";
import { useDashboardData } from "./useDashboardData";
import { useDataHandlers } from "./useDataHandlers";
import { useNavigationHandlers } from "./useNavigationHandlers";
import apiClient from "../api/apiClient";
import { useMentionsData } from "./useMentionsData";
import { useMatchingData } from "./useMatchingData";
import { HARDCODED_ORGANIZATIONS } from "../data/hardcodedOrganizations";

const isLocalEnvironment = () => {
    if (typeof window === "undefined") return false;
    const host = window.location.hostname;
    const isLocalHost =
        host === "localhost" ||
        host === "127.0.0.1" ||
        host === "0.0.0.0" ||
        host.endsWith(".local");

    return process.env.NODE_ENV !== "production" && isLocalHost;
};

export const useAppState = () => {
    // 1. Inicializar Hooks Modulares (EN EL ORDEN CORRECTO)
    const auth = useAuth();
    const ui = useUI(auth.setCurrentUser, auth.setIsAuthenticated);
    const { setNotification } = ui;

    // --- CAMBIO DE ORDEN: Campaigns va PRIMERO ---
    // Necesitamos 'fetchTemplates' para pasárselo a 'orgData'
    const campaigns = useCampaignsAndTemplates(
        ui.setNotification,
        auth.isAuthenticated
    );
    const [historyData, setHistoryData] = useState(null); // null indica que aun no se cargó
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    
    // --- ESTADO PARA REMITENTES (NUEVO) ---
    const [senders, setSenders] = useState([]);
    const [isLoadingSenders, setIsLoadingSenders] = useState(false);
    const [isLocalHardcodedToggleEnabled] = useState(() => isLocalEnvironment());
    const [useHardcodedOrganizations, setUseHardcodedOrganizations] = useState(() => {
        if (!isLocalEnvironment()) return false;
        try {
            return localStorage.getItem("use_hardcoded_organizations") === "1";
        } catch {
            return false;
        }
    });

    // --- CAMBIO DE ARGUMENTOS: Pasamos lo que faltaba ---
    const orgData = useOrganizationData(
        auth.isAuthenticated,
        ui.setNotification, // <-- FALTABA
        campaigns.fetchTemplates // <-- FALTABA (Vital para handleRefresh)
    );

    const mentionsData = useMentionsData(auth.isAuthenticated, ui.setNotification);
    const matchingData = useMatchingData(auth.isAuthenticated, ui.setNotification);

    // 2. Hooks que dependen de otros hooks
    const { metricas, estadosData, islasData, sectoresData } = useDashboardData(
        orgData.organizaciones
    );

    const dataHandlers = useDataHandlers(
        ui.setNotification,
        ui.setActiveView,
        orgData.handleRefresh
    );

    // --- FUNCIÓN PARA CARGAR REMITENTES ---
    const fetchSenders = useCallback(async () => {
        setIsLoadingSenders(true);
        try {
            const data = await apiClient.getSenders();
            const normalized = (Array.isArray(data) ? data : []).map(s => ({
                id: s.id,
                label: s.label,
                displayName: s.display_name || s.displayName,
                email: s.email,
                footerText: s.footer_text || s.footerText
            }));
            setSenders(normalized);
        } catch (error) {
            console.error("Error cargando remitentes:", error);
            setSenders([]);
        } finally {
            setIsLoadingSenders(false);
        }
    }, []);

    // Cargar remitentes al autenticarse
    useEffect(() => {
        if (auth.isAuthenticated) {
            fetchSenders();
        }
    }, [auth.isAuthenticated, fetchSenders]);

    useEffect(() => {
        if (!isLocalHardcodedToggleEnabled) return;
        try {
            localStorage.setItem(
                "use_hardcoded_organizations",
                useHardcodedOrganizations ? "1" : "0"
            );
        } catch {
        }
    }, [useHardcodedOrganizations, isLocalHardcodedToggleEnabled]);

    const canUseOrganizationsSourceToggle = isLocalHardcodedToggleEnabled || !!orgData.error;

    const handleToggleOrganizationsSource = useCallback(async () => {
        const nextValue = !useHardcodedOrganizations;
        setUseHardcodedOrganizations(nextValue);

        if (nextValue) {
            setNotification({
                type: "info",
                title: "Modo local activado",
                message: "Se activaron las organizaciones hardcodeadas para que puedas seguir usando la app.",
            });
            return;
        }

        if (!auth.isAuthenticated) return;

        if (orgData.organizaciones.length > 0) {
            setNotification({
                type: "info",
                title: "Base de datos activada",
                message: `Se reutilizaron ${orgData.organizaciones.length} organizaciones ya cargadas sin volver a consultar la base de datos.`,
            });
            return;
        }

        await orgData.handleRefresh();
    }, [auth.isAuthenticated, orgData, setNotification, useHardcodedOrganizations]);

    useEffect(() => {
        if (!isLocalHardcodedToggleEnabled) return;
        if (useHardcodedOrganizations) return;

        const shouldFallbackToHardcoded =
            auth.isAuthenticated &&
            !orgData.isLoading &&
            !!orgData.error &&
            orgData.organizaciones.length === 0;

        if (!shouldFallbackToHardcoded) return;

        setUseHardcodedOrganizations(true);
        setNotification({
            type: "warning",
            title: "Modo local activado",
            message:
                "No se pudieron cargar organizaciones remotas. Se activaron organizaciones de prueba automáticamente.",
        });
    }, [
        auth.isAuthenticated,
        isLocalHardcodedToggleEnabled,
        orgData.error,
        orgData.isLoading,
        orgData.organizaciones.length,
        setNotification,
        useHardcodedOrganizations,
    ]);


    const refreshHistory = async () => {
        if (isHistoryLoading) return;
        setIsHistoryLoading(true);
        try {
            const res = await apiClient.getCampaignsHistory();
            setHistoryData(res.data);
        } catch (error) {
            console.error("Error cargando historial:", error);
            // Opcional: manejar error global
        } finally {
            setIsHistoryLoading(false);
        }
    };

    const saveContact = async (formData) => {
        if (orgData.setIsSaving) orgData.setIsSaving(true);
        try {
            console.log("📤 saveContact - formData enviado:", formData);
            console.log("🏷️ organizacion_baja en formData:", formData.organizacion_baja);
            await apiClient.updateOrganization(formData);
            // Actualización optimista del estado local
            if (orgData.setOrganizaciones) {
                orgData.setOrganizaciones((prev) =>
                    prev.map((org) =>
                        org.id === formData.id ? { ...org, ...formData } : org
                    )
                );
            }
            ui.setNotification({
                type: "success",
                message: "Organización guardada correctamente.",
            });
            ui.setActiveView("listado");
        } catch (error) {
            console.error("Error saving contact:", error);
            ui.setNotification({ type: "error", message: "Error al guardar." });
        } finally {
            if (orgData.setIsSaving) orgData.setIsSaving(false);
        }
    };

    const campaignFlow = useCallCenterAndCampaignFlow({
        ...auth,
        ...ui,
        ...orgData, // Ahora orgData.handleRefresh funciona bien
        ...campaigns,
        senders,
    });

    const effectiveOrganizations =
        isLocalHardcodedToggleEnabled && useHardcodedOrganizations
            ? HARDCODED_ORGANIZATIONS
            : orgData.organizaciones;

    const effectiveIsLoading =
        isLocalHardcodedToggleEnabled && useHardcodedOrganizations
            ? false
            : orgData.isLoading;

    const effectiveError =
        isLocalHardcodedToggleEnabled && useHardcodedOrganizations
            ? null
            : orgData.error;

    // 3. Inicializamos Navigation Handlers
    const navigationHandlers = useNavigationHandlers(
        ui.setActiveView,
        ui.setSelectedOrg,
        campaignFlow.setEmailPreview,
        campaignFlow.setCurrentTask,
        campaignFlow.setIsCallCenterMode,
        ui.setShowCampaignModal
    );

    return {
        ...auth,
        ...ui,
        ...orgData,
        ...campaigns,
        ...campaignFlow,
        organizacionesApi: orgData.organizaciones,
        organizaciones: effectiveOrganizations,
        isLoading: effectiveIsLoading,
        error: effectiveError,
        handleSkipTask: campaignFlow.handleSkipTask,
        handleOpenCampaignModal: campaignFlow.handleOpenCampaignModal,
        ...navigationHandlers,
        metricas,
        estadosData,
        historyData,
        isHistoryLoading,
        refreshHistory,
        islasData,
        sectoresData,
        onRefresh: orgData.handleRefresh,
        saveContact,
        ...mentionsData,
        ...matchingData,
        // NUEVO: Exportar estado y función de remitentes
        senders,
        isLoadingSenders,
        fetchSenders,
        useHardcodedOrganizations,
        setUseHardcodedOrganizations,
        handleToggleOrganizationsSource,
        isLocalHardcodedToggleEnabled: canUseOrganizationsSourceToggle
    };
};
