import React from "react";
import OrganizationFilters from "./OrganizationFilters";
import OrganizationTable from "./OrganizationTable";
import { ESTADOS_CLIENTE } from "../../utils/organizationUtils";
import { useOrganizationList } from "../../hooks/useOrganizationList";

const OrganizationList = (props) => {
    const {
        searchTerm, setSearchTerm,
        selectedOrgIds, setSelectedOrgIds,
        selectedOrg, setSelectedOrg,
        lastRefreshLabel,
        ITEMS_PER_PAGE,
        setItemsPerPage,
        filteredOrgs,
        getSelectedOrgs,
        isCallCenterDisabled,
        handleCampaignClick,
        handleClearFilters,
        isClean,
        filterSubType, setFilterSubType,
        filterClase, setFilterClase,
        isLoading,
        sortConfig,
        handleSort
    } = useOrganizationList({
        ...props,
        filterFrecuencia: props.filterFrecuencia,
        setFilterFrecuencia: props.setFilterFrecuencia
    });

    const {
        openEditor, viewDetail, currentPage, setCurrentPage, onRefresh,
        startCallCenterMode, campaignTemplates, selectedCampaignId, setSelectedCampaignId,
        filterStatus, setFilterStatus, filterType, setFilterType, filterComunidad, setFilterComunidad,
        filterIsla, setFilterIsla, filterMunicipio, setFilterMunicipio, filterSuscripcion, setFilterSuscripcion,
        filterUsuarioMMI, setFilterUsuarioMMI,
        filterLicita, setFilterLicita,
        organizaciones,
        useHardcodedOrganizations,
        handleToggleOrganizationsSource,
        isLocalHardcodedToggleEnabled,
        setNotification,
    } = props;

    const activeTemplate = React.useMemo(() => {
        if (!campaignTemplates || !selectedCampaignId) return null;
        return campaignTemplates.find(t => t.id === selectedCampaignId);
    }, [campaignTemplates, selectedCampaignId]);

    const selectedSenderId = React.useMemo(() => {
        if (!activeTemplate?.builder) return null;
        let builder = activeTemplate.builder;
        if (typeof builder === 'string') {
            try { builder = JSON.parse(builder); } catch (e) { return null; }
        }
        if (!builder?.senderName) return null;
        return {
            id: builder.senderName,
            email: builder.senderEmail,
            displayName: builder.senderName
        };
    }, [activeTemplate]);

    return (
        <div className="max-w-full mx-auto p-3 sm:px-6 lg:px-8 transition-colors duration-300">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl ring-1 ring-gray-900/5 dark:ring-white/10 overflow-hidden">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/60 backdrop-blur-md">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Gestor de Organizaciones
                    </h1>
                    <p className="mt-1 text-base text-gray-500 dark:text-gray-400">
                        Gestión centralizada de clientes, leads y campañas activas.
                    </p>
                </div>

                {isLocalHardcodedToggleEnabled && (
                    <div className="mt-4 sm:mt-0 flex items-center gap-3">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Datos demo locales
                        </span>
                        <button
                            type="button"
                            onClick={handleToggleOrganizationsSource}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${useHardcodedOrganizations ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"}`}
                            title="Alternar entre datos hardcodeados y base de datos"
                            aria-pressed={useHardcodedOrganizations}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useHardcodedOrganizations ? "translate-x-6" : "translate-x-1"}`}
                            />
                        </button>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 min-w-[120px]">
                            {useHardcodedOrganizations ? "Hardcodeadas" : "Base de datos"}
                        </span>
                    </div>
                )}
            </div>

            <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                <OrganizationFilters
                    filterStatus={filterStatus} setFilterStatus={setFilterStatus}
                    filterType={filterType} filterSubType={filterSubType} filterClase={filterClase}
                    setFilterType={setFilterType} setFilterSubType={setFilterSubType} setFilterClase={setFilterClase}
                    filterComunidad={filterComunidad} setFilterComunidad={setFilterComunidad}
                    filterIsla={filterIsla} setFilterIsla={setFilterIsla}
                    filterMunicipio={filterMunicipio} setFilterMunicipio={setFilterMunicipio}
                    filterSuscripcion={filterSuscripcion} setFilterSuscripcion={setFilterSuscripcion}
                    filterUsuarioMMI={filterUsuarioMMI} setFilterUsuarioMMI={setFilterUsuarioMMI}
                    filterLicita={filterLicita} setFilterLicita={setFilterLicita}
                    filterFrecuencia={props.filterFrecuencia} setFilterFrecuencia={props.setFilterFrecuencia}
                    searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                    selectedCampaignId={selectedCampaignId} setSelectedCampaignId={setSelectedCampaignId}
                    handleClearFilters={handleClearFilters} isClean={isClean}
                    onRefresh={onRefresh} isLoading={isLoading}
                    startCallCenterMode={startCallCenterMode} getSelectedOrgs={getSelectedOrgs}
                    isCallCenterDisabled={isCallCenterDisabled} campaignTemplates={campaignTemplates}
                    filteredOrgsLength={filteredOrgs.length} totalOrgsLength={organizaciones.length}
                    lastRefreshLabel={lastRefreshLabel} ESTADOS_CLIENTE={ESTADOS_CLIENTE}
                    organizaciones={organizaciones}
                    filteredOrgs={filteredOrgs}
                    setNotification={setNotification}
                />
            </div>

            <div className="p-2">
                <OrganizationTable
                    filteredOrgs={filteredOrgs}
                    currentPage={currentPage}
                    ITEMS_PER_PAGE={ITEMS_PER_PAGE}
                    setItemsPerPage={setItemsPerPage}
                    selectedOrgIds={selectedOrgIds}
                    setSelectedOrgIds={setSelectedOrgIds}
                    selectedOrg={selectedOrg}
                    setSelectedOrg={setSelectedOrg}
                    viewDetail={viewDetail}
                    openEditModal={openEditor}
                    handleCampaignClick={handleCampaignClick}
                    ESTADOS_CLIENTE={ESTADOS_CLIENTE}
                    isLoading={isLoading}
                    sortConfig={sortConfig}
                    handleSort={handleSort}
                    filterSuscripcion={filterSuscripcion}
                    setScrollToContactado={props.setScrollToContactado}
                    setCurrentPage={setCurrentPage}
                    selectedSenderId={selectedSenderId}
                />
            </div>
        </div>
    </div>
    );
};

export default OrganizationList;
