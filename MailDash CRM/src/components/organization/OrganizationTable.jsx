import React, { useState, useEffect, useRef } from "react";
import { RefreshCw, ArrowUpDown, ArrowUp, ArrowDown, CheckSquare, ChevronUp, ChevronDown, Trash2, X } from "lucide-react";
import { useOrganizationTableLogic } from "../../hooks/useOrganizationTableLogic";
import OrganizationTableRow from "./OrganizationTableRow";
import Pagination from "../shared/Pagination";

// --- NUEVO COMPONENTE INTEGRADO PARA EL DROPDOWN DE SELECCIÓN ---
const SelectionDropdown = ({
    selectedIds = new Set(),
    allOrganizations = [],
    onDeselect,
    onClearAll
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOrgsDetails = allOrganizations.filter(org =>
        selectedIds.has(org.id)
    );

    const countVisible = selectedOrgsDetails.length;
    const countHidden = selectedIds.size - countVisible;

    if (selectedIds.size === 0) return null;

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`ml-2 flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full transition-all border ${isOpen
                        ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700"
                        : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                    }`}
                title="Ver lista de seleccionados"
            >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>{selectedIds.size} seleccionada{selectedIds.size !== 1 ? "s" : ""}</span>
                {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {isOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-72 md:w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-bottom-left z-50">

                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm">
                        <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider">
                            Selección actual
                        </span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onClearAll();
                                setIsOpen(false);
                            }}
                            className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded transition-colors flex items-center gap-1"
                        >
                            <Trash2 className="w-3 h-3" />
                            Limpiar todo
                        </button>
                    </div>

                    <div className="max-h-64 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-600">
                        {selectedOrgsDetails.length > 0 ? (
                            selectedOrgsDetails.map((org) => (
                                <div
                                    key={org.id}
                                    className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg group transition-colors border-b border-gray-50 dark:border-gray-700/50 last:border-0"
                                >
                                    <div className="min-w-0 flex-1 mr-2">
                                        {/* SOLO NOMBRE (org.organizacion) */}
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                                            {org.organizacion || org.nombre || "Sin nombre"}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeselect(org.id);
                                        }}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all"
                                        title="Quitar de la selección"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-xs text-gray-400 italic">
                                Las organizaciones seleccionadas no son visibles en el filtro actual.
                            </div>
                        )}

                        {countHidden > 0 && (
                            <div className="p-2 text-center text-xs text-gray-400 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                                + {countHidden} organizaciones no listadas aquí
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


const OrganizationTable = ({
    filteredOrgs,
    currentPage,
    ITEMS_PER_PAGE,
    setItemsPerPage,
    selectedOrgIds,
    setSelectedOrgIds,
    selectedOrg,
    setSelectedOrg,
    viewDetail,
    openEditModal,
    handleCampaignClick,
    ESTADOS_CLIENTE,
    isLoading,
    sortConfig,
    handleSort,
    filterSuscripcion,
    setScrollToContactado,
    setCurrentPage,
    selectedSenderId,
}) => {
    const {
        paginatedOrgs,
        areAllOnPageSelected,
        handleSelectAll,
        handleSelectOrg,
        getDisplayContacts,
    } = useOrganizationTableLogic({
        filteredOrgs,
        currentPage,
        ITEMS_PER_PAGE,
        selectedOrgIds,
        setSelectedOrgIds,
        selectedSenderId,
    });


    const headers = [
        { label: "Organización", key: "organizacion", sortable: true },
        { label: "Contacto", key: "contacto", sortable: false },
        { label: "Cargo", key: "cargo", sortable: false },
        { label: "Email / Teléfono", key: "email", sortable: false },
        { label: "Último contacto", key: "ultimo_contacto", sortable: true },
        { label: "Cliente MMI", key: "cliente_mmi", sortable: true },
        { label: "Contacto marketing", key: "contactado_estado", sortable: true },
        ...(filterSuscripcion === "inactiva" ? [{ label: "Razón de Baja", key: "organizacion_baja", sortable: false }] : []),
        { label: "", key: "actions", sortable: false },
    ];


    const getSortIcon = (columnKey) => {
        if (sortConfig?.key !== columnKey) return <ArrowUpDown className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-50" />;
        if (sortConfig.direction === 'asc') return <ArrowUp className="h-3 w-3 text-blue-500" />;
        return <ArrowDown className="h-3 w-3 text-blue-500" />;
    };


    return (
        <div className="mt-2 overflow-hidden border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm backdrop-blur-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700 text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0 z-10">
                        <tr>
                            <th className="py-3 pl-4 pr-2 w-10">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-700"
                                    checked={areAllOnPageSelected}
                                    onChange={handleSelectAll}
                                    disabled={paginatedOrgs.length === 0}
                                />
                            </th>
                            {headers.map((header, i) => (
                                <th
                                    key={i}
                                    className={`py-3 px-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300 select-none ${header.sortable ? 'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group' : ''}`}
                                    onClick={() => header.sortable && handleSort && handleSort(header.key)}
                                >
                                    <div className="flex items-center gap-2">
                                        {header.label}
                                        {header.sortable && getSortIcon(header.key)}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                        {paginatedOrgs.length > 0 ? (
                            paginatedOrgs.map((org) => (
                                <OrganizationTableRow
                                    key={org.id}
                                    org={org}
                                    selected={selectedOrgIds.has(org.id)}
                                    handleSelectOrg={handleSelectOrg}
                                    getDisplayContacts={getDisplayContacts}
                                    ESTADOS_CLIENTE={ESTADOS_CLIENTE}
                                    setSelectedOrg={setSelectedOrg}
                                    viewDetail={viewDetail}
                                    openEditModal={openEditModal}
                                    handleCampaignClick={handleCampaignClick}
                                    showBajaReason={filterSuscripcion === "inactiva"}
                                    setScrollToContactado={setScrollToContactado}
                                    selectedSenderId={selectedSenderId}
                                />
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={headers.length + 1}
                                    className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                                    {isLoading ? (
                                        <div className="flex justify-center items-center">
                                            <RefreshCw className="animate-spin h-5 w-5 mr-2 text-blue-500" />
                                            Cargando organizaciones...
                                        </div>
                                    ) : (
                                        "No se encontraron organizaciones."
                                    )}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>


            {/* --- FOOTER: PAGINACIÓN Y SELECTOR DE CANTIDAD --- */}
            <div className="mt-0 flex flex-col sm:flex-row items-center justify-between py-3 px-4 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 gap-4 sm:gap-0 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex items-center flex-wrap gap-4">
                    <span>
                        Mostrando{" "}
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {filteredOrgs.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}
                        </span>-
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrgs.length)}
                        </span> de <span className="font-semibold text-gray-900 dark:text-gray-100">{filteredOrgs.length}</span>
                    </span>


                    {/* SELECTOR DE ITEMS POR PÁGINA */}
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-700 rounded-lg px-2 py-1 border border-gray-200 dark:border-gray-600 shadow-sm">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Ver:</span>
                        <select
                            value={ITEMS_PER_PAGE}
                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                            className="bg-transparent border-none text-sm font-medium text-gray-700 dark:text-gray-200 focus:ring-0 cursor-pointer outline-none py-0 pl-0 pr-6 dark:bg-gray-700"
                        >
                            <option className="text-black bg-white dark:text-white dark:bg-gray-800" value={25}>25</option>
                            <option className="text-black bg-white dark:text-white dark:bg-gray-800" value={50}>50</option>
                            <option className="text-black bg-white dark:text-white dark:bg-gray-800" value={100}>100</option>
                            <option className="text-black bg-white dark:text-white dark:bg-gray-800" value={200}>200</option>
                        </select>
                    </div>

                    <SelectionDropdown
                        selectedIds={selectedOrgIds}
                        allOrganizations={filteredOrgs}
                        onDeselect={(idToRemove) => {
                            const newSet = new Set(selectedOrgIds);
                            newSet.delete(idToRemove);
                            setSelectedOrgIds(newSet);
                        }}
                        onClearAll={() => setSelectedOrgIds(new Set())}
                    />
                </div>


                <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(filteredOrgs.length / ITEMS_PER_PAGE)}
                    onPageChange={setCurrentPage || (() => { })}
                />
            </div>
        </div>
    );
};


export default OrganizationTable;
