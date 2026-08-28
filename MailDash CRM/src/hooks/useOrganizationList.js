// src/hooks/useOrganizationList.js
import { useState, useMemo, useEffect, useCallback } from "react";
import {
    getEntityType,
    ESTADOS_CLIENTE,
    getLastMailContact,
    parseDate,
    normalizeLocationValue,
    normalizeString,
    PROVINCIAS_POR_COMUNIDAD,
    getOrganizationMunicipio,
} from "../utils/organizationUtils";
import { getElapsedString } from "../utils/dateUtils";

export const useOrganizationList = (props) => {
    const {
        organizaciones,
        selectedOrg,
        setSelectedOrg,
        filterStatus,
        setFilterStatus,
        filterType,
        setFilterType,
        filterComunidad,
        setFilterComunidad,
        filterIsla,
        setFilterIsla,
        filterMunicipio,
        setFilterMunicipio,
        filterSuscripcion,
        setFilterSuscripcion,
        filterUsuarioMMI,
        setFilterUsuarioMMI,
        filterLicita,
        setFilterLicita,
        filterFrecuencia,
        setFilterFrecuencia,
        lastRefreshTs,
        openCampaign,
        setCurrentPage,
        campaignTemplates,
        selectedCampaignId,
        setSelectedCampaignId,
        setConfirmProps,
        closeConfirm,
        showCampaignModal,
        isCallCenterMode,
    } = props;

    const [itemsPerPage, setItemsPerPage] = useState(25);

    const [searchTerm, setSearchTerm] = useState("");
    
    // Selección persistente
    const [selectedOrgIds, setSelectedOrgIds] = useState(new Set());

    const [lastRefreshLabel, setLastRefreshLabel] = useState("");
    const [filterSubType, setFilterSubType] = useState("todos");
    const [filterClase, setFilterClase] = useState("todos");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'desc' });

    const normalizeLicitaValue = useCallback((rawValue) => {
        if (rawValue === 1 || rawValue === "1" || rawValue === true || rawValue === "true") {
            return "1";
        }

        if (
            rawValue === 0
            || rawValue === "0"
            || rawValue === false
            || rawValue === "false"
        ) {
            return "0";
        }

        if (
            rawValue === null
            || rawValue === undefined
            || rawValue === "null"
            || (typeof rawValue === "string" && rawValue.trim() === "")
        ) {
            return "sin_datos";
        }

        return "sin_datos";
    }, []);

    const normalizeMMIUserValue = useCallback((rawValue) => {
        if (rawValue === true || rawValue === "true" || rawValue === 1 || rawValue === "1") {
            return "true";
        }

        if (rawValue === false || rawValue === "false" || rawValue === 0 || rawValue === "0") {
            return "false";
        }

        if (
            rawValue === null
            || rawValue === undefined
            || rawValue === "null"
            || (typeof rawValue === "string" && rawValue.trim() === "")
        ) {
            return "sin_datos";
        }

        return "sin_datos";
    }, []);

    const compareTextValues = useCallback((left, right, direction) => {
        const normalizedLeft = normalizeString(left);
        const normalizedRight = normalizeString(right);
        const result = normalizedLeft.localeCompare(normalizedRight, "es", { sensitivity: "base" });
        return direction === "asc" ? result : -result;
    }, []);

    const getMMISortRank = useCallback((rawValue) => {
        const normalizedValue = normalizeMMIUserValue(rawValue);
        if (normalizedValue === "true") return 2;
        if (normalizedValue === "false") return 1;
        return 0;
    }, [normalizeMMIUserValue]);

    const getMarketingContactRank = useCallback((org) => {
        return org?.contactado_estado === "contactado" ? 1 : 0;
    }, []);

    const normalizedMunicipioFilters = useMemo(() => {
        if (!Array.isArray(filterMunicipio)) {
            return [];
        }

        return filterMunicipio
            .map((municipio) => normalizeString(municipio))
            .filter(Boolean);
    }, [filterMunicipio]);

    // --- Obtener senderId de la campaña seleccionada ---
    const activeTemplate = useMemo(() => {
        if (!campaignTemplates || !selectedCampaignId) return null;
        return campaignTemplates.find(t => t.id === selectedCampaignId);
    }, [campaignTemplates, selectedCampaignId]);
    
    const selectedSenderId = useMemo(() => {
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

    useEffect(() => {
        if (!lastRefreshTs) return setLastRefreshLabel("");
        const update = () => setLastRefreshLabel(getElapsedString(lastRefreshTs));
        update();
        const id = setInterval(update, 60000);
        return () => clearInterval(id);
    }, [lastRefreshTs]);

    // 1. Filtrado
    const filteredOrgsRaw = useMemo(() => {
        const normalizedSearchTerm = normalizeString(searchTerm);
        const searchTokens = normalizedSearchTerm
            .split(",")
            .map((token) => token.trim())
            .filter(Boolean);

        return organizaciones.filter((org) => {
            const searchableText = normalizeString([
                org.organizacion || "",
                org.nombre || "",
                org.id || "",
                org.nombres_org || "",
            ]
                .join(" "));

            const matchesSearch =
                searchTokens.length === 0
                    ? true
                    : searchTokens.some((token) => searchableText.includes(token));

            const matchesStatus = filterStatus === "todos" ? true : org.estado_cliente === filterStatus;
            const tipoEntidad = org.tipo_entidad || getEntityType(org);
            const normFilterType = normalizeString(filterType);
            const orgTypes = String(tipoEntidad || "").split(",").map(t => normalizeString(t.trim())).filter(Boolean);
            
            const normFilterSubType = normalizeString(filterSubType);
            const orgSubTypes = String(org.sub_tipo_entidad || "").split(",").map(t => normalizeString(t.trim())).filter(Boolean);
            
            // Custom filtering logic depending on Status
            const isListaBlancaCanarias = filterStatus === ESTADOS_CLIENTE.LISTA_BLANCA;
            let matchesType = true;
            let matchesSubType = true;
            let matchesClase = true;
            let matchIslaOverride = null;

            if (isListaBlancaCanarias && filterType !== "todos") {
                // For Lista Blanca, we check filterType against tipo_entidad
                matchesType = orgTypes.some(t => t === normFilterType || t.startsWith(normFilterType));
                
                if (filterSubType !== "todos") {
                    // special extraction for Cabildos and Ayuntamientos where Nivel 3 sets the Isla
                    if (filterType === "cabildos" && filterSubType.startsWith("cabildo ")) {
                        const islaExtracted = filterSubType.replace("cabildo ", "");
                        matchIslaOverride = normalizeLocationValue(org.isla) === normalizeLocationValue(islaExtracted);
                        // We might not enforce sub_tipo_entidad here because the Nivel 3 represents the Island itself
                        // But let's verify both just in case, or just the island. The prompt says "aqui desaparece el filtro de isla pasaria a tomarse aqui".
                        // So Nivel 3 acts purely as an Island filter for these types.
                        matchesSubType = true; 
                    } else if (filterType === "ayuntamientos" && normFilterSubType === "todos los ayuntamientos (sin mancomunidades)") {
                        matchesSubType = !orgSubTypes.some(t => t.includes("mancomunidad"));
                    } else if (filterType === "ayuntamientos" && filterSubType.startsWith("ayuntamientos ")) {
                        const islaExtracted = filterSubType.replace("ayuntamientos ", "");
                        matchIslaOverride = normalizeLocationValue(org.isla) === normalizeLocationValue(islaExtracted);
                        matchesSubType = true;
                    } else {
                        // Regular SubType matching
                        matchesSubType = orgSubTypes.some(t => t === normFilterSubType || t.replace(/s$/, '') === normFilterSubType.replace(/s$/, ''));
                    }
                }

                if (filterClase && filterClase !== "todos") {
                    const normFilterClase = normalizeString(filterClase);
                    const orgClases = String(org.clase_entidad || "").split(",").map(t => normalizeString(t.trim())).filter(Boolean);
                    matchesClase = orgClases.some(t => t === normFilterClase || t.replace(/s$/, '') === normFilterClase.replace(/s$/, ''));
                }
            } else {
                // Normal matching for non-Lista Blanca
                matchesType = filterType === "todos" ? true : orgTypes.some(t => t === normFilterType || t.startsWith(normFilterType));
                matchesSubType = filterSubType === "todos" ? true : orgSubTypes.some(t => t === normFilterSubType || t.replace(/s$/, '') === normFilterSubType.replace(/s$/, ''));
            }

            // Check comunidad and isla
            const normalizedOrgIsla = normalizeLocationValue(org.isla);
            const matchesComunidad = filterComunidad === "todos" ? true : PROVINCIAS_POR_COMUNIDAD[filterComunidad]?.map(normalizeLocationValue).includes(normalizedOrgIsla);
            const matchesIsla =
                matchIslaOverride !== null
                    ? matchIslaOverride
                    : filterIsla === "todos"
                        ? true
                        : normalizedOrgIsla === normalizeLocationValue(filterIsla);

            const normalizedOrgMunicipio = normalizeString(getOrganizationMunicipio(org));
            const matchesMunicipio = normalizedMunicipioFilters.length === 0
                ? true
                : normalizedMunicipioFilters.includes(normalizedOrgMunicipio);

            const normalizedSuscripcion = normalizeString(org.suscripcion || "inactiva");
            const matchesSuscripcion = filterSuscripcion === "todos" ? true : normalizedSuscripcion === normalizeString(filterSuscripcion);

            const normalizedMMIUser = normalizeMMIUserValue(org.es_usuario_mmi);
            const matchesMMIUser = filterUsuarioMMI === "todos" ? true : normalizedMMIUser === filterUsuarioMMI;

            const normalizedLicita = normalizeLicitaValue(org.licita_medios);
            let matchesLicita = true;
            if (filterLicita !== "todos") {
                matchesLicita = normalizedLicita === filterLicita;
            }

            let matchesFrecuencia = true;
            if (filterFrecuencia && filterFrecuencia !== "todas") {
                const rawFreq = org.frecuencia;
                let normalizedFreq = "sin_datos";
                if (rawFreq === "alta" || rawFreq === "media" || rawFreq === "baja") {
                    normalizedFreq = rawFreq;
                }
                matchesFrecuencia = normalizedFreq === filterFrecuencia;
            }

            return matchesSearch && matchesStatus && matchesType && matchesSubType && matchesClase && matchesComunidad && matchesIsla && matchesMunicipio && matchesSuscripcion && matchesMMIUser && matchesLicita && matchesFrecuencia;
        });
    }, [organizaciones, searchTerm, filterStatus, filterType, filterSubType, filterClase, filterComunidad, filterIsla, normalizedMunicipioFilters, filterSuscripcion, filterUsuarioMMI, filterLicita, filterFrecuencia, normalizeLicitaValue, normalizeMMIUserValue]);

    // 2. Ordenamiento
    const filteredOrgs = useMemo(() => {
        let sortableItems = [...filteredOrgsRaw];
        if (sortConfig.key === 'ultimo_contacto') {
            sortableItems.sort((a, b) => {
                const dateA = getLastMailContact(a, selectedSenderId);
                const dateB = getLastMailContact(b, selectedSenderId);
                const hasA = !!dateA;
                const hasB = !!dateB;
                if (!hasA && !hasB) return 0;
                if (!hasA && hasB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (hasA && !hasB) return sortConfig.direction === 'asc' ? 1 : -1;
                const dA = new Date(parseDate(dateA));
                const dB = new Date(parseDate(dateB));
                if (sortConfig.direction === 'asc') {
                    return dA - dB;
                } else {
                    return dB - dA;
                }
            });
        } else if (sortConfig.key === 'organizacion') {
            sortableItems.sort((a, b) => {
                const valueA = a.organizacion || a.nombre || a.id || "";
                const valueB = b.organizacion || b.nombre || b.id || "";
                return compareTextValues(valueA, valueB, sortConfig.direction);
            });
        } else if (sortConfig.key === 'cliente_mmi') {
            sortableItems.sort((a, b) => {
                const rankA = getMMISortRank(a.es_usuario_mmi);
                const rankB = getMMISortRank(b.es_usuario_mmi);
                if (rankA !== rankB) {
                    return sortConfig.direction === 'asc' ? rankA - rankB : rankB - rankA;
                }

                const valueA = a.organizacion || a.nombre || a.id || "";
                const valueB = b.organizacion || b.nombre || b.id || "";
                return compareTextValues(valueA, valueB, sortConfig.direction);
            });
        } else if (sortConfig.key === 'contactado_estado') {
            sortableItems.sort((a, b) => {
                const rankA = getMarketingContactRank(a);
                const rankB = getMarketingContactRank(b);
                if (rankA !== rankB) {
                    return sortConfig.direction === 'asc' ? rankA - rankB : rankB - rankA;
                }

                const valueA = a.organizacion || a.nombre || a.id || "";
                const valueB = b.organizacion || b.nombre || b.id || "";
                return compareTextValues(valueA, valueB, sortConfig.direction);
            });
        }
        return sortableItems;
    }, [filteredOrgsRaw, sortConfig, selectedSenderId, compareTextValues, getMMISortRank, getMarketingContactRank]);

    const handleSort = (key) => {
        setSortConfig((current) => {
            if (current.key === key) {
                return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'desc' };
        });
    };

    // --- CÁLCULO DINÁMICO DE PÁGINAS ---
    const totalPages = Math.ceil(filteredOrgs.length / itemsPerPage);

    const getSelectedOrgs = useCallback(
        () => organizaciones.filter((org) => selectedOrgIds.has(org.id)),
        [organizaciones, selectedOrgIds]
    );

    const isCallCenterDisabled = selectedOrgIds.size < 2 || !selectedCampaignId;

    useEffect(() => {
        const preserveSelectedOrgForCampaignFlow = showCampaignModal || isCallCenterMode;
        if (preserveSelectedOrgForCampaignFlow) {
            return;
        }

        if (selectedOrgIds.size !== 1) {
            if (selectedOrg !== null) {
                setSelectedOrg(null);
            }
            return;
        }

        const [selectedId] = selectedOrgIds;
        const nextSelectedOrg =
            organizaciones.find((org) => org.id === selectedId) || null;

        if (selectedOrg?.id !== nextSelectedOrg?.id) {
            setSelectedOrg(nextSelectedOrg);
        }
    }, [
        selectedOrgIds,
        organizaciones,
        selectedOrg,
        setSelectedOrg,
        showCampaignModal,
        isCallCenterMode,
    ]);

    const handleCampaignClick = useCallback(
        (org) => {
            if (!selectedCampaignId) {
                setConfirmProps({
                    show: true, title: "Iniciar Envío", message: `¿Seguro que quieres iniciar un envío de campaña para "${org.organizacion || org.id}"? (Deberás seleccionar una plantilla)`, confirmText: "Sí, continuar", cancelText: "No, volver", type: "info", onConfirm: () => { openCampaign(org); closeConfirm(); },
                });
                return;
            }
            const templateName = campaignTemplates.find((t) => t.id === selectedCampaignId)?.title || "la campaña seleccionada";
            setConfirmProps({
                show: true, title: "Confirmar Envío Individual", message: `¿Quieres generar un borrador para "${org.organizacion || org.id}" usando la plantilla "${templateName}"?`, confirmText: "Sí, generar", cancelText: "No, volver", type: "info", onConfirm: () => { openCampaign(org); closeConfirm(); },
            });
        },
        [campaignTemplates, selectedCampaignId, openCampaign, setConfirmProps, closeConfirm]
    );

    // Reiniciar página al cambiar filtros, pero NO la selección (persistencia)
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus, filterType, filterSubType, filterClase, filterComunidad, filterIsla, filterMunicipio, filterSuscripcion, filterUsuarioMMI, filterLicita, filterFrecuencia, itemsPerPage, setCurrentPage]);

    const handleClearFilters = useCallback(() => {
        setSearchTerm("");
        setFilterStatus(ESTADOS_CLIENTE.LISTA_BLANCA);
        setFilterType("todos");
        setFilterSubType("todos");
        if (setFilterClase) setFilterClase("todos");
        setFilterComunidad("todos");
        setFilterIsla("todos");
        setFilterMunicipio([]);
        setFilterSuscripcion("activa");
        setFilterUsuarioMMI("todos");
        setFilterLicita("todos");
        if (setFilterFrecuencia) setFilterFrecuencia("todas");
        setCurrentPage(1);
        setSelectedOrgIds(new Set()); // Limpieza manual
        setSelectedCampaignId(null);
        setSortConfig({ key: null, direction: 'desc' });
    }, [setFilterStatus, setFilterType, setFilterComunidad, setFilterIsla, setFilterMunicipio, setFilterSuscripcion, setFilterUsuarioMMI, setFilterLicita, setFilterFrecuencia, setFilterClase, setCurrentPage, setSelectedCampaignId]);

    const isClean =
        searchTerm === "" &&
        filterStatus === ESTADOS_CLIENTE.LISTA_BLANCA &&
        filterType === "todos" &&
        filterSubType === "todos" &&
        (!filterClase || filterClase === "todos") &&
        filterIsla === "todos" &&
        Array.isArray(filterMunicipio) && filterMunicipio.length === 0 &&
        filterSuscripcion === "activa" &&
        filterUsuarioMMI === "todos" &&
        filterLicita === "todos" &&
        (!filterFrecuencia || filterFrecuencia === "todas") &&
        (selectedCampaignId === null || selectedCampaignId === "");

    const isLoading = props.isLoading;

    return {
        searchTerm, setSearchTerm,
        selectedOrgIds, setSelectedOrgIds,
        selectedOrg, setSelectedOrg,
        lastRefreshLabel,
        ITEMS_PER_PAGE: itemsPerPage, // Mantenemos nombre para compatibilidad
        setItemsPerPage,              // Exportamos setter
        filteredOrgs, 
        totalPages,
        getSelectedOrgs,
        isCallCenterDisabled,
        handleCampaignClick,
        handleClearFilters,
        isClean,
        isLoading,
        filterSubType, setFilterSubType,
        filterClase, setFilterClase,
        sortConfig,
        handleSort
    };
};
