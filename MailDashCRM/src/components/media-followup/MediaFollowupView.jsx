import React from "react";
import { AlertCircle, Mail, RefreshCw } from "lucide-react";
import ContactEditor from "../editor-tabs/ContactEditor";
import { useMediaFollowup } from "./hooks/useMediaFollowup";
import { getFilterSectionTitle } from "./utils/statusUtils";
import MediaFollowupHeader from "./components/MediaFollowupHeader";
import QueueSection from "./components/QueueSection";
import SelectedItemDetail from "./components/SelectedItemDetail";
import EmailPreviewPanel from "./components/EmailPreviewPanel";
import PressModal from "./components/PressModal";
import EditEmailModal from "./components/EditEmailModal";
import EmptyState from "./components/ui/EmptyState";

export default function MediaFollowupView(props) {
    const {
        isLoading, error, activeFilter, selectedId,
        searchQuery, setSearchQuery,
        filteredItems, selectedItem, selectedSender, selectedStatusSummary,
        scheduledSendLabel, scheduleTimestampLabel,
        filterButtons, devTimezone, setDevTimezone,
        openPressModal, setOpenPressModal,
        openEditorModal, setOpenEditorModal,
        openEmailEditModal, setOpenEmailEditModal,
        isUpdatingEnvio,
        isRegenerating, regenerateError, handleRegenerateEmail,
        canEdit, canSend, canDiscard, canDelete, canCopy,
        handleSelectItem, handleFilterChange, handleChangeEnvio,
        handleDeleteEmail, handleSaveEmailModal, handleUnconfirmEnvio,
        loadMediaFollowup,
        setNotification, organizaciones, saveContact, isSaving, availableSenders,
    } = useMediaFollowup(props);

    return (
        <div className="h-full min-h-0 overflow-hidden bg-[var(--bg)] text-[var(--text)]">
            <div className="flex h-full min-h-0 flex-col overflow-hidden">
                <MediaFollowupHeader
                    filterButtons={filterButtons}
                    activeFilter={activeFilter}
                    onFilterChange={handleFilterChange}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    devTimezone={devTimezone}
                    setDevTimezone={setDevTimezone}
                    onRefresh={loadMediaFollowup}
                />

                <div className="flex min-h-0 flex-1 overflow-hidden flex-col lg:flex-row">
                    <aside className="marko-scrollbar w-full lg:w-[360px] shrink-0 overflow-y-auto border-r border-[var(--border)] bg-[var(--bg)] px-3 py-4 lg:border-r">
                        <div className="mb-4 rounded-[10px] border border-[var(--border)] bg-[var(--bg2)] px-3 py-3">
                            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--text3)]">bandeja</div>
                            <p className="mt-2 text-[12px] leading-relaxed text-[var(--text2)]">
                                Prioriza lo pendiente. Cada tarjeta resume el próximo paso y la fecha efectiva en la que saldría el correo.
                            </p>
                        </div>
                        <QueueSection
                            title={getFilterSectionTitle(activeFilter, filteredItems.length)}
                            items={filteredItems}
                            selectedId={selectedId}
                            onSelect={handleSelectItem}
                            devTimezone={devTimezone}
                        />
                    </aside>

                    <section className="marko-scrollbar min-w-0 flex-1 overflow-y-auto border-r border-[var(--border)] bg-[var(--bg)] px-5 py-4 lg:border-r max-h-[calc(100vh-80px)]">
                        {isLoading && <EmptyState icon={RefreshCw} title="Cargando seguimiento de medios" description="Consultando el flujo envios_pendientes para recuperar la bandeja actual." spinning />}
                        {!isLoading && error && <EmptyState icon={AlertCircle} title="No se pudo cargar la bandeja" description={error} />}
                        {!isLoading && !error && !selectedItem && <EmptyState icon={Mail} title="Sin correos disponibles" description="El flujo no devolvió clientes válidos para seguimiento de medios." />}
                        {!isLoading && !error && selectedItem && (
                            <SelectedItemDetail
                                selectedItem={selectedItem}
                                selectedSender={selectedSender}
                                selectedStatusSummary={selectedStatusSummary}
                                scheduledSendLabel={scheduledSendLabel}
                                scheduleTimestampLabel={scheduleTimestampLabel}
                                setOpenPressModal={setOpenPressModal}
                                organizaciones={organizaciones}
                                setOpenEditorModal={setOpenEditorModal}
                            />
                        )}
                    </section>

                    <section className="marko-scrollbar w-full lg:w-[520px] shrink-0 overflow-y-auto bg-[var(--bg)] px-4 py-4 lg:border-l lg:border-[var(--border)]">
                        {!isLoading && !error && selectedItem && (
                            <EmailPreviewPanel
                                selectedItem={selectedItem}
                                selectedSender={selectedSender}
                                selectedStatusSummary={selectedStatusSummary}
                                scheduledSendLabel={scheduledSendLabel}
                                scheduleTimestampLabel={scheduleTimestampLabel}
                                canEdit={canEdit}
                                canSend={canSend}
                                canDiscard={canDiscard}
                                canDelete={canDelete}
                                canCopy={canCopy}
                                isUpdatingEnvio={isUpdatingEnvio}
                                isRegenerating={isRegenerating}
                                regenerateError={regenerateError}
                                onRegenerateEmail={handleRegenerateEmail}
                                onChangeEnvio={handleChangeEnvio}
                                onDeleteEmail={handleDeleteEmail}
                                onUnconfirmEnvio={handleUnconfirmEnvio}
                                onOpenEmailEditModal={() => setOpenEmailEditModal(true)}
                                onOpenPressModal={() => setOpenPressModal(true)}
                                setNotification={setNotification}
                            />
                        )}
                    </section>
                </div>
            </div>

            {openEditorModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 md:px-8 py-4 md:py-8">
                    <div className="relative w-full h-full max-w-6xl overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-2xl">
                        <ContactEditor
                            selectedOrg={openEditorModal}
                            onSave={async (formData) => { if (saveContact) await saveContact(formData); setOpenEditorModal(false); }}
                            onCancel={() => setOpenEditorModal(false)}
                            isSaving={isSaving}
                            onBack={() => setOpenEditorModal(false)}
                        />
                    </div>
                </div>
            )}

            {openEmailEditModal && selectedItem && (
                <EditEmailModal
                    selectedItem={selectedItem}
                    availableSenders={availableSenders}
                    onClose={() => setOpenEmailEditModal(false)}
                    onSave={handleSaveEmailModal}
                    isSaving={isUpdatingEnvio}
                />
            )}

            {openPressModal && selectedItem && (
                <PressModal selectedItem={selectedItem} onClose={() => setOpenPressModal(false)} />
            )}
        </div>
    );
}
