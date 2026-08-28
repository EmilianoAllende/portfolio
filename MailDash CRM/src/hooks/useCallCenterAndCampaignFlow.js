import { useState, useCallback, useRef } from "react";
import { useQueueManager } from "./queue/useQueueManager";
import { useCampaignSender } from "./queue/useCampaignSender";
import { usePreviewGenerator } from "./queue/usePreviewGenerator";
import { useFastSendLoop } from "./queue/useFastSendLoop";

export const useCallCenterAndCampaignFlow = ({
    currentUser,
    selectedOrg,
    selectedCampaignId,
    setNotification,
    setConfirmProps,
    closeConfirm,
    setShowCampaignModal,
    setSelectedOrg,
    handleRefresh,
    campaignTemplates = [],
    senders = []
}) => {
    // 1. Estados centrales
    const [emailPreview, setEmailPreview] = useState(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [isSendingCampaign, setIsSendingCampaign] = useState(false);
    const [isCallCenterMode, setIsCallCenterMode] = useState(false);
    const [isTaskLoading, setIsTaskLoading] = useState(false);
    const [currentQueueId, setCurrentQueueId] = useState(null);
    const [currentTask, setCurrentTask] = useState(null);
    const [isFastSendMode, setIsFastSendMode] = useState(false);
    const [fastSendStats, setFastSendStats] = useState({ sent: 0, total: 0 });
    const [queueProgress, setQueueProgress] = useState({ current: 0, total: 0 });
    const [selectedSenderForFlow, setSelectedSenderForFlow] = useState(null);

    // 2. Referencias para evitar race conditions
    const pendingOrgRef = useRef(null);
    const pendingTaskRef = useRef(null);
    const fastSendTimeoutRef = useRef(null);

    // 3. Manejador para abrir vista estática de campaña manual
    const handleOpenCampaignModal = useCallback((org) => {
        pendingOrgRef.current = null;
        pendingTaskRef.current = null;

        setSelectedOrg(org);
        setEmailPreview(null);
        setCurrentTask(null);
        setSelectedSenderForFlow(null);
        setIsCallCenterMode(false);
        setShowCampaignModal(true);
    }, [setSelectedOrg, setShowCampaignModal]);

    // 4. Instanciar los Sub-Hooks
    const { fetchNextTask, handleSkipTask, startCallCenterMode, _executeStartCallCenterMode, handleCancelQueue } = useQueueManager({
        currentUser, selectedCampaignId, currentQueueId, setNotification, setConfirmProps, closeConfirm, setShowCampaignModal, setSelectedOrg, selectedOrg,
        setIsTaskLoading, setEmailPreview, setCurrentTask, setIsCallCenterMode, setIsFastSendMode, setCurrentQueueId,
        setQueueProgress, setFastSendStats, pendingOrgRef, pendingTaskRef, fastSendTimeoutRef, setIsSendingCampaign
    });

    const { handleGeneratePreview } = usePreviewGenerator({
        selectedOrg, selectedCampaignId, setNotification, campaignTemplates, setIsPreviewLoading, setEmailPreview
    });

    const { _executeConfirmAndSend, handleConfirmAndSend } = useCampaignSender({
        selectedOrg, pendingOrgRef, currentTask, pendingTaskRef, setNotification, setIsSendingCampaign,
        selectedCampaignId, isCallCenterMode, currentQueueId, fetchNextTask, handleRefresh, setShowCampaignModal,
        isFastSendMode, setFastSendStats, setEmailPreview, setCurrentTask, setIsTaskLoading,
        setConfirmProps, closeConfirm
    });

    // 5. Instanciar Bucle FastSend (se engancha automáticamente cuando isFastSendMode está activo)
    useFastSendLoop({
        isFastSendMode, emailPreview, isCallCenterMode, selectedOrg, selectedCampaignId,
        campaignTemplates, senders, selectedSenderForFlow, fastSendTimeoutRef, _executeConfirmAndSend
    });

    // 6. Retornar Estado Acumulado a App.jsx (Retrocompatibilidad total)
    return {
        emailPreview, setEmailPreview, isPreviewLoading, isSendingCampaign, isCallCenterMode, setIsCallCenterMode,
        isTaskLoading, currentTask, setCurrentTask,
        handleGeneratePreview, handleConfirmAndSend, startCallCenterMode, _executeStartCallCenterMode,
        handleOpenCampaignModal, handleSkipTask, handleCancelQueue,
        isFastSendMode, setIsFastSendMode, fastSendStats, queueProgress,
        selectedSenderForFlow, setSelectedSenderForFlow
    };
};