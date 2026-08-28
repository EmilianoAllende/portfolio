import { useEffect } from "react";

export const useFastSendLoop = ({
    isFastSendMode,
    emailPreview,
    isCallCenterMode,
    selectedOrg,
    selectedCampaignId,
    campaignTemplates,
    senders,
    selectedSenderForFlow,
    fastSendTimeoutRef,
    _executeConfirmAndSend
}) => {
    useEffect(() => {
        if (!isFastSendMode || !emailPreview || !isCallCenterMode) return;

        console.log("⚡ Modo FastSend activo con email cargado. Auto-enviando...");

        if (fastSendTimeoutRef.current) {
            clearTimeout(fastSendTimeoutRef.current);
        }

        fastSendTimeoutRef.current = setTimeout(() => {
            if (emailPreview && selectedOrg) {
                console.log("🚀 Auto-enviando email en modo FastSend");
                
                const campaignTemplate = campaignTemplates?.find(t => t.id === selectedCampaignId);
                const campaignSenderId = campaignTemplate?.builder?.senderName;
                const campaignSender = senders?.find(s =>
                    s?.id?.toString() === campaignSenderId?.toString()
                );

                const senderToUse = selectedSenderForFlow || campaignSender;
                const autoSenderId =
                    senderToUse?.id ||
                    emailPreview.senderId ||
                    campaignSenderId ||
                    "default";

                const autoSendContent = {
                    subject: emailPreview.subject || "",
                    body: emailPreview.body || "",
                    button: emailPreview.button || {},
                    senderEmail: senderToUse?.email || emailPreview.senderEmail || "",
                    senderName: senderToUse?.displayName || emailPreview.senderName || "",
                    senderId: autoSenderId,
                };

                _executeConfirmAndSend(autoSendContent);
            }
        }, 500);

        return () => {
            if (fastSendTimeoutRef.current) {
                clearTimeout(fastSendTimeoutRef.current);
            }
        };
    }, [
        isFastSendMode, emailPreview, isCallCenterMode, selectedOrg, 
        selectedCampaignId, campaignTemplates, senders, selectedSenderForFlow,
        _executeConfirmAndSend, fastSendTimeoutRef
    ]);
};
