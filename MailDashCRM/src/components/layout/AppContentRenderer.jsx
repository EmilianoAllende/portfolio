/* eslint-disable no-unused-vars */
import React, { useCallback, Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

// Imports dinámicos para Code-Splitting (Carga Diferida)
const Dashboard = lazy(() => import("./Dashboard"));
const UserAnalytics = lazy(() => import("./UserAnalytics"));
const OrganizationList = lazy(() => import("../organization/OrganizationList"));
const OrganizationDetail = lazy(() => import("../organization/OrganizationDetail"));
const Campaigns = lazy(() => import("../campaigns/Campaigns"));
const ContactEditor = lazy(() => import("../editor-tabs/ContactEditor"));
const UserAdmin = lazy(() => import("../users/UserAdmin"));
const Profile = lazy(() => import("../users/Profile"));
const CampaignHistory = lazy(() => import("../campaigns/CampaignHistory"));
const EmailMarketingView = lazy(() => import("../emailmarketing/EmailMarketingView"));
const EmailAdjudicatariosView = lazy(() => import("../emailadjudicatarios/EmailAdjudicatariosView"));
const CreateOrganizationAdmin = lazy(() => import("../organization/CreateOrganizationAdmin"));
const EmailHistoryDashboard = lazy(() => import("../campaigns/EmailHistoryDashboard"));
const MarkoBotShell = lazy(() => import("../marko/MarkoBotShell"));
const MediaFollowupView = lazy(() => import("../media-followup/MediaFollowupView"));
const ZimbraView = lazy(() => import("../zimbra-view/ZimbraView"));

const SuspenseLoader = () => (
    <div className="flex h-full w-full items-center justify-center p-8 text-blue-600">
        <Loader2 className="animate-spin h-10 w-10" />
        <span className="ml-3 text-lg font-medium text-slate-600 dark:text-slate-300">Cargando vista...</span>
    </div>
);

const AppContentRenderer = (props) => {
    const {
        activeView,
        setActiveView,
        organizaciones,
        handleRefresh,
        isLoading,
        error,
        isSaving,
        setNotification,
        setConfirmProps,
        closeConfirm,
        openEditor,
        handleOpenCampaignModal,
        saveContact,
        selectedOrg,
        setSelectedOrg,
        campaignTemplates,
        handleSaveTemplate,
        handleDeleteTemplate,
        handleAddTemplate,
        handleToggleCampaignStatus,
        selectedCampaignId,
        setSelectedCampaignId,
        campanasActivas,
        metricas,
        estadosData,
        islasData,
        sectoresData,
        currentUser,
        historyData,
        isHistoryLoading,
        refreshHistory,
    } = props;

    const handleBack = useCallback(() => {
        setSelectedOrg(null);
        setActiveView("listado");
    }, [setSelectedOrg, setActiveView]);

    const renderView = () => {
        switch (activeView) {
            case "dashboard":
                return (
                    <Dashboard
                        metricas={metricas}
                        estadosData={estadosData}
                        islasData={islasData}
                        sectoresData={sectoresData}
                    />
                );

            case "perfil":
                return (
                    <Profile
                        currentUser={currentUser}
                        setNotification={setNotification}
                    />
                );

            case "user_analytics":
                return (
                    <UserAnalytics
                        organizaciones={props.organizacionesApi || organizaciones}
                        onRefreshMetrics={handleRefresh}
                        isRefreshingMetrics={isLoading}
                    />
                );

            case "listado":
                return <OrganizationList {...props} />;

            case "email_history":
                return <EmailHistoryDashboard />;

            case "detalle":
                return (
                    <OrganizationDetail
                        selectedOrg={selectedOrg}
                        setSelectedOrg={setSelectedOrg}
                        openEditModal={openEditor}
                        setShowCampaignModal={() => handleOpenCampaignModal(selectedOrg)}
                        selectedCampaignId={selectedCampaignId}
                        setNotification={setNotification}
                        setConfirmProps={setConfirmProps}
                        closeConfirm={closeConfirm}
                        onSelectCampaignRequired={() => {
                            setNotification({
                                type: "warning",
                                title: "Campaña Requerida",
                                message:
                                    "Por favor, selecciona una campaña en el listado antes de enviar un email.",
                            });
                        }}
                        onBack={handleBack}
                        onRefresh={handleRefresh}
                        scrollToContactado={props.scrollToContactado}
                    />
                );

            case "editor":
                return (
                    <ContactEditor
                        selectedOrg={selectedOrg}
                        onSave={saveContact}
                        onCancel={handleBack}
                        isSaving={isSaving}
                        setConfirmProps={setConfirmProps}
                        closeConfirm={closeConfirm}
                        onBack={handleBack}
                    />
                );

            case "campanas":
                return (
                    <Campaigns
                        campaignTemplates={campaignTemplates}
                        onSelectTemplateForSend={setSelectedCampaignId}
                        setNotification={setNotification}
                        setConfirmProps={setConfirmProps}
                        closeConfirm={closeConfirm}
                        onSaveTemplate={handleSaveTemplate}
                        onDeleteTemplate={handleDeleteTemplate}
                        onAddTemplate={handleAddTemplate}
                        onToggleCampaignStatus={handleToggleCampaignStatus}
                        handleRefresh={handleRefresh}
                        campaignsProps={{
                            senders: props.senders,
                            isLoadingSenders: props.isLoadingSenders,
                            fetchSenders: props.fetchSenders,
                            ctas: props.ctas,
                            isLoadingCtas: props.isLoadingCtas
                        }}
                    />
                );

            case "historial":
                return (
                    <CampaignHistory
                        campanasActivas={campanasActivas}
                        organizaciones={organizaciones}
                        campaignTemplates={campaignTemplates}
                        historyData={historyData}
                        isLoading={isHistoryLoading}
                        onRefresh={refreshHistory}
                    />
                );

            case "admin":
                return (
                    <UserAdmin
                        currentUser={currentUser}
                        setNotification={setNotification}
                        setConfirmProps={setConfirmProps}
                        closeConfirm={closeConfirm}
                    />
                );

            case "admin_org_create":
                return (
                    <CreateOrganizationAdmin
                        setNotification={setNotification}
                    />
                );

            case "media_followup":
                return (
                    <MediaFollowupView
                        setNotification={setNotification}
                        setConfirmProps={setConfirmProps}
                        closeConfirm={closeConfirm}
                        openEditor={openEditor}
                        saveContact={saveContact}
                        isSaving={isSaving}
                        availableSenders={props.senders}
                        isLoadingSenders={props.isLoadingSenders}
                        onRefreshSenders={props.fetchSenders}
                        organizaciones={organizaciones}
                    />
                );

            case "emailmarketing":
                return <EmailMarketingView />;

            case "email_adjudicatarios":
                return (
                    <EmailAdjudicatariosView 
                        isAuthenticated={props.isAuthenticated} 
                        setNotification={setNotification} 
                    />
                );

            case "amarko":
                return <MarkoBotShell />;

            case "zimbra":
                return <ZimbraView organizaciones={organizaciones} />;

            default:
                return (
                    <div className="flex items-center justify-center h-full p-3">
                        <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                            <p>Por favor, selecciona una vista.</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <Suspense fallback={<SuspenseLoader />}>
            {renderView()}
        </Suspense>
    );
};

export default AppContentRenderer;
