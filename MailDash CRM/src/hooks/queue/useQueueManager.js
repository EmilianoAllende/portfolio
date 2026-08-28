import { useCallback } from "react";
import apiClient from "../../api/apiClient";
import { normalizeEmailPreview } from "./queueUtils";

export const useQueueManager = ({
    currentUser,
    selectedCampaignId,
    currentQueueId,
    setNotification,
    setConfirmProps,
    closeConfirm,
    setShowCampaignModal,
    setSelectedOrg,
    selectedOrg,
    setIsTaskLoading,
    setEmailPreview,
    setCurrentTask,
    setIsCallCenterMode,
    setIsFastSendMode,
    setCurrentQueueId,
    setQueueProgress,
    setFastSendStats,
    pendingOrgRef,
    pendingTaskRef,
    fastSendTimeoutRef,
    setIsSendingCampaign
}) => {
    
    const handleCancelQueue = useCallback(() => {
        console.log("🛑 Cancelando cola de tareas...");
        setIsCallCenterMode(false);
        setIsFastSendMode(false);
        setShowCampaignModal(false);
        setCurrentQueueId(null);
        setCurrentTask(null);
        setEmailPreview(null);
        setQueueProgress({ current: 0, total: 0 });
        pendingOrgRef.current = null;
        pendingTaskRef.current = null;
        if (fastSendTimeoutRef.current) {
            clearTimeout(fastSendTimeoutRef.current);
        }
        setNotification?.({
            type: "warning",
            title: "Cola Cancelada",
            message: "Has interrumpido la cola de tareas.",
        });
    }, [setShowCampaignModal, setNotification, setIsCallCenterMode, setIsFastSendMode, setCurrentQueueId, setCurrentTask, setEmailPreview, setQueueProgress, pendingOrgRef, pendingTaskRef, fastSendTimeoutRef]);

    const fetchNextTask = useCallback(async (queueId) => {
        console.log("🔄 Iniciando fetchNextTask con QueueID:", queueId);
        setIsTaskLoading(true); 
        setShowCampaignModal(true); 
        setEmailPreview(null);
        setCurrentTask(null);
        
        const CURRENT_USER_ID = currentUser?.usuario || "user_default";

        try {
            if (!queueId) throw new Error("Falta queueId activo.");

            const taskResponse = await apiClient.getNextInQueue(
                queueId,
                CURRENT_USER_ID,
                selectedCampaignId 
            );

            const responseData = Array.isArray(taskResponse.data) ? taskResponse.data[0] : taskResponse.data;
            const taskData = responseData?.json || responseData;

            if (taskData && taskData.organization) {
                const organization = taskData.organization;
                if (!organization.nombre && organization.organizacion) {
                    organization.nombre = organization.organizacion;
                }
                
                pendingOrgRef.current = organization;
                pendingTaskRef.current = taskData;

                setCurrentTask(taskData);
                setSelectedOrg(organization);

                let emailData = taskData?.email || taskData?.preview || taskData?.draft || taskData?.json?.email;
                const normalizedN8nEmail = normalizeEmailPreview(emailData);

                if (normalizedN8nEmail) {
                    setEmailPreview(normalizedN8nEmail);
                    setQueueProgress(prev => ({ ...prev, current: prev.current + 1 }));
                } else if (emailData && typeof emailData === 'string') {
                    const emailResponse = await apiClient.generatePreview({ organization, campaignId: selectedCampaignId });
                    setEmailPreview(normalizeEmailPreview(emailResponse.data) || emailResponse.data);
                    setQueueProgress(prev => ({ ...prev, current: prev.current + 1 }));
                } else {
                    const emailResponse = await apiClient.generatePreview({ organization, campaignId: selectedCampaignId });
                    setEmailPreview(normalizeEmailPreview(emailResponse.data) || emailResponse.data);
                    setQueueProgress(prev => ({ ...prev, current: prev.current + 1 }));
                }
            } else {
                setNotification?.({
                    type: "success",
                    title: "Cola Finalizada",
                    message: "¡Has procesado todas las organizaciones en la cola!",
                });
                handleCancelQueue();
            }
        } catch (err) {
            console.error("❌ Error fetchNextTask:", err);
            setNotification?.({
                type: "error",
                title: "Error de Proceso",
                message: "No se pudo cargar la siguiente tarea.",
            });
        } finally {
            setIsTaskLoading(false);
            setIsSendingCampaign(false);
        }
    }, [currentUser, selectedCampaignId, setNotification, setShowCampaignModal, setSelectedOrg, setIsTaskLoading, setEmailPreview, setCurrentTask, pendingOrgRef, pendingTaskRef, setQueueProgress, setIsSendingCampaign, handleCancelQueue]);

    const handleSkipTask = useCallback(async (queueIdOverride) => {
        const activeQueueId = queueIdOverride || currentQueueId;
        if (!activeQueueId) {
            setNotification?.({
                type: "warning",
                title: "Sin cola activa",
                message: "No hay una cola activa para poder saltar esta tarea.",
            });
            return;
        }
        
        setIsTaskLoading(true);
        setEmailPreview(null);
        setCurrentTask(null);

        try {
            const orgToSkip = selectedOrg || pendingOrgRef.current;
            if (orgToSkip?.id) {
                await apiClient.skipTask(activeQueueId, orgToSkip.id, selectedCampaignId);
            }
            await fetchNextTask(activeQueueId);
        } catch (error) {
            console.error("Error al saltar:", error);
            setNotification?.({
                type: "error",
                title: "Error al saltar",
                message: "No se pudo posponer la tarea actual.",
            });
            setIsTaskLoading(false);
        }
    }, [currentQueueId, selectedOrg, selectedCampaignId, fetchNextTask, setIsTaskLoading, setEmailPreview, setCurrentTask, pendingOrgRef, setNotification]);

    const _executeStartCallCenterMode = useCallback(async (selectedOrgs) => {
        setIsTaskLoading(true);
        setShowCampaignModal(true);
        setIsCallCenterMode(true);
        setEmailPreview(null);
        setCurrentTask(null);
        try {
            if (!selectedCampaignId) throw new Error("Falta campaña.");
            const orgIds = selectedOrgs.map((org) => org.id);
            const clientGeneratedQueueId = `q_${Date.now()}`;

            await apiClient.createDynamicQueue(orgIds, clientGeneratedQueueId);
            
            setCurrentQueueId(clientGeneratedQueueId);
            setFastSendStats({ sent: 0, total: orgIds.length });
            setQueueProgress({ current: 0, total: orgIds.length });
            
            fetchNextTask(clientGeneratedQueueId);
        } catch (err) {
            console.error("Error start CC:", err);
            setShowCampaignModal(false);
            setIsCallCenterMode(false);
            setNotification?.({ type: "error", title: "Error", message: "No se pudo iniciar cola." });
            setIsTaskLoading(false);
        }
    }, [fetchNextTask, selectedCampaignId, setNotification, setIsTaskLoading, setShowCampaignModal, setCurrentTask, setEmailPreview, setCurrentQueueId, setIsCallCenterMode, setFastSendStats, setQueueProgress]);

    const startCallCenterMode = useCallback((selectedOrgs) => {
        if (!selectedCampaignId) {
            setNotification?.({ type: "warning", title: "Falta Campaña", message: "Selecciona una campaña." });
            return;
        }
        if (!selectedOrgs || selectedOrgs.length < 2) {
            setNotification?.({ type: "warning", title: "Selección", message: "Selecciona al menos 2." });
            return;
        }

        if (typeof setConfirmProps !== "function") {
            setNotification?.({
                type: "error",
                title: "Error de interfaz",
                message: "No se pudo abrir la confirmación para iniciar la cola.",
            });
            return;
        }

        setConfirmProps({
            show: true,
            title: "Modo Call Center",
            message: `¿Iniciar cola con ${selectedOrgs.length} organizaciones?`,
            confirmText: "Iniciar",
            type: "info",
            onConfirm: () => {
                _executeStartCallCenterMode(selectedOrgs);
                closeConfirm?.();
            },
        });
    }, [_executeStartCallCenterMode, closeConfirm, selectedCampaignId, setConfirmProps, setNotification]);

    return {
        fetchNextTask,
        handleSkipTask,
        startCallCenterMode,
        _executeStartCallCenterMode,
        handleCancelQueue
    };
};
