import React from 'react';
import { Search, Zap, RefreshCw, RotateCcw } from "lucide-react";

const OrganizationSearchActions = ({
    searchTerm, setSearchTerm,
    selectedCampaignId, setSelectedCampaignId,
    groupedCampaignTemplates,
    startCallCenterMode, getSelectedOrgs, isCallCenterDisabled,
    handleClearFilters, isClean,
    onRefresh, isLoading,
    handleDownload
}) => {
    return (
        <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 min-w-0">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Buscar (admite varios emails separados por comas)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm("")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center group">
                        <span className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors">
                            ×
                        </span>
                    </button>
                )}
            </div>

            <div className="w-64 flex-shrink-0">
                <select
                    value={selectedCampaignId || ""}
                    onChange={(e) => setSelectedCampaignId(e.target.value || null)}
                    className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${selectedCampaignId
                        ? "border-pink-500 bg-pink-200 dark:bg-pink-900/85 dark:border-pink-500"
                        : "border-gray-300 dark:border-gray-600"
                        }`}>
                    <option value="">Seleccionar Campaña</option>
                        {groupedCampaignTemplates.map((group) => (
                            <optgroup key={group.key} label={`${group.label} (${group.campaigns.length})`}>
                                {group.campaigns.map((campaign) => (
                                <option key={campaign.id} value={campaign.id}>
                                    {campaign.title}
                                </option>
                                ))}
                            </optgroup>
                    ))}
                </select>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
                {startCallCenterMode && (
                    <button
                        onClick={() => startCallCenterMode(getSelectedOrgs())}
                        disabled={isCallCenterDisabled || !selectedCampaignId}
                        className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
                        title={
                            isCallCenterDisabled
                                ? "Selecciona al menos 2 organizaciones para continuar."
                                : !selectedCampaignId
                                    ? "Debes seleccionar una campaña primero"
                                    : `Iniciar Modo Call Center con ${getSelectedOrgs().length} organizaciones`
                        }>
                        <Zap className="h-4 w-4" />
                        Modo Call Center ({getSelectedOrgs().length})
                    </button>
                )}
                <button
                    onClick={handleClearFilters}
                    disabled={isClean}
                    className={`p-2 text-sm font-medium rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isClean
                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600 dark:border-gray-700"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                        }`}
                    title="Limpiar todos los filtros">
                    <RotateCcw className="h-5 w-5" />
                </button>
                <button
                    onClick={onRefresh}
                    className="p-2 text-sm font-medium text-white bg-blue-600 rounded-lg border border-transparent hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
                    title="Actualizar datos">
                    <RefreshCw
                        className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`}
                    />
                </button>
                <button
                    onClick={handleDownload}
                    className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors shadow-sm"
                    title="Descargar registros filtrados en Excel"
                >
                    Descargar registros
                </button>
            </div>
        </div>
    );
};

export default OrganizationSearchActions;
