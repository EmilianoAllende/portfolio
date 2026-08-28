import React, { useEffect, useMemo, useState } from "react";
import apiClient from "../../api/apiClient";
import { Search, Zap, RefreshCw, RotateCcw, Filter } from "lucide-react";
import OrganizationFrequencyFilter from "./OrganizationFrequencyFilter";
import { MultiSelectField } from "../editor-tabs/MultiSelectField";
import {
    SUBTIPOS_POR_ENTIDAD,
    ESTADOS_CLIENTE,
    TIPOS_ENTIDAD,
    getIslasForSubtipo,
    PROVINCIAS_ESPANA,
    COMUNIDADES_AUTONOMAS_ESPANA,
    PROVINCIAS_POR_COMUNIDAD,
    LISTA_BLANCA_HIERARCHY,
    getOrganizationMunicipio,
    normalizeLocationValue,
    normalizeString,
} from "../../utils/organizationUtils";

const OrganizationFilters = ({
    filterStatus,
    setFilterStatus,
    filterType,
    setFilterType,
    filterSubType,
    setFilterSubType,
    filterClase,
    setFilterClase,
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
    searchTerm,
    setSearchTerm,
    selectedCampaignId,
    setSelectedCampaignId,
    campaignTemplates,
    handleClearFilters,
    isClean,
    onRefresh,
    isLoading,
    startCallCenterMode,
    getSelectedOrgs,
    isCallCenterDisabled,
    filteredOrgsLength,
    totalOrgsLength,
    lastRefreshLabel,
    organizaciones = [],
    setNotification,
}) => {
    const [senders, setSenders] = useState([]);
    const [isDownloading, setIsDownloading] = useState(false);
    const selectedMunicipios = useMemo(() => {
        return Array.isArray(filterMunicipio) ? filterMunicipio : [];
    }, [filterMunicipio]);
    const hasSelectedMunicipios = selectedMunicipios.length > 0;

    useEffect(() => {
        let mounted = true;

        const loadSenders = async () => {
            try {
                const data = await apiClient.getSenders();
                if (!mounted) return;
                const normalized = (Array.isArray(data) ? data : []).map((s) => ({
                    id: s.id,
                    label: s.label,
                    displayName: s.display_name || s.displayName,
                    email: s.email,
                }));
                setSenders(normalized);
            } catch {
                if (mounted) setSenders([]);
            }
        };

        loadSenders();
        return () => {
            mounted = false;
        };
    }, []);

    // Helper para formatear las etiquetas
    const formatLabel = (str) => {
        if (!str) return "";
        // Lógica por defecto (reemplazar _ por espacios y capitalizar)
        return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const isListaBlancaNacional = filterStatus === ESTADOS_CLIENTE.LISTA_BLANCA_NACIONAL;
    const isListaBlancaCanarias = filterStatus === ESTADOS_CLIENTE.LISTA_BLANCA;

    // Obtener opciones de subtipo y clase según el tipo seleccionado
    let typeOptions = [];
    let subTypeOptions = [];
    let claseOptions = [];

    if (isListaBlancaCanarias) {
        typeOptions = Object.keys(LISTA_BLANCA_HIERARCHY);
        if (filterType !== "todos" && LISTA_BLANCA_HIERARCHY[filterType]) {
            subTypeOptions = Object.keys(LISTA_BLANCA_HIERARCHY[filterType]);
            if (filterSubType !== "todos" && LISTA_BLANCA_HIERARCHY[filterType][filterSubType]) {
                claseOptions = LISTA_BLANCA_HIERARCHY[filterType][filterSubType];
            }
        }
    } else {
        typeOptions = Object.values(TIPOS_ENTIDAD);
        subTypeOptions = SUBTIPOS_POR_ENTIDAD[filterType] || [];
        if (isListaBlancaNacional) {
            subTypeOptions = Array.from(new Set(subTypeOptions.map(st => st.replace(/_en_canarias|_canarias|_canario_|_canarios|_canaria|_canario/g, ""))));
        }
    }

    const sectorPublicoLabel = isListaBlancaNacional ? "Sector Público" : "Sector Público Canario";
    // Mantiene la variable interna "isla", pero cambia el catálogo visible a provincias cuando aplica.
    let islasParaMostrar = isListaBlancaNacional ? PROVINCIAS_ESPANA : getIslasForSubtipo(filterSubType);
    if (isListaBlancaNacional && filterComunidad !== "todos") {
        islasParaMostrar = PROVINCIAS_POR_COMUNIDAD[filterComunidad] || [];
    }
    
    const hideIslaCompletely = isListaBlancaCanarias && (filterType === "cabildos" || filterType === "ayuntamientos");

    const derivedIslaFromSubtype = useMemo(() => {
        if (filterType === "cabildos" && filterSubType.startsWith("cabildo ")) {
            return filterSubType.replace("cabildo ", "");
        }
        if (filterType === "ayuntamientos" && filterSubType.startsWith("ayuntamientos ")) {
            return filterSubType.replace("ayuntamientos ", "");
        }
        return "";
    }, [filterType, filterSubType]);

    const effectiveAreaValue = hideIslaCompletely ? derivedIslaFromSubtype : filterIsla;

    const municipiosParaMostrar = useMemo(() => {
        if (!Array.isArray(organizaciones) || organizaciones.length === 0) return [];
        if (!effectiveAreaValue || effectiveAreaValue === "todos") return [];

        const normalizedArea = normalizeLocationValue(effectiveAreaValue);

        const municipios = organizaciones
            .filter((org) => normalizeLocationValue(org.isla) === normalizedArea)
            .map((org) => getOrganizationMunicipio(org))
            .filter((municipio) => municipio && normalizeString(municipio) !== "indefinido");

        return Array.from(new Set(municipios)).sort((left, right) => left.localeCompare(right, "es", { sensitivity: "base" }));
    }, [effectiveAreaValue, organizaciones]);

    useEffect(() => {
        if (selectedMunicipios.length === 0) return;
        const municipiosValidos = selectedMunicipios.filter((municipio) => municipiosParaMostrar.includes(municipio));
        if (municipiosValidos.length === selectedMunicipios.length) return;
        setFilterMunicipio(municipiosValidos);
    }, [selectedMunicipios, municipiosParaMostrar, setFilterMunicipio]);

    const municipioOptions = useMemo(() => {
        return municipiosParaMostrar.map((municipio) => ({
            value: municipio,
            label: municipio,
        }));
    }, [municipiosParaMostrar]);

    const handleMunicipioSelectionChange = (event) => {
        const values = String(event.target.value || "")
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean);
        setFilterMunicipio(values);
    };

    const senderLabelMap = useMemo(() => {
        const map = new Map();
        (Array.isArray(senders) ? senders : []).forEach((sender) => {
            if (sender?.id === undefined || sender?.id === null) return;
            const key = String(sender.id);
            map.set(key, sender.displayName || sender.label || sender.email || `Remitente ${key}`);
        });
        return map;
    }, [senders]);

    const groupedCampaignTemplates = useMemo(() => {
        const activeTemplates = (campaignTemplates || []).filter((campaign) => campaign.active !== false);
        const groupedMap = new Map();

        activeTemplates.forEach((campaign) => {
            const rawSenderId = campaign?.builder?.senderName;
            const senderKey = rawSenderId !== undefined && rawSenderId !== null && String(rawSenderId).trim() !== ""
                ? String(rawSenderId)
                : "__NO_SENDER__";

            const senderLabel = senderKey === "__NO_SENDER__"
                ? "Sin remitente"
                : (senderLabelMap.get(senderKey) || `Remitente ${senderKey}`);

            if (!groupedMap.has(senderKey)) {
                groupedMap.set(senderKey, {
                    key: senderKey,
                    label: senderLabel,
                    campaigns: [],
                });
            }

            groupedMap.get(senderKey).campaigns.push(campaign);
        });

        const groups = Array.from(groupedMap.values());
        groups.sort((a, b) => a.label.localeCompare(b.label, "es", { sensitivity: "base" }));
        return groups;
    }, [campaignTemplates, senderLabelMap]);

    const getDownloadFileName = (headers) => {
        const contentDisposition = headers?.["content-disposition"] || headers?.["Content-Disposition"];
        if (!contentDisposition) {
            const timestamp = new Date().toISOString().slice(0, 10);
            return `clientes-filtrados-${timestamp}.xlsx`;
        }

        const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
        if (utf8Match?.[1]) {
            return decodeURIComponent(utf8Match[1]);
        }

        const asciiMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
        if (asciiMatch?.[1]) {
            return asciiMatch[1];
        }

        const timestamp = new Date().toISOString().slice(0, 10);
        return `clientes-filtrados-${timestamp}.xlsx`;
    };

    const triggerBlobDownload = (blob, fileName) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
    };

    // Construye la URL al webhook de n8n y espera el archivo para forzar la descarga
    const handleDownload = async () => {
        if (isDownloading) return;

        const params = new URLSearchParams();
        if (filterStatus !== "todos") params.set("estado_cliente", String(filterStatus));
        if (filterType && filterType !== "todos") params.set("tipo", filterType);
        if (filterSubType && filterSubType !== "todos") params.set("subtype", filterSubType);
        if (filterComunidad && filterComunidad !== "todos") params.set("comunidad", filterComunidad);
        if (filterIsla && filterIsla !== "todos" && !hideIslaCompletely) params.set("isla", filterIsla);
        selectedMunicipios.forEach((municipio) => params.append("municipio", municipio));
        if (filterClase && filterClase !== "todos") params.set("clase", filterClase);
        if (filterUsuarioMMI && filterUsuarioMMI !== "todos") params.set("usuario_mmi", filterUsuarioMMI);
        if (filterLicita && filterLicita !== "todos") params.set("licita", filterLicita);
        if (filterFrecuencia && filterFrecuencia !== "todas") params.set("frecuencia", filterFrecuencia);
        if (filterSuscripcion) params.set("suscripcion", filterSuscripcion);

        const path = "/webhook/descargar-clientes";
        const requestUrl = `${path}${params.toString() ? `?${params.toString()}` : ""}`;

        try {
            setIsDownloading(true);
            const response = await apiClient.get(requestUrl, {
                responseType: "blob",
                headers: {
                    Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/octet-stream",
                },
            });

            const blob = response.data;
            const contentType = String(response.headers?.["content-type"] || blob?.type || "").toLowerCase();

            if (contentType.includes("application/json") || contentType.includes("text/html") || contentType.includes("text/plain")) {
                const errorText = await blob.text();
                throw new Error(errorText || "El webhook no devolvió un archivo descargable.");
            }

            const fileName = getDownloadFileName(response.headers);
            triggerBlobDownload(blob, fileName);

            setNotification?.({
                type: "success",
                title: "Descarga iniciada",
                message: `Se descargó ${fileName}`,
            });
        } catch (error) {
            console.error("Error descargando Excel filtrado:", error);
            setNotification?.({
                type: "error",
                title: "Error al descargar",
                message: "El webhook no devolvió un Excel válido. Revisa la respuesta del flujo de n8n.",
            });
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="flex flex-col gap-5">
            {/* -- CABECERA: Búsqueda y Acciones Rápidas -- */}
            <div className="flex flex-wrap items-start gap-3 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
                
                {/* Barra de Búsqueda Global */}
                <div className="relative flex-[1_1_420px] min-w-[260px] xl:max-w-xl z-20 group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-transform group-focus-within:scale-110">
                        <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900/50 dark:text-gray-100 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder-gray-400 text-sm font-medium"
                        placeholder="Buscar organización por nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center hover:scale-110 transition-transform">
                            <span className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-lg font-bold leading-none mb-0.5">
                                &times;
                            </span>
                        </button>
                    )}
                </div>

                {/* Acciones Rápidas */}
                <div className="flex flex-wrap items-stretch justify-end gap-2 flex-[1_1_560px] min-w-[280px] ml-auto z-10">
                    <div className="relative flex-[1_1_280px] min-w-[240px] max-w-[360px]">
                            <select
                                value={selectedCampaignId || ""}
                                onChange={(e) => setSelectedCampaignId(e.target.value || null)}
                                className={`w-full pl-4 pr-10 py-2.5 border rounded-lg appearance-none text-sm font-semibold outline-none transition-all shadow-sm focus:ring-4 focus:ring-blue-500/10
                                    ${selectedCampaignId
                                    ? "border-blue-300 bg-blue-100 text-blue-700 dark:bg-slate-700 dark:border-blue-500/40 dark:text-slate-100"
                                    : "border-gray-200 bg-white text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:border-blue-500"
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
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg className={`h-4 w-4 ${selectedCampaignId ? "text-blue-600 dark:text-blue-300" : "text-gray-400"}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </div>
                    </div>

                    {startCallCenterMode && (
                        <button
                            onClick={() => startCallCenterMode(getSelectedOrgs())}
                            disabled={isCallCenterDisabled || !selectedCampaignId}
                            className="flex-[1_1_240px] min-w-[220px] max-w-[320px] px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-purple-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_-3px_rgba(147,51,234,0.4)] hover:shadow-[0_0_20px_-3px_rgba(147,51,234,0.6)] min-w-0"
                            title={
                                isCallCenterDisabled
                                    ? "Selecciona al menos 2 organizaciones para continuar."
                                    : !selectedCampaignId
                                        ? "Debes seleccionar una campaña primero"
                                        : `Iniciar Modo Call Center con ${getSelectedOrgs().length} organizaciones`
                            }>
                            <Zap className="h-4 w-4 fill-white flex-shrink-0" />
                            <span className="hidden sm:inline">Modo Call Center</span>
                            <span className="sm:hidden">Call Center</span>
                            <span className="bg-white/20 px-1.5 py-0.5 rounded-md text-xs">{getSelectedOrgs().length}</span>
                        </button>
                    )}

                    <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className={`flex-[1_1_180px] min-w-[170px] max-w-[220px] min-h-[42px] px-4 py-2.5 text-sm font-semibold border rounded-lg focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all shadow-sm ${isDownloading
                            ? "text-emerald-500 bg-emerald-50/70 dark:bg-emerald-900/20 dark:text-emerald-500 border-emerald-200 dark:border-emerald-800/50 cursor-wait opacity-80"
                            : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 border-emerald-200 dark:border-emerald-800/50"
                            }`}
                        title="Descargar registros filtrados en Excel"
                    >
                        <span className="hidden md:inline">{isDownloading ? "Descargando..." : "Descargar tabla"}</span>
                        <span className="md:hidden">{isDownloading ? "Bajando..." : "Descargar"}</span>
                    </button>

                    <button
                        onClick={handleClearFilters}
                        disabled={isClean}
                        className={`h-[42px] w-[42px] flex-none p-2.5 text-sm font-medium rounded-lg border transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/10 flex items-center justify-center ${isClean
                            ? "bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed dark:bg-gray-800/50 dark:text-gray-600 dark:border-gray-800"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 shadow-sm hover:shadow"
                            }`}
                        title="Limpiar todos los filtros">
                        <RotateCcw className="h-4 w-4" />
                    </button>

                    <button
                        onClick={onRefresh}
                        className="h-[42px] w-[42px] flex-none p-2.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-lg border border-transparent focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all shadow-sm flex items-center justify-center"
                        title="Actualizar datos">
                        <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </div>

            {/* -- TARJETA DE FILTROS AVANZADOS -- */}
            <div className="bg-gray-50/40 dark:bg-gray-800/20 rounded-xl border border-gray-200 dark:border-gray-700 overflow-visible shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
                <div className="flex items-center px-5 py-3.5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 rounded-t-xl">
                    <div className="bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 p-1.5 rounded-lg mr-3 shadow-sm">
                        <Filter className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-extrabold text-gray-800 dark:text-gray-100 tracking-wide uppercase">Segmentación Avanzada</h3>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Filtra organizaciones por estado, cargo o localización.</p>
                    </div>
                </div>
                
                <div className="p-5">
                    {/* Rejilla de Filtros Principales */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-x-6 gap-y-5">
                        {/* Nivel 1: Estado */}
                        <div className="flex flex-col gap-1.5 focus-within:relative z-10 group">
                            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1 group-focus-within:text-blue-600 transition-colors">Estado</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value === "todos" ? "todos" : parseInt(e.target.value))}
                                className="w-full px-3 py-2 text-sm border-b-2 border-transparent bg-white shadow-sm hover:shadow focus:shadow-md dark:bg-gray-800 dark:hover:bg-gray-750 focus:bg-white focus:border-blue-500 dark:focus:bg-gray-900 dark:focus:border-blue-400 dark:text-gray-100 rounded-lg outline-none transition-all cursor-pointer">
                                <option value="todos">Todos los estados</option>
                                <option value={ESTADOS_CLIENTE.LISTA_BLANCA}>Lista Blanca (Canarias)</option>
                                <option value={ESTADOS_CLIENTE.LISTA_NEGRA}>Lista Negra</option>
                                <option value={ESTADOS_CLIENTE.LISTA_BLANCA_NACIONAL}>Lista Blanca Nacional</option>
                                <option value={ESTADOS_CLIENTE.OTRO_TIPO}>Otro Tipo</option>
                                <option value={ESTADOS_CLIENTE.COMPETENCIA}>Competencia</option>
                                <option value={ESTADOS_CLIENTE.REVISION}>Revisión</option>
                                <option value={ESTADOS_CLIENTE.CONTACTOS_BODY}>Contactos solo body</option>
                                <option value={ESTADOS_CLIENTE.PRUEBAS_INTERNAS}>Pruebas Internas</option>
                                <option value={ESTADOS_CLIENTE.PENDIENTE}>Pendiente (Sin Clasificar)</option>
                            </select>
                        </div>

                        {/* Nivel 2: Tipo de Entidad */}
                        <div className="flex flex-col gap-1.5 focus-within:relative z-10 group">
                            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1 group-focus-within:text-blue-600 transition-colors">Tipo de Entidad</label>
                            <select
                                value={filterType}
                                onChange={(e) => {
                                    setFilterType(e.target.value);
                                    setFilterSubType("todos");
                                    setFilterMunicipio([]);
                                    if(setFilterClase) setFilterClase("todos");
                                }}
                                className="w-full px-3 py-2 text-sm border-b-2 border-transparent bg-white shadow-sm hover:shadow focus:shadow-md dark:bg-gray-800 dark:hover:bg-gray-750 focus:bg-white focus:border-blue-500 dark:focus:bg-gray-900 dark:focus:border-blue-400 dark:text-gray-100 rounded-lg outline-none transition-all cursor-pointer">
                                <option value="todos">Todos los tipos</option>
                                {isListaBlancaCanarias ? (
                                    typeOptions.map((v) => <option key={v} value={v}>{formatLabel(v)}</option>)
                                ) : (
                                    <>
                                        <option value={TIPOS_ENTIDAD.SECTOR_PUBLICO_CANARIO}>{sectorPublicoLabel}</option>
                                        <option value={TIPOS_ENTIDAD.EMPRESAS}>Empresas</option>
                                        <option value={TIPOS_ENTIDAD.ASOCIACIONES}>Asociaciones</option>
                                        <option value={TIPOS_ENTIDAD.MEDIOS}>Medios</option>
                                        <option value={TIPOS_ENTIDAD.AGENCIAS}>Agencias</option>
                                        <option value={TIPOS_ENTIDAD.CON_COMPETIDORES}>Con Competidores</option>
                                    </>
                                )}
                            </select>
                        </div>

                        {/* Nivel 3: Subtipo */}
                        <div className="flex flex-col gap-1.5 focus-within:relative z-10 group">
                            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1 truncate group-focus-within:text-blue-600 transition-colors" title="Subtipo / Isla Local">
                                Subtipo / Entidad
                            </label>
                            <select
                                value={filterSubType}
                                onChange={(e) => {
                                    setFilterSubType(e.target.value);
                                    setFilterMunicipio([]);
                                    if(setFilterClase) setFilterClase("todos");
                                }}
                                disabled={!filterType || filterType === "todos"}
                                className={`w-full px-3 py-2 text-sm border-b-2 border-transparent rounded-lg outline-none transition-all ${!filterType || filterType === "todos"
                                    ? "bg-transparent text-gray-400 dark:text-gray-600 opacity-60 cursor-not-allowed font-medium border border-gray-200 dark:border-gray-700/50 block"
                                    : "bg-white shadow-sm hover:shadow focus:shadow-md dark:bg-gray-800 dark:hover:bg-gray-750 focus:bg-white focus:border-blue-500 dark:focus:bg-gray-900 dark:focus:border-blue-400 dark:text-gray-100 cursor-pointer"
                                    }`}>
                                <option value="todos">Cualquiera</option>
                                {subTypeOptions.map((subType) => (
                                    <option key={subType} value={subType}>
                                        {formatLabel(subType)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Nivel 4: Clase */}
                        <div className="flex flex-col gap-1.5 focus-within:relative z-10 group">
                            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1 truncate group-focus-within:text-blue-600 transition-colors" title="Clase / Cargo Específico">
                                Clase / Cargo
                            </label>
                            <select
                                value={filterClase || "todos"}
                                onChange={(e) => setFilterClase && setFilterClase(e.target.value)}
                                disabled={!filterSubType || filterSubType === "todos" || claseOptions.length === 0}
                                className={`w-full px-3 py-2 text-sm border-b-2 border-transparent rounded-lg outline-none transition-all ${!filterSubType || filterSubType === "todos" || claseOptions.length === 0
                                    ? "bg-transparent text-gray-400 dark:text-gray-600 opacity-60 cursor-not-allowed font-medium border border-gray-200 dark:border-gray-700/50 block"
                                    : "bg-white shadow-sm hover:shadow focus:shadow-md dark:bg-gray-800 dark:hover:bg-gray-750 focus:bg-white focus:border-blue-500 dark:focus:bg-gray-900 dark:focus:border-blue-400 dark:text-gray-100 cursor-pointer"
                                    }`}>
                                <option value="todos">Cualquiera</option>
                                {claseOptions.map((claseOption) => (
                                    <option key={claseOption} value={claseOption}>
                                        {formatLabel(claseOption)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Nivel 5: CCAA */}
                        <div className="flex flex-col gap-1.5 focus-within:relative z-10 group">
                            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1 truncate group-focus-within:text-blue-600 transition-colors" title="Comunidad Autónoma">
                                Comunidad
                            </label>
                            <select
                                value={filterComunidad}
                                onChange={(e) => {
                                    setFilterComunidad(e.target.value);
                                    setFilterIsla("todos");
                                    setFilterMunicipio([]);
                                }}
                                disabled={!isListaBlancaNacional}
                                className={`w-full px-3 py-2 text-sm border-b-2 border-transparent rounded-lg outline-none transition-all ${!isListaBlancaNacional
                                    ? "bg-transparent text-gray-400 dark:text-gray-600 opacity-60 cursor-not-allowed font-medium border border-gray-200 dark:border-gray-700/50 block"
                                    : "bg-white shadow-sm hover:shadow focus:shadow-md dark:bg-gray-800 dark:hover:bg-gray-750 focus:bg-white focus:border-blue-500 dark:focus:bg-gray-900 dark:focus:border-blue-400 dark:text-gray-100 cursor-pointer"
                                    }`}>
                                <option value="todos">Todas</option>
                                {COMUNIDADES_AUTONOMAS_ESPANA.map((com) => (
                                    <option key={com} value={com}>
                                        {com}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Nivel 6: Isla / Provincia */}
                        <div className="flex flex-col gap-1.5 focus-within:relative z-10 group">
                            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1 truncate group-focus-within:text-blue-600 transition-colors">
                                Isla / Provincia
                            </label>
                            <select
                                value={filterIsla}
                                onChange={(e) => {
                                    setFilterIsla(e.target.value);
                                    setFilterMunicipio([]);
                                }}
                                disabled={hideIslaCompletely}
                                className={`w-full px-3 py-2 text-sm border-b-2 border-transparent rounded-lg outline-none transition-all ${hideIslaCompletely
                                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-500 opacity-90 cursor-not-allowed font-medium shadow-none"
                                    : "bg-white shadow-sm hover:shadow focus:shadow-md dark:bg-gray-800 dark:hover:bg-gray-750 focus:bg-white focus:border-blue-500 dark:focus:bg-gray-900 dark:focus:border-blue-400 dark:text-gray-100 cursor-pointer"
                                    }`}>
                                <option value="todos">{hideIslaCompletely ? "Derivado del Subtipo" : "Todas"}</option>
                                {(!hideIslaCompletely ? islasParaMostrar : []).map((isla) => (
                                    <option key={isla} value={isla}>
                                        {isla}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5 focus-within:relative z-10 group">
                            <div className={`${!effectiveAreaValue || effectiveAreaValue === "todos" || municipiosParaMostrar.length === 0 ? "opacity-60" : ""}`}>
                                <MultiSelectField
                                    label="Municipio"
                                    name="municipio"
                                    options={municipioOptions}
                                    value={selectedMunicipios.join(",")}
                                    onChange={handleMunicipioSelectionChange}
                                    compactDisplay
                                    selectedSummaryText="Municipios seleccionados"
                                    placeholder="Todos"
                                    disabled={!effectiveAreaValue || effectiveAreaValue === "todos" || municipiosParaMostrar.length === 0}
                                />
                            </div>
                            <p className="ml-1 text-[10px] font-medium text-gray-400 dark:text-gray-500">
                                Selecciona varios sin salir del desplegable.
                            </p>
                        </div>
                    </div>

                    {/* Divisor y Acordeón "Más Filtros" */}
                    <details className="group mt-6 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700/60 bg-white shadow-sm dark:bg-gray-800/80">
                        <summary className="flex cursor-pointer items-center justify-between px-5 py-3.5 font-semibold text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors list-none">
                            <div className="flex items-center gap-3">
                                <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-1.5 group-open:bg-blue-100 dark:group-open:bg-blue-900/50 group-open:text-blue-600 transition-colors flex items-center justify-center">
                                    <Filter className="w-3.5 h-3.5" />
                                </div>
                                <span className="tracking-wide">Filtros Adicionales (MMI, Licitaciones, Suscripción, Frecuencia)</span>
                            </div>
                            <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-full group-open:bg-blue-100 dark:group-open:bg-blue-900/40 text-gray-500 group-open:text-blue-600 transition-colors">
                                <svg className="transition-transform duration-300 group-open:rotate-180" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" width="16"><path d="M6 9l6 6 6-6"></path></svg>
                            </div>
                        </summary>
                        
                        <div className="border-t border-gray-100 dark:border-gray-700/60 px-6 pt-5 pb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 bg-gray-50/50 dark:bg-gray-900/20">
                            <div className="flex flex-col gap-1.5 focus-within:relative z-10 group">
                                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1 group-focus-within:text-blue-600">Cliente MMI</label>
                                <select
                                    value={filterUsuarioMMI}
                                    onChange={(e) => setFilterUsuarioMMI(e.target.value)}
                                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white shadow-sm hover:shadow focus:shadow-md dark:bg-gray-800 dark:hover:bg-gray-750 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:border-blue-500 dark:focus:border-blue-400 dark:text-gray-100 rounded-lg outline-none transition-all cursor-pointer">
                                    <option value="todos">Cualquiera</option>
                                    <option value="true">Es usuario</option>
                                    <option value="false">No es usuario</option>
                                    <option value="sin_datos">Sin datos</option>
                                </select>
                            </div>

                            {/* Licitaciones */}
                            <div className="flex flex-col gap-1.5 focus-within:relative z-10 group">
                                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1 group-focus-within:text-blue-600">Licitaciones</label>
                                <select
                                    value={filterLicita}
                                    onChange={(e) => setFilterLicita(e.target.value)}
                                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white shadow-sm hover:shadow focus:shadow-md dark:bg-gray-800 dark:hover:bg-gray-750 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:border-blue-500 dark:focus:border-blue-400 dark:text-gray-100 rounded-lg outline-none transition-all cursor-pointer">
                                    <option value="todos">Cualquiera</option>
                                    <option value="1">Sí Licita</option>
                                    <option value="0">No Licita</option>
                                    <option value="sin_datos">Sin Datos</option>
                                </select>
                            </div>

                            {/* Suscripción */}
                            <div className="flex flex-col gap-1.5 focus-within:relative z-10 group">
                                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1 group-focus-within:text-blue-600">Suscripción</label>
                                <select
                                    value={filterSuscripcion}
                                    onChange={(e) => setFilterSuscripcion(e.target.value)}
                                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white shadow-sm hover:shadow focus:shadow-md dark:bg-gray-800 dark:hover:bg-gray-750 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:border-blue-500 dark:focus:border-blue-400 dark:text-gray-100 rounded-lg outline-none transition-all cursor-pointer">
                                    <option value="todos">Cualquiera</option>
                                    <option value="activa">Suscripción Activa</option>
                                    <option value="inactiva">No Suscritas</option>
                                </select>
                            </div>

                            {/* Frecuencia */}
                            <div className="flex flex-col gap-1.5 focus-within:relative z-10 group">
                                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1 group-focus-within:text-blue-600">Frecuencia</label>
                                <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 p-1 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                                    <OrganizationFrequencyFilter
                                        filterFrecuencia={filterFrecuencia}
                                        setFilterFrecuencia={setFilterFrecuencia}
                                    />
                                </div>
                            </div>
                        </div>
                    </details>
                </div>
            </div>

            {/* -- ETIQUETAS DE RESUMEN (CHIPS) -- */}
            <div className="flex items-center flex-wrap gap-2 px-1 pb-1">
                <div className="text-sm font-bold text-gray-700 dark:text-gray-300 mr-2 flex items-center gap-2 border-r border-gray-300 dark:border-gray-700 pr-4 py-1">
                    <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                    <span className="bg-blue-100/80 text-blue-800 font-extrabold text-xs px-2.5 py-1 rounded-md dark:bg-blue-900/50 dark:text-blue-300 tracking-wide">
                        {filteredOrgsLength} / {totalOrgsLength}
                    </span>
                    <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Listadas</span>
                </div>

                {searchTerm && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-sm transition-transform hover:-translate-y-0.5">
                        <span className="opacity-60 mr-1.5 uppercase tracking-wider">Búsqueda:</span> "{searchTerm}"
                    </div>
                )}
                
                {filterStatus !== "todos" && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-sm transition-transform hover:-translate-y-0.5">
                        <span className="opacity-60 mr-1.5 uppercase tracking-wider">Est:</span> 
                        {filterStatus === ESTADOS_CLIENTE.LISTA_BLANCA ? "Lista Blanca" 
                        : filterStatus === ESTADOS_CLIENTE.LISTA_NEGRA ? "Lista Negra"
                        : filterStatus === ESTADOS_CLIENTE.LISTA_BLANCA_NACIONAL ? "Blanca Nacional"
                        : "Otro"}
                    </div>
                )}

                {filterType !== "todos" && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-sm transition-transform hover:-translate-y-0.5">
                        <span className="opacity-60 mr-1.5 uppercase tracking-wider">Tipo:</span> 
                        {isListaBlancaNacional && filterType === TIPOS_ENTIDAD.SECTOR_PUBLICO_CANARIO ? "Sector Público" : formatLabel(filterType)}
                    </div>
                )}

                {filterSubType && filterSubType !== "todos" && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 border border-pink-200 dark:border-pink-800 shadow-sm transition-transform hover:-translate-y-0.5">
                        <span className="opacity-60 mr-1.5 uppercase tracking-wider">Sub:</span> {formatLabel(filterSubType)}
                    </div>
                )}

                {filterClase && filterClase !== "todos" && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border border-rose-200 dark:border-rose-800 shadow-sm transition-transform hover:-translate-y-0.5">
                        <span className="opacity-60 mr-1.5 uppercase tracking-wider">Clase:</span> {formatLabel(filterClase)}
                    </div>
                )}

                {filterIsla !== "todos" && !hideIslaCompletely && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-sm transition-transform hover:-translate-y-0.5">
                        <span className="opacity-60 mr-1.5 uppercase tracking-wider">{isListaBlancaNacional ? "Prov:" : "Isla:"}</span> {filterIsla}
                    </div>
                )}

                {hasSelectedMunicipios && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border border-teal-200 dark:border-teal-800 shadow-sm transition-transform hover:-translate-y-0.5">
                        <span className="opacity-60 mr-1.5 uppercase tracking-wider">Mun:</span> {selectedMunicipios.join(", ")}
                    </div>
                )}

                {filterUsuarioMMI !== "todos" && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 shadow-sm transition-transform hover:-translate-y-0.5">
                        <span className="opacity-60 mr-1.5 uppercase tracking-wider">MMI:</span>
                        {filterUsuarioMMI === "true" ? "Es usuario" : filterUsuarioMMI === "false" ? "No es usuario" : "Sin datos"}
                    </div>
                )}
                
                {(filterUsuarioMMI !== "todos" || filterLicita !== "todos" || filterSuscripcion !== "todos" || (filterFrecuencia && filterFrecuencia !== "todas")) && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-sm transition-transform hover:-translate-y-0.5">
                        + Filtros Extra
                    </div>
                )}

                {!isClean && (
                    <div className="ml-auto">
                        <button
                            onClick={handleClearFilters}
                            className="text-[10px] font-black text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 uppercase tracking-widest transition-colors py-1 px-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                            Borrar Filtros
                        </button>
                    </div>
                )}
            </div>
            
            {lastRefreshLabel && (
                <div className="flex justify-end -mt-3 pr-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50 px-2 py-0.5 rounded-md border border-gray-100 dark:border-gray-800">
                        Sincronización: {lastRefreshLabel}
                    </span>
                </div>
            )}
        </div>
    );
};

export default OrganizationFilters;
