import { useCallback } from "react";
import apiClient from "../../api/apiClient";

export const useCampaignSender = ({
    selectedOrg,
    pendingOrgRef,
    currentTask,
    pendingTaskRef,
    setNotification,
    setIsSendingCampaign,
    selectedCampaignId,
    isCallCenterMode,
    currentQueueId,
    fetchNextTask,
    handleRefresh,
    setShowCampaignModal,
    isFastSendMode,
    setFastSendStats,
    setEmailPreview,
    setCurrentTask,
    setIsTaskLoading,
    setConfirmProps,
    closeConfirm
}) => {
    const _executeConfirmAndSend = useCallback(async (finalContent) => {
        setIsSendingCampaign(true);
        const orgForPayload = selectedOrg || pendingOrgRef.current;
        const taskForPayload = currentTask || pendingTaskRef.current;
        
        if (!orgForPayload) {
            console.error("❌ No hay organización disponible para envío");
            setNotification?.({
                type: "error",
                title: "Error",
                message: "No se pudo identificar la organización. Intenta recargar.",
            });
            setIsSendingCampaign(false);
            return;
        }
        
        const orgIdForPayload = orgForPayload.id;
        const orgNameForNotification = orgForPayload.organizacion || orgForPayload.nombre;
        const taskInfoForPayload = taskForPayload?.taskInfo;
        
        try {
            let bodyHtml = `<div>${finalContent.body.replace(/\n/g, '<br>')}</div>`;
            
            if (finalContent.button?.text && finalContent.button?.url) {
                const buttonHtml = `
                    <br><br>
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="${finalContent.button.url}" target="_blank" style="background-color: #1f2937; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-family: Arial, sans-serif; display: inline-block;">
                            ${finalContent.button.text}
                        </a>
                    </div>
                `;
                bodyHtml += buttonHtml;
            }
            
            const payload = {
                organizationId: orgIdForPayload,
                subject: finalContent.subject,
                body: bodyHtml,
                senderId: finalContent.senderId,
                senderEmail: finalContent.senderEmail,
                senderName: finalContent.senderName,
                ...(taskInfoForPayload && { taskInfo: taskInfoForPayload }),
                campaignId: selectedCampaignId || undefined,
                sentAt: new Date().toISOString(),
                updateHaceDias: true,
            };
            
            const response = await apiClient.confirmAndSend(payload);
            let result = response.data;
            if (typeof result === "string") {
                try { result = JSON.parse(result); } catch (e) {}
            }

            if (result && result.status === "success") {
                setNotification?.({
                    type: "success",
                    title: "Enviado",
                    message: `Correo enviado a ${orgNameForNotification}.`,
                });

                if (isCallCenterMode && currentQueueId) {
                    const delay = isFastSendMode ? 800 : 4000;
                    setFastSendStats?.(prev => ({ ...prev, sent: prev.sent + 1 }));
                    setEmailPreview(null);
                    setCurrentTask(null);
                    setIsTaskLoading(true);

                    setTimeout(() => {
                        fetchNextTask(currentQueueId);
                    }, delay); 
                } else {
                    setIsSendingCampaign(false);
                    setShowCampaignModal(false);
                    setEmailPreview(null);
                    if (selectedOrg && handleRefresh) {
                        try { setTimeout(() => handleRefresh(), 1000); } catch (e) {}
                    }
                }
            } else if (result && result.status === "canceled") {
                setNotification?.({ type: "warning", title: "Cancelado", message: result.message || "Envío cancelado." });
                setIsSendingCampaign(false);
                if (isFastSendMode && isCallCenterMode && currentQueueId) {
                    setEmailPreview(null);
                    setCurrentTask(null);
                    setIsTaskLoading(true);
                    setTimeout(() => fetchNextTask(currentQueueId), 2000);
                }
            } else {
                throw new Error(result?.status || "Respuesta desconocida");
            }
        } catch (err) {
            console.error("Error al enviar:", err);
            setNotification?.({ type: "error", title: "Error de Envío", message: "No se pudo enviar el correo." });
            setIsSendingCampaign(false);
        }
    }, [
        selectedOrg, currentTask, setNotification, selectedCampaignId, isCallCenterMode, currentQueueId, 
        fetchNextTask, handleRefresh, setShowCampaignModal, isFastSendMode,
        pendingOrgRef, pendingTaskRef, setIsSendingCampaign, setFastSendStats, setEmailPreview, setCurrentTask, setIsTaskLoading
    ]);

    const handleConfirmAndSend = useCallback((finalContent) => {
        const orgForConfirm = selectedOrg || pendingOrgRef.current;
        setConfirmProps?.({
            show: true,
            title: "Confirmar Envío",
            message: `¿Enviar correo a ${orgForConfirm?.organizacion || orgForConfirm?.nombre || 'esta organización'}?`,
            confirmText: "Enviar",
            type: "info",
            onConfirm: () => {
                _executeConfirmAndSend(finalContent);
                closeConfirm?.();
            },
        });
    }, [_executeConfirmAndSend, selectedOrg, pendingOrgRef, setConfirmProps, closeConfirm]);

    return {
        _executeConfirmAndSend,
        handleConfirmAndSend
    };
};
