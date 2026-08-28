/* eslint-disable no-unused-vars */
import React, { useCallback } from "react";

import { useAppState } from "./hooks/useAppState";
import AppContentRenderer from "./components/layout/AppContentRenderer";
import SendCampaignModal from "./components/campaigns/SendCampaignModal";
import AIindicator from "./components/preview/AIindicator";
import Notification from "./components/common/Notification";
import Sidebar from "./components/common/Sidebar";
import ConfirmModal from "./components/common/ConfirmModal";
import LoginScreen from "./components/auth/LoginScreen";
import ErrorBoundary from "./components/common/ErrorBoundary";

const App = () => {
  const state = useAppState();

  const {
    currentUser,
    isAuthenticated,
    handleLoginSuccess,
    handleLogout,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    selectedOrg,
    isLoading,
    error,
    showCampaignModal,
    setShowCampaignModal,
    notification,
    setNotification,
    setConfirmProps,
    confirmProps,
    closeConfirm,
    campaignTemplates,
    selectedCampaignId,
    setSelectedCampaignId,
    handleGeneratePreview,
    handleConfirmAndSend,
    emailPreview,
    setEmailPreview,
    isPreviewLoading,
    isSendingCampaign,
    isTaskLoading,
    isCallCenterMode,
    senders,
    isLoadingSenders,
    fetchSenders,
  } = state;

  const runMediaFollowupLeaveGuard = useCallback(async () => {
    if (state.activeView !== "media_followup") return true;
    const guard = window.__mediaFollowupBeforeLeave;
    if (typeof guard !== "function") return true;
    return await guard();
  }, [state.activeView]);

  const handleGuardedSetActiveView = useCallback(async (nextView) => {
    if (nextView === state.activeView) return;
    const canLeave = await runMediaFollowupLeaveGuard();
    if (!canLeave) return;
    state.setActiveView(nextView);
  }, [runMediaFollowupLeaveGuard, state]);

  const handleGuardedLogout = useCallback(async () => {
    const canLeave = await runMediaFollowupLeaveGuard();
    if (!canLeave) return;
    handleLogout();
  }, [handleLogout, runMediaFollowupLeaveGuard]);

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-200">
      {!isAuthenticated && (
        <ErrorBoundary>
          <LoginScreen onLoginSuccess={handleLoginSuccess} />
        </ErrorBoundary>
      )}
      {isAuthenticated && (
        <>
          <Sidebar
            activeView={state.activeView}
            setActiveView={handleGuardedSetActiveView}
            selectedOrg={selectedOrg}
            onLogout={handleGuardedLogout}
            currentUser={currentUser}
            isCollapsed={isSidebarCollapsed}
            onToggle={() => setIsSidebarCollapsed((prev) => !prev)}
          />
          <main className="flex-1 flex flex-col overflow-y-auto">
            {isLoading && (
              <p className="text-center text-slate-500 dark:text-slate-400 px-8 pt-8 pb-2">
                Cargando organizaciones...
              </p>
            )}
            {error && !isLoading && (
              <p className="text-center text-amber-600 dark:text-amber-400 px-8 pt-2 pb-4">
                La carga de organizaciones terminó con incidencias. Puedes seguir usando la app y cambiar entre base de datos y hardcodeadas.
              </p>
            )}
            <div className="h-full w-full min-h-0">
              <ErrorBoundary>
                <AppContentRenderer {...state} />
              </ErrorBoundary>
            </div>
          </main>

          <SendCampaignModal
            show={showCampaignModal}
            onClose={() => {
              setShowCampaignModal(false);
              setEmailPreview(null);
              setSelectedCampaignId(null);
            }}
            selectedOrg={selectedOrg}
            campaignTemplates={campaignTemplates}
            onGeneratePreview={handleGeneratePreview}
            onConfirmAndSend={handleConfirmAndSend}
            isPreviewLoading={isPreviewLoading}
            isSending={isSendingCampaign}
            emailPreview={emailPreview}
            selectedCampaignId={selectedCampaignId}
            setSelectedCampaignId={setSelectedCampaignId}
            isTaskLoading={isTaskLoading}
            isCallCenterMode={isCallCenterMode}
            setConfirmProps={setConfirmProps}
            onSkipTask={state.handleSkipTask}
            closeConfirm={closeConfirm}
            isFastSendMode={state.isFastSendMode}
            onToggleFastSend={() => state.setIsFastSendMode(!state.isFastSendMode)}
            fastSendStats={state.fastSendStats}
            queueProgress={state.queueProgress}
            availableSenders={senders}
            isLoadingSenders={isLoadingSenders}
            onRefreshSenders={fetchSenders}
            onSenderResolved={state.setSelectedSenderForFlow}
            onCancelQueue={state.handleCancelQueue}
          />
          <ConfirmModal
            show={confirmProps.show}
            title={confirmProps.title}
            message={confirmProps.message}
            onConfirm={confirmProps.onConfirm}
            onCancel={closeConfirm}
            confirmText={confirmProps.confirmText}
            type={confirmProps.type}
          />
          <Notification
            notification={notification}
            onClose={() => setNotification(null)}
          />
        </>
      )}
    </div>
  );
};

export default App;
