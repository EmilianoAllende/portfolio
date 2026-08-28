import { useState, useMemo, useEffect, useCallback } from "react";
import ZimbraFilters from "./ZimbraFilters";
import ZimbraEmailList from "./ZimbraEmailList";
import ZimbraEmailModal from "./ZimbraEmailModal";
import Pagination from "../shared/Pagination";
import {
    fetchZimbraEmails,
    matchEmailToOrg,
    normalizeLicitaValue,
    normalizeMMIUserValue,
} from "./zimbraUtils";
import apiClient from "../../api/apiClient";
import {
    ESTADOS_CLIENTE,
    normalizeLocationValue,
    normalizeString,
    getOrganizationMunicipio,
    PROVINCIAS_POR_COMUNIDAD,
    getEntityType,
} from "../../utils/organizationUtils";

const ZimbraView = ({ organizaciones = [] }) => {
    // Datos
    const [emails, setEmails] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [lastRefreshLabel, setLastRefreshLabel] = useState(null);

    // Modal
    const [selectedEmail, setSelectedEmail] = useState(null);

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);

    // Filtros (mismos nombres que useOrganizationList)
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("todos");
    const [filterType, setFilterType] = useState("todos");
    const [filterSubType, setFilterSubType] = useState("todos");
    const [filterClase, setFilterClase] = useState("todos");
    const [filterComunidad, setFilterComunidad] = useState("todos");
    const [filterIsla, setFilterIsla] = useState("todos");
    const [filterMunicipio, setFilterMunicipio] = useState([]);
    const [filterUsuarioMMI, setFilterUsuarioMMI] = useState("todos");
    const [filterLicita, setFilterLicita] = useState("todos");
    const [filterSuscripcion, setFilterSuscripcion] = useState("todos");
    const [filterFrecuencia, setFilterFrecuencia] = useState("todas");

    const loadEmails = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchZimbraEmails();
            setEmails(Array.isArray(data) ? data : []);
            setLastRefreshLabel("ahora mismo");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadEmails(); }, [loadEmails]);

    // Volver a página 1 cuando cambia cualquier filtro
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus, filterType, filterSubType, filterClase,
        filterComunidad, filterIsla, filterMunicipio,
        filterUsuarioMMI, filterLicita, filterSuscripcion, filterFrecuencia]);

    // Enriquece cada correo con la organización que hace match por fromEmail → org.id
    const enrichedEmails = useMemo(
        () => emails.map((email) => ({
            ...email,
            matchedOrg: matchEmailToOrg(email.fromEmail, organizaciones),
        })),
        [emails, organizaciones]
    );

    // Filtrado — replica la lógica exacta de useOrganizationList
    const filteredEmails = useMemo(() => {
        const isListaBlancaCanarias = filterStatus === ESTADOS_CLIENTE.LISTA_BLANCA;
        const normalizedMunicipioFilters = Array.isArray(filterMunicipio)
            ? filterMunicipio.map((m) => normalizeString(m)).filter(Boolean)
            : [];
        const normFilterType = normalizeString(filterType);
        const normFilterSubType = normalizeString(filterSubType);

        return enrichedEmails.filter((email) => {
            const org = email.matchedOrg;

            // Búsqueda libre sobre remitente y asunto del correo
            if (searchTerm) {
                const tokens = normalizeString(searchTerm)
                    .split(",").map((t) => t.trim()).filter(Boolean);
                const searchable = normalizeString(
                    [email.from, email.fromEmail, email.subject].join(" ")
                );
                if (tokens.length > 0 && !tokens.some((t) => searchable.includes(t))) return false;
            }

            // Correos sin match → tratados como PENDIENTE para el filtro de estado
            if (filterStatus !== "todos") {
                const effectiveStatus = org ? org.estado_cliente : ESTADOS_CLIENTE.PENDIENTE;
                if (effectiveStatus !== filterStatus) return false;
            }

            // Cualquier filtro de atributo activo descarta correos sin org match
            const anyOrgFilterActive =
                filterType !== "todos" ||
                filterSubType !== "todos" ||
                (filterClase && filterClase !== "todos") ||
                filterComunidad !== "todos" ||
                filterIsla !== "todos" ||
                normalizedMunicipioFilters.length > 0 ||
                filterUsuarioMMI !== "todos" ||
                filterLicita !== "todos" ||
                filterSuscripcion !== "todos" ||
                (filterFrecuencia && filterFrecuencia !== "todas");

            if (!org) return !anyOrgFilterActive;

            // Tipo / Subtipo / Clase
            const tipoEntidad = org.tipo_entidad || getEntityType(org);
            const orgTypes = String(tipoEntidad || "")
                .split(",").map((t) => normalizeString(t.trim())).filter(Boolean);
            const orgSubTypes = String(org.sub_tipo_entidad || "")
                .split(",").map((t) => normalizeString(t.trim())).filter(Boolean);

            let matchesType = true;
            let matchesSubType = true;
            let matchesClase = true;
            let matchIslaOverride = null;

            if (isListaBlancaCanarias && filterType !== "todos") {
                matchesType = orgTypes.some(
                    (t) => t === normFilterType || t.startsWith(normFilterType)
                );
                if (filterSubType !== "todos") {
                    if (filterType === "cabildos" && filterSubType.startsWith("cabildo ")) {
                        const isla = filterSubType.replace("cabildo ", "");
                        matchIslaOverride = normalizeLocationValue(org.isla) === normalizeLocationValue(isla);
                        matchesSubType = true;
                    } else if (filterType === "ayuntamientos" && normFilterSubType === "todos los ayuntamientos (sin mancomunidades)") {
                        matchesSubType = !orgSubTypes.some((t) => t.includes("mancomunidad"));
                    } else if (filterType === "ayuntamientos" && filterSubType.startsWith("ayuntamientos ")) {
                        const isla = filterSubType.replace("ayuntamientos ", "");
                        matchIslaOverride = normalizeLocationValue(org.isla) === normalizeLocationValue(isla);
                        matchesSubType = true;
                    } else {
                        matchesSubType = orgSubTypes.some(
                            (t) => t === normFilterSubType || t.replace(/s$/, "") === normFilterSubType.replace(/s$/, "")
                        );
                    }
                }
                if (filterClase && filterClase !== "todos") {
                    const normFilterClase = normalizeString(filterClase);
                    const orgClases = String(org.clase_entidad || "")
                        .split(",").map((t) => normalizeString(t.trim())).filter(Boolean);
                    matchesClase = orgClases.some(
                        (t) => t === normFilterClase || t.replace(/s$/, "") === normFilterClase.replace(/s$/, "")
                    );
                }
            } else {
                matchesType = filterType === "todos" ? true :
                    orgTypes.some((t) => t === normFilterType || t.startsWith(normFilterType));
                matchesSubType = filterSubType === "todos" ? true :
                    orgSubTypes.some((t) => t === normFilterSubType || t.replace(/s$/, "") === normFilterSubType.replace(/s$/, ""));
            }

            const normalizedOrgIsla = normalizeLocationValue(org.isla);
            const matchesComunidad = filterComunidad === "todos" ? true :
                (PROVINCIAS_POR_COMUNIDAD[filterComunidad]?.map(normalizeLocationValue).includes(normalizedOrgIsla) ?? false);
            const matchesIsla = matchIslaOverride !== null ? matchIslaOverride :
                filterIsla === "todos" ? true :
                normalizedOrgIsla === normalizeLocationValue(filterIsla);

            const normalizedOrgMunicipio = normalizeString(getOrganizationMunicipio(org));
            const matchesMunicipio = normalizedMunicipioFilters.length === 0 ? true :
                normalizedMunicipioFilters.includes(normalizedOrgMunicipio);

            const normalizedSuscripcion = normalizeString(org.suscripcion || "inactiva");
            const matchesSuscripcion = filterSuscripcion === "todos" ? true :
                normalizedSuscripcion === normalizeString(filterSuscripcion);

            const normalizedMMIUser = normalizeMMIUserValue(org.es_usuario_mmi);
            const matchesMMIUser = filterUsuarioMMI === "todos" ? true :
                normalizedMMIUser === filterUsuarioMMI;

            const normalizedLicita = normalizeLicitaValue(org.licita_medios);
            const matchesLicita = filterLicita === "todos" ? true :
                normalizedLicita === filterLicita;

            let matchesFrecuencia = true;
            if (filterFrecuencia && filterFrecuencia !== "todas") {
                const rawFreq = org.frecuencia;
                const normalizedFreq = (rawFreq === "alta" || rawFreq === "media" || rawFreq === "baja")
                    ? rawFreq : "sin_datos";
                matchesFrecuencia = normalizedFreq === filterFrecuencia;
            }

            return matchesType && matchesSubType && matchesClase &&
                matchesComunidad && matchesIsla && matchesMunicipio &&
                matchesSuscripcion && matchesMMIUser && matchesLicita && matchesFrecuencia;
        });
    }, [
        enrichedEmails, searchTerm,
        filterStatus, filterType, filterSubType, filterClase,
        filterComunidad, filterIsla, filterMunicipio,
        filterUsuarioMMI, filterLicita, filterSuscripcion, filterFrecuencia,
    ]);

    const paginatedEmails = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredEmails.slice(start, start + itemsPerPage);
    }, [filteredEmails, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredEmails.length / itemsPerPage);

    const isClean =
        !searchTerm &&
        filterStatus === "todos" &&
        filterType === "todos" &&
        filterSubType === "todos" &&
        filterClase === "todos" &&
        filterComunidad === "todos" &&
        filterIsla === "todos" &&
        (!Array.isArray(filterMunicipio) || filterMunicipio.length === 0) &&
        filterUsuarioMMI === "todos" &&
        filterLicita === "todos" &&
        filterSuscripcion === "todos" &&
        (!filterFrecuencia || filterFrecuencia === "todas");

    const handleClearFilters = () => {
        setSearchTerm("");
        setFilterStatus("todos");
        setFilterType("todos");
        setFilterSubType("todos");
        setFilterClase("todos");
        setFilterComunidad("todos");
        setFilterIsla("todos");
        setFilterMunicipio([]);
        setFilterUsuarioMMI("todos");
        setFilterLicita("todos");
        setFilterSuscripcion("todos");
        setFilterFrecuencia("todas");
    };

    const handleSelectEmail = (email) => {
        setSelectedEmail(email);
        if (!email.isRead) {
            setEmails((prev) =>
                prev.map((e) => e.id === email.id ? { ...e, isRead: true } : e)
            );
            setSelectedEmail((prev) => prev?.id === email.id ? { ...prev, isRead: true } : prev);
            apiClient.updateNotaStatus(email.id, true).catch((err) =>
                console.warn("No se pudo actualizar status en BD:", err)
            );
        }
    };

    const handleToggleRead = (email, newStatus) => {
        setEmails((prev) =>
            prev.map((e) => e.id === email.id ? { ...e, isRead: newStatus } : e)
        );
        setSelectedEmail((prev) => prev?.id === email.id ? { ...prev, isRead: newStatus } : prev);
        apiClient.updateNotaStatus(email.id, newStatus).catch((err) =>
            console.warn("No se pudo actualizar status en BD:", err)
        );
    };

    const sinClasificarUnread = enrichedEmails.filter(
        (e) => !e.matchedOrg && !e.isRead
    ).length;

    return (
        <div className="max-w-full mx-auto p-3 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl ring-1 ring-gray-900/5 dark:ring-white/10 overflow-hidden">

                {/* Cabecera */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/60 backdrop-blur-md">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                            Bandeja espejo — MailDash CRM
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Correos entrantes Zimbra cruzados con el CRM.
                        </p>
                    </div>
                    <div className="mt-3 sm:mt-0 flex items-center gap-3">
                        {lastRefreshLabel && (
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-700">
                                Sinc: {lastRefreshLabel}
                            </span>
                        )}
                        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                            Hoy · {emails.length} correos
                        </span>
                    </div>
                </div>

                {/* Filtros */}
                <div className="border-b border-gray-100 dark:border-gray-800">
                    <ZimbraFilters
                        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                        filterStatus={filterStatus} setFilterStatus={setFilterStatus}
                        filterType={filterType} setFilterType={setFilterType}
                        filterSubType={filterSubType} setFilterSubType={setFilterSubType}
                        filterClase={filterClase} setFilterClase={setFilterClase}
                        filterComunidad={filterComunidad} setFilterComunidad={setFilterComunidad}
                        filterIsla={filterIsla} setFilterIsla={setFilterIsla}
                        filterMunicipio={filterMunicipio} setFilterMunicipio={setFilterMunicipio}
                        filterSuscripcion={filterSuscripcion} setFilterSuscripcion={setFilterSuscripcion}
                        filterUsuarioMMI={filterUsuarioMMI} setFilterUsuarioMMI={setFilterUsuarioMMI}
                        filterLicita={filterLicita} setFilterLicita={setFilterLicita}
                        filterFrecuencia={filterFrecuencia} setFilterFrecuencia={setFilterFrecuencia}
                        handleClearFilters={handleClearFilters}
                        isClean={isClean}
                        onRefresh={loadEmails}
                        isLoading={isLoading}
                        filteredCount={filteredEmails.length}
                        totalCount={emails.length}
                        lastRefreshLabel={null}
                        organizaciones={organizaciones}
                    />
                </div>

                {/* Lista de correos */}
                <div className="p-2">
                    <ZimbraEmailList
                        emails={paginatedEmails}
                        onSelectEmail={handleSelectEmail}
                        selectedEmailId={selectedEmail?.id}
                        isLoading={isLoading}
                        onToggleRead={handleToggleRead}
                    />
                </div>

                {/* Footer: paginación */}
                <div className="flex flex-col sm:flex-row items-center justify-between py-3 px-4 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 gap-4 sm:gap-0 bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="flex items-center flex-wrap gap-4">
                        <span>
                            Mostrando{" "}
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {filteredEmails.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
                            </span>
                            –
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {Math.min(currentPage * itemsPerPage, filteredEmails.length)}
                            </span>
                            {" "}de{" "}
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {filteredEmails.length}
                            </span>
                        </span>

                        <div className="flex items-center gap-2 bg-white dark:bg-gray-700 rounded-lg px-2 py-1 border border-gray-200 dark:border-gray-600 shadow-sm">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Ver:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                className="bg-transparent border-none text-sm font-medium text-gray-700 dark:text-gray-200 focus:ring-0 cursor-pointer outline-none py-0 pl-0 pr-6 dark:bg-gray-700"
                            >
                                <option className="text-black bg-white dark:text-white dark:bg-gray-800" value={25}>25</option>
                                <option className="text-black bg-white dark:text-white dark:bg-gray-800" value={50}>50</option>
                                <option className="text-black bg-white dark:text-white dark:bg-gray-800" value={100}>100</option>
                                <option className="text-black bg-white dark:text-white dark:bg-gray-800" value={200}>200</option>
                            </select>
                        </div>

                        {sinClasificarUnread > 0 && (
                            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                                {sinClasificarUnread} sin clasificar pendientes
                            </span>
                        )}
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>

            {/* Modal de lectura */}
            {selectedEmail && (
                <ZimbraEmailModal
                    email={selectedEmail}
                    onClose={() => setSelectedEmail(null)}
                    onToggleRead={handleToggleRead}
                />
            )}
        </div>
    );
};

export default ZimbraView;
