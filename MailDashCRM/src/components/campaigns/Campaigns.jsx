import React, { useEffect, useState } from "react";
import CtasManagerModal from "./CtasManagerModal";
import SendersManagerModal from "./SendersManagerModal";
import CampaignEditorForm from "./CampaignEditorForm";
import CampaignsSidebar from "./CampaignsSidebar";
import { useCampaignViewState } from "./hooks/useCampaignViewState";
import { useCampaignEditorState } from "./hooks/useCampaignEditorState";

const Campaigns = ({
    currentUser,
    campaignTemplates,
    onSaveTemplate,
    onDeleteTemplate,
    onAddTemplate,
    onUseTemplate,
    onToggleCampaignStatus,
    setNotification,
    setConfirmProps,
    closeConfirm,
    campanasActivas,
    showCampaignModal,
    setShowCampaignModal,
    selectedOrg,
    setSelectedOrg,
    handleRefresh,
    campaignsProps,
}) => {
    // ESTADOS Y HOOKS DE VISTAS (Lista de plantillas)
    const {
        viewFilter,
        handleViewFilterChange,
        visibleTemplates,
        handleToggleStatus
    } = useCampaignViewState(
        campaignTemplates,
        campanasActivas,
        onToggleCampaignStatus,
        setConfirmProps,
        closeConfirm
    );

    // ESTADO DE FORMULARIO (Plantilla activa, unsaved, etc)
    const {
        selectedTplId,
        editingTpl,
        hasUnsavedChanges,
        handleSelectTemplate,
        handleFieldChange,
        handleDynamicContentChange,
        saveTemplate,
        deleteTemplate,
        addTemplate,
        handleUseTemplate,
        handleApplyCta,
        handleClearCta
    } = useCampaignEditorState(
        campaignTemplates,
        setConfirmProps,
        closeConfirm,
        onSaveTemplate,
        onDeleteTemplate,
        onAddTemplate,
        setNotification
    );

    // Modales Adicionales
    const [showCtasManager, setShowCtasManager] = useState(false);
    const [showSendersManager, setShowSendersManager] = useState(false);

    useEffect(() => {
        if ((campaignsProps?.senders?.length || 0) > 0) return;
        if (typeof campaignsProps?.fetchSenders === "function") {
            campaignsProps.fetchSenders();
        }
    }, [campaignsProps]);

    // Mapeos
    const handleSaveTemplateFinal = () => {
        saveTemplate();
        setNotification({ type: "success", title: "Guardado", message: "La plantilla de campaña ha sido guardada." });
    };

    const handleDeleteTemplateFinal = () => {
        deleteTemplate();
        setNotification({ type: "success", title: "Eliminado", message: "Plantilla eliminada correctamente." });
    };

    const inactiveCount = Array.isArray(campaignTemplates)
        ? campaignTemplates.filter((template) => template?.active === false).length
        : 0;

    return (
        <div className="flex h-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
            <CampaignsSidebar
                campaignTemplates={campaignTemplates}
                visibleTemplates={visibleTemplates}
                senders={campaignsProps?.senders || []}
                selectedTplId={selectedTplId}
                inactiveCount={inactiveCount}
                viewFilter={viewFilter}
                onSelectTemplate={handleSelectTemplate}
                onAddTemplate={addTemplate}
                onOpenSenderManager={() => setShowSendersManager(true)}
                onViewFilterChange={handleViewFilterChange}
                onToggleStatus={handleToggleStatus}
            />

            {editingTpl ? (
                <CampaignEditorForm
                    editingTpl={editingTpl}
                    hasUnsavedChanges={hasUnsavedChanges}
                    senders={campaignsProps?.senders || []}
                    isLoadingSenders={campaignsProps?.isLoadingSenders}
                    onFieldChange={handleFieldChange}
                    onDynamicContentChange={handleDynamicContentChange}
                    onSaveTemplate={handleSaveTemplateFinal}
                    onDeleteTemplate={handleDeleteTemplateFinal}
                    onUseTemplate={handleUseTemplate}
                    ctas={campaignsProps?.ctas || []}
                    isLoadingCtas={campaignsProps?.isLoadingCtas}
                    onApplyCta={handleApplyCta}
                    onClearCta={handleClearCta}
                    onOpenCtasManager={() => setShowCtasManager(true)}
                    onToggleStatus={() => handleToggleStatus(editingTpl)}
                />
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">Editor de Campañas</h3>
                    <p className="max-w-sm text-sm">Selecciona una plantilla de la barra lateral izquierda para editarla o crea una nueva para empezar de cero.</p>
                </div>
            )}

            {showCtasManager && (
                <CtasManagerModal
                    isOpen={showCtasManager}
                    onClose={() => setShowCtasManager(false)}
                    onUpdate={handleRefresh}
                    setNotification={setNotification}
                    setConfirmProps={setConfirmProps}
                    closeConfirm={closeConfirm}
                />
            )}

            {showSendersManager && (
                <SendersManagerModal
                    isOpen={showSendersManager}
                    onClose={() => setShowSendersManager(false)}
                    onUpdate={() => {
                        if (typeof campaignsProps?.fetchSenders === "function") {
                            campaignsProps.fetchSenders();
                        }
                    }}
                />
            )}
        </div>
    );
};

export default Campaigns;
