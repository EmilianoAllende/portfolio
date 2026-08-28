import React, { useState, useEffect, useRef } from "react";
import HtmlPreviewModal from "../preview/HtmlPreviewModal";
import TemplateSelectionView from "./TemplateSelectionView";
import PreviewEditView from "./PreviewEditView";
import { generatePreviewHtml } from "../preview/GeneratePreviewHtml";
import FastSendProgressView from "./modals/FastSendProgressView";
import CampaignLoadingView from "./modals/CampaignLoadingView";

const SendCampaignModal = ({
    show,
    onClose,
    selectedOrg,
    campaignTemplates,
    onGeneratePreview,
    onConfirmAndSend,
    isPreviewLoading,
    isSending,
    emailPreview,
    selectedCampaignId,
    setSelectedCampaignId,
    isTaskLoading,
    setConfirmProps,
    closeConfirm,
    isCallCenterMode,
    onSkipTask,
    isFastSendMode,
    onToggleFastSend,
    fastSendStats,
    queueProgress = { current: 0, total: 0 },
    availableSenders = [],
    onRefreshSenders, 
    onSenderResolved,
    onCancelQueue
}) => {
    // ESTADO
    const [showHtmlPreview, setShowHtmlPreview] = useState(false);
    const [editableContent, setEditableContent] = useState({
        subject: "",
        body: "",
    });

    // --- ESTADO DEL REMITENTE ACTUAL ---
    const [currentSender, setCurrentSender] = useState(null);

    // REF DE BLOQUEO
    const lastRequestRef = useRef("");

    const selectedCampaignObj = campaignTemplates.find(
        (t) => t.id === selectedCampaignId
    );

    const showFastSendDebug = React.useMemo(() => {
        if (process.env.NODE_ENV !== "production") return true;
        try {
            return localStorage.getItem("debugFastSend") === "1";
        } catch {
            return false;
        }
    }, []);

    // Botón predefinido de la campaña
    const campaignButton = React.useMemo(() => {
        if (
            selectedCampaignObj?.builder?.buttonText &&
            selectedCampaignObj?.builder?.buttonUrl
        ) {
            return {
                text: selectedCampaignObj.builder.buttonText,
                url: selectedCampaignObj.builder.buttonUrl,
            };
        }
        return null;
    }, [selectedCampaignObj]);

    // --- EFECTO: INICIALIZAR REMITENTE Y REFRESCAR DATOS ---
    useEffect(() => {
        if (show) {
            // 2. ¡IMPORTANTE! Refrescamos la lista global al abrir el modal
            if (onRefreshSenders) {
                onRefreshSenders();
            }

            let matchedSender = null;

            // Intentar usar el remitente guardado en la plantilla
            if (selectedCampaignObj?.builder?.senderName) {
                const storedSenderValue = selectedCampaignObj.builder.senderName.toString();
                matchedSender = availableSenders.find(s => 
                    s.id.toString() === storedSenderValue || 
                    s.displayName === storedSenderValue
                );
            }

            // Si no, usar el primero de la lista disponible
            if (!matchedSender && availableSenders.length > 0) {
                matchedSender = availableSenders[0];
            }

            // Fallback final
            if (!matchedSender) {
                matchedSender = {
                    id: "default",
                    label: "Predeterminado",
                    displayName: "MMI Analytics",
                    email: "ac.analytics@mmi-e.com",
                    footerText: "MMI Analytics"
                };
            }

            setCurrentSender(matchedSender);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, selectedCampaignId]); // Quitamos 'availableSenders' y 'selectedCampaignObj' de dependencias para evitar bucles, ya que onRefreshSenders actualizará availableSenders

    // EFECTO SECUNDARIO: Actualizar el sender seleccionado si la lista availableSenders cambia (ej: terminó de cargar)
    useEffect(() => {
        if (show && availableSenders.length > 0 && selectedCampaignObj?.builder?.senderName) {
            const storedSenderValue = selectedCampaignObj.builder.senderName.toString();
            const freshSender = availableSenders.find(s => 
                s.id.toString() === storedSenderValue || 
                s.displayName === storedSenderValue
            );
            if (freshSender) {
                setCurrentSender(freshSender);
            }
        }
    }, [availableSenders, show, selectedCampaignObj]);

    useEffect(() => {
        if (show && onSenderResolved) {
            onSenderResolved(currentSender || null);
        }
    }, [show, currentSender, onSenderResolved]);


    // EFECTOS DE PREVIEW
    useEffect(() => {
        if (emailPreview) {
            const contentWithButton = {
                ...emailPreview,
                button: emailPreview.button || campaignButton || {},
            };
            setEditableContent(prev => ({
                ...prev,
                ...contentWithButton
            }));
        } else if (!isPreviewLoading) {
            setEditableContent(prev => ({
                ...prev,
                subject: "",
                body: "",
                button: campaignButton || {},
            }));
        }
    }, [emailPreview, isPreviewLoading, campaignButton]);

    useEffect(() => {
        if (!show) {
            lastRequestRef.current = "";
            setEditableContent({ subject: "", body: "", button: {} });
        }
    }, [show]);

    useEffect(() => {
        const currentKey = `${selectedOrg?.id}-${selectedCampaignId}`;

        const shouldGenerate =
            show &&
            !isCallCenterMode &&
            selectedOrg &&
            selectedCampaignId &&
            !emailPreview &&
            !isPreviewLoading;

        if (shouldGenerate) {
            if (lastRequestRef.current === currentKey) {
                return;
            }
            console.log("🚀 Generando borrador para:", currentKey);
            lastRequestRef.current = currentKey;
            onGeneratePreview(selectedOrg, selectedCampaignId);
        }
    }, [
        show,
        isCallCenterMode,
        selectedOrg,
        selectedCampaignId,
        emailPreview,
        isPreviewLoading,
        onGeneratePreview,
    ]);


    // VALIDACIONES DE RENDERIZADO
    if (!show) return null;

    const canRenderWithoutOrg = isTaskLoading && isCallCenterMode;
    if (!selectedOrg && !canRenderWithoutOrg) return null;


    if (isFastSendMode && isCallCenterMode) {
        return (
            <FastSendProgressView 
                currentSender={currentSender}
                fastSendStats={fastSendStats}
                showFastSendDebug={showFastSendDebug}
                onCancelQueue={onCancelQueue}
                setConfirmProps={setConfirmProps}
                closeConfirm={closeConfirm}
            />
        );
    }

    if (isTaskLoading && isCallCenterMode) {
        return <CampaignLoadingView />;
    }

    // MANEJADORES
    const handleCancelClick = () => {
        setConfirmProps({
            show: true,
            title: isCallCenterMode ? "Cancelar Cola" : "Cancelar Acción",
            message: isCallCenterMode 
               ? "¿Seguro que quieres descartar el resto de la cola actual?"
               : `¿Seguro que quieres cancelar el envío a ${selectedOrg?.nombre || "la organización"}?`,
            confirmText: "Sí, salir",
            cancelText: "No, volver",
            type: "danger",
            onConfirm: () => {
                if (isCallCenterMode && onCancelQueue) {
                    onCancelQueue();
                } else {
                    onClose();
                }
                closeConfirm();
            },
        });
    };

    const handleGenerateClick = () => {
        const templateName = campaignTemplates.find((t) => t.id === selectedCampaignId)?.title || "la plantilla";
        setConfirmProps({
            show: true,
            title: "Generar Borrador",
            message: `Se usará la IA para generar un borrador con la plantilla "${templateName}". ¿Continuar?`,
            confirmText: "Sí, generar",
            cancelText: "No, volver",
            type: "info",
            onConfirm: () => {
                lastRequestRef.current = "";
                onGeneratePreview(selectedOrg, selectedCampaignId);
                closeConfirm();
            },
        });
    };

    // --- MANEJO DE CAMBIO DE REMITENTE ---
    const handleSenderChange = (senderId) => {
        const newSender = availableSenders.find(s => s.id.toString() === senderId.toString());
        if (newSender) {
            setCurrentSender(newSender);
        }
    };

    const handleConfirmClick = (content) => {
        let currentUser = "Desconocido";
        try {
            const storedUser = localStorage.getItem("currentUser");
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                currentUser = parsedUser.usuario || parsedUser.username || parsedUser.name || "Usuario";
            } else {
                currentUser = localStorage.getItem("usuario") || localStorage.getItem("username") || "Desconocido";
            }
        } catch (e) {
            console.warn("No se pudo recuperar el usuario del localStorage", e);
        }

        // USAMOS EL REMITENTE DEL ESTADO ACTUAL (currentSender)
        const senderToUse = currentSender || { id: "default", displayName: "Desconocido", email: "", footerText: "" };

        onConfirmAndSend({
            ...content,
            senderId: senderToUse.id,           // <-- NUEVO: Enviar ID del remitente
            senderEmail: senderToUse.email,
            senderName: senderToUse.displayName,
            senderFooter: senderToUse.footerText,
            sent_by: currentUser,
        });
    };

    const handleContentChange = (e) => {
        const { name, value } = e.target;
        setEditableContent((prev) => ({ ...prev, [name]: value }));
    };

    const renderPreviewView = () => (
        <PreviewEditView
            selectedOrg={selectedOrg}
            editableContent={editableContent}
            handleContentChange={handleContentChange}
            onConfirmAndSend={handleConfirmClick}
            isSending={isSending}
            handleCancelClick={handleCancelClick}
            onShowHtmlPreview={() => setShowHtmlPreview(true)}
            isCallCenterMode={isCallCenterMode}
            onSkipTask={onSkipTask}
            isFastSendMode={isFastSendMode}
            onToggleFastSend={onToggleFastSend}
            queueProgress={queueProgress}

            // --- PROPS PARA EL SELECTOR ---
            availableSenders={availableSenders}
            selectedSenderId={currentSender?.id || ""}
            onSenderChange={handleSenderChange}
        />
    );

    // VISTAS
    const renderInitialView = () => (
        <>
            {isCallCenterMode || isPreviewLoading || (selectedCampaignId && !emailPreview) ? (
                <div className="flex flex-col items-center justify-center text-center p-12 rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md mx-auto mt-10 backdrop-blur-sm">
                    {/* ... loader ... */}
                    <div className="mb-6 w-16 h-16 relative">
                        <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <h2 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">
                        Generando borrador
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                        {selectedCampaignId
                            ? "Aplicando la plantilla seleccionada..."
                            : "Preparando tu campaña personalizada..."}
                    </p>
                    <p className="text-xs text-slate-400 mt-4 font-mono">
                        Enviando como: {currentSender?.displayName || "Cargando..."}
                    </p>
                </div>
            ) : (
                <TemplateSelectionView
                    selectedOrg={selectedOrg}
                    campaignTemplates={campaignTemplates}
                    selectedCampaignId={selectedCampaignId}
                    setSelectedCampaignId={setSelectedCampaignId}
                    handleCancelClick={handleCancelClick}
                    handleGenerateClick={handleGenerateClick}
                    isPreviewLoading={isPreviewLoading}
                />
            )}
        </>
    );

    return (
        <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 w-full max-w-[95vw] max-h-[95vh] overflow-y-auto border border-slate-200 dark:border-slate-700 shadow-2xl animate-scaleIn">
                    {emailPreview ? renderPreviewView() : renderInitialView()}
                </div>
            </div>

            {showHtmlPreview && (
                <HtmlPreviewModal
                    htmlContent={generatePreviewHtml(
                        editableContent,
                        selectedOrg,
                        currentSender?.footerText || ""
                    )}
                    onClose={() => setShowHtmlPreview(false)}
                    selectedOrg={selectedOrg}
                    subject={editableContent.subject}
                    senderEmail={currentSender?.email || ""}
                    senderName={currentSender?.displayName || ""}
                />
            )}
        </>
    );
};

export default SendCampaignModal;
