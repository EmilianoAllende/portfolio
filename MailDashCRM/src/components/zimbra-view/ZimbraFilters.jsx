import React, { useEffect, useMemo } from "react";
import { Search, RotateCcw, RefreshCw, Filter } from "lucide-react";
import OrganizationFrequencyFilter from "../organization/OrganizationFrequencyFilter";
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
import { ESTADO_BADGE_DISPLAY } from "./zimbraUtils";

const formatLabel = (str) => {
    if (!str) return "";
    return str.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

const ZimbraFilters = ({
    searchTerm, setSearchTerm,
    filterStatus, setFilterStatus,
    filterType, setFilterType,
    filterSubType, setFilterSubType,
    filterClase, setFilterClase,
    filterComunidad, setFilterComunidad,
    filterIsla, setFilterIsla,
    filterMunicipio, setFilterMunicipio,
    filterSuscripcion, setFilterSuscripcion,
    filterUsuarioMMI, setFilterUsuarioMMI,
    filterLicita, setFilterLicita,
    filterFrecuencia, setFilterFrecuencia,
    handleClearFilters, isClean,
    onRefresh, isLoading,
    filteredCount, totalCount,
    lastRefreshLabel,
    organizaciones,
}) => {
    const selectedMunicipios = useMemo(
        () => (Array.isArray(filterMunicipio) ? filterMunicipio : []),
        [filterMunicipio]
    );
    const hasSelectedMunicipios = selectedMunicipios.length > 0;

    const isListaBlancaNacional = filterStatus === ESTADOS_CLIENTE.LISTA_BLANCA_NACIONAL;
    const isListaBlancaCanarias = filterStatus === ESTADOS_CLIENTE.LISTA_BLANCA;

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
            subTypeOptions = Array.from(
                new Set(subTypeOptions.map((st) =>
                    st.replace(/_en_canarias|_canarias|_canario_|_canarios|_canaria|_canario/g, "")
                ))
            );
        }
    }

    const sectorPublicoLabel = isListaBlancaNacional ? "Sector Público" : "Sector Público Canario";

    let islasParaMostrar = isListaBlancaNacional ? PROVINCIAS_ESPANA : getIslasForSubtipo(filterSubType);
    if (isListaBlancaNacional && filterComunidad !== "todos") {
        islasParaMostrar = PROVINCIAS_POR_COMUNIDAD[filterComunidad] || [];
    }

    const hideIslaCompletely =
        isListaBlancaCanarias && (filterType === "cabildos" || filterType === "ayuntamientos");

    const derivedIslaFromSubtype = useMemo(() => {
        if (filterType === "cabildos" && filterSubType.startsWith("cabildo "))
            return filterSubType.replace("cabildo ", "");
        if (filterType === "ayuntamientos" && filterSubType.startsWith("ayuntamientos "))
            return filterSubType.replace("ayuntamientos ", "");
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
            .filter((m) => m && normalizeString(m) !== "indefinido");
        return Array.from(new Set(municipios)).sort((a, b) =>
            a.localeCompare(b, "es", { sensitivity: "base" })
        );
    }, [effectiveAreaValue, organizaciones]);

    useEffect(() => {
        if (selectedMunicipios.length === 0) return;
        const valid = selectedMunicipios.filter((m) => municipiosParaMostrar.includes(m));
        if (valid.length === selectedMunicipios.length) return;
        setFilterMunicipio(valid);
    }, [selectedMunicipios, municipiosParaMostrar, setFilterMunicipio]);

    const municipioOptions = useMemo(
        () => municipiosParaMostrar.map((m) => ({ value: m, label: m })),
        [municipiosParaMostrar]
    );

    const handleMunicipioChange = (e) => {
        const values = String(e.target.value || "")
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean);
        setFilterMunicipio(values);
    };

    const hasExtraFilters =
        filterUsuarioMMI !== "todos" ||
        filterLicita !== "todos" ||
        filterSuscripcion !== "todos" ||
        (filterFrecuencia && filterFrecuencia !== "todas");

    return (
        <div className="flex flex-col gap-4 p-4 bg-gray-50/40 dark:bg-gray-800/20 border-b border-gray-200 dark:border-gray-700">

            {/* Barra superior: búsqueda + acciones */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-[1_1_260px] min-w-[220px] group z-20">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por remitente o asunto..."
                        className="block w-full pl-10 pr-9 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900/50 dark:text-gray-100 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder-gray-400 text-sm font-medium"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center hover:scale-110 transition-transform"
                        >
                            <span className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-lg font-bold leading-none mb-0.5">&times;</span>
                        </button>
                    )}
                </div>

                <button
                    onClick={handleClearFilters}
                    disabled={isClean}
                    title="Limpiar todos los filtros"
                    className={`h-[42px] w-[42px] flex-none p-2.5 rounded-lg border transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/10 flex items-center justify-center ${
                        isClean
                            ? "bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed dark:bg-gray-800/50 dark:text-gray-600 dark:border-gray-800"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 shadow-sm hover:shadow"
                    }`}
                >
                    <RotateCcw className="h-4 w-4" />
                </button>

                <button
                    onClick={onRefresh}
                    title="Actualizar bandeja"
                    className="h-[42px] w-[42px] flex-none p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-lg border border-transparent focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all shadow-sm flex items-center justify-center"
                >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                </button>
            </div>

            {/* Rejilla de segmentación */}
            <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] overflow-visible">
                <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 p-1.5 rounded-lg mr-3 shadow-sm">
                        <Filter className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-xs font-extrabold text-gray-800 dark:text-gray-100 tracking-wide uppercase">Segmentación</h3>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Filtra por estado, tipo o localización del remitente.</p>
                    </div>
                </div>

                <div className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-x-5 gap-y-4">

                        {/* Estado */}
                        <div className="flex flex-col gap-1.5 focus-within:relative z-10 group">
                            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1 group-focus-within:text-blue-600 transition-colors">Estado</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value === "todos" ? "todos" : parseInt(e.target.value))}
                                className="w-full px-3 py-2 text-sm border-b-2 border-transparent bg-white shadow-sm hover:shadow focus:shadow-md dark:bg-gray-800 focus:bg-white focus:border-blue-500 dark:focus:bg-gray-900 dark:focus:border-blue-400 dark:text-gray-100 rounded-lg outline-none transition-all cursor-pointer"
                            >
                                <option value="todos">Todos los estados</option>
                                <option value={ESTADOS_CLIENTE.LISTA_BLANCA}>Lista Blanca (Canarias)</option>
                                <option value={ESTADOS_CLIENTE.LISTA_NEGRA}>Lista Negra</option>
                                <option value={ESTADOS_CLIENTE.LISTA_BLANCA_NACIONAL}>Lista Blanca Nacional</option>
                                <option value={ESTADOS_CLIENTE.OTRO_TIPO}>Otro Tipo</option>
                                <option value={ESTADOS_CLIENTE.COMPETENCIA}>Competencia</option>
                                <option value={ESTADOS_CLIENTE.REVISION}>Revisión</option>
                                <option value={ESTADOS_CLIENTE.CONTACTOS_BODY}>Contactos solo body</option>
                                <option value={ESTADOS_CLIENTE.PRUEBAS_INTERNAS}>Pruebas Internas</option>
                                <option value={ESTADOS_CLIENTE.PENDIENTE}>Sin Clasificar</option>
                            </select>
                        </div>

                        {/* Tipo de Entidad */}
                        <div className="flex flex-col gap-1.5 focus-within:relative z-10 group">
                            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1 group-focus-within:text-blue-600 transition-colors">Tipo de Entidad</label>
                            <select
                                value={filterType}
                                onChange={(e) => {
                                    setFilterType(e.target.value);
                                    setFilterSubType("todos");
                                    setFilterMunicipio([]);
                                    if (setFilterClase) setFilterClase("todos");
                                }}
                                className="w-full px-3 py-2 text-sm border-b-2 border-transparent bg-white shadow-sm hover:shadow focus:shadow-md dark:bg-gray-800 focus:bg-white focus:border-blue-500 dark:focus:bg-gray-900 dark:focus:border-blue-400 dark:text-gray-100 rounded-lg outline-none transition-all cursor-pointer"
                            >
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

                        {/* Subtipo */}
                        <div className="flex flex-col gap-1.5 focus-within:relative z-10 group">
                            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1 truncate group-focus-within:text-blue-600 transition-colors">Subtipo / Entidad</label>
                            <select
                                value={filterSubType}
                                onChange={(e) => {
                                    setFilterSubType(e.target.value);
                                    setFilterMunicipio([]);
                                    if (setFilterClase) setFilterClase("todos");
                                }}
                                disabled={!filterType || filterType === "todos"}
                                className={`w-full px-3 py-2 text-sm border-b-2 border-transparent rounded-lg outline-none transition-all ${
                                    !filterType || filterType === "todos"
                                        ? "bg-transparent text-gray-400 dark:text-gray-600 opacity-60 cursor-not-allowed border border-gray-200 dark:border-gray-700/50"
                                        : "bg-white shadow-sm hover:shadow focus:shadow-md dark:bg-gray-800 focus:bg-white focus:border-blue-500 dark:focus:bg-gray-900 dark:focus:border-blue-400 dark:text-gray-100 cursor-pointer"
                                }`}
                            >
                                <option value="todos">Cualquiera</option>
                                {subTypeOptions.map((st) => (
                                    <option key={st} value={st}>{formatLabel(st)}</option>
                                ))}
                            </select>
                        </div>

                        {/* Clase */}
                        <div className="flex flex-col gap-1.5 focus-within:relative z-10 group">
                            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1 truncate group-focus-within:text-blue-600 transition-colors">Clase / Cargo</label>
                            <select
                                value={filterClase || "todos"}
                                onChange={(e) => setFilterClase && setFilterClase(e.target.value)}
                                disabled={!filterSubType || filterSubType === "todos" || claseOptions.length === 0}
                                className={`w-full px-3 py-2 text-sm border-b-2 border-transparent rounded-lg outline-none transition-all ${
                                    !filterSubType || filterSubType === "todos" || claseOptions.length === 0
                                        ? "bg-transparent text-gray-400 dark:text-gray-600 opacity-60 cursor-not-allowed border border-gray-200 dark:border-gray-700/50"
                                        : "bg-white shadow-sm hover:shadow focus:shadow-md dark:bg-gray-800 focus:bg-white focus:border-blue-500 dark:focus:bg-gray-900 dark:focus:border-blue-400 dark:text-gray-100 cursor-pointer"
                                }`}
                            >
                                <option value="todos">Cualquiera</option>
                                {claseOptions.map((c) => (
                                    <option key={c} value={c}>{formatLabel(c)}</option>
                                ))}
                            </select>
                        </div>

                        {/* Comunidad */}
                        <div className="flex flex-col gap-1.5 focus-within:relative z-10 group">
                            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1 truncate group-focus-within:text-blue-600 transition-colors">Comunidad</label>
                            <select
                                value={filterComunidad}
                                onChange={(e) => {
                                    setFilterComunidad(e.target.value);
                                    setFilterIsla("todos");
                                    setFilterMunicipio([]);
                                }}
                                disabled={!isListaBlancaNacional}
                                className={`w-full px-3 py-2 text-sm border-b-2 border-transparent rounded-lg outline-none transition-all ${
                                    !isListaBlancaNacional
                                        ? "bg-transparent text-gray-400 dark:text-gray-600 opacity-60 cursor-not-allowed border border-gray-200 dark:border-gray-700/50"
                                        : "bg-white shadow-sm hover:shadow focus:shadow-md dark:bg-gray-800 focus:bg-white focus:border-blue-500 dark:focus:bg-gray-900 dark:focus:border-blue-400 dark:text-gray-100 cursor-pointer"
                                }`}
                            >
                                <option value="todos">Todas</option>
                                {COMUNIDADES_AUTONOMAS_ESPANA.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        {/* Isla / Provincia */}
                        <div className="flex flex-col gap-1.5 focus-within:relative z-10 group">
                            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1 truncate group-focus-within:text-blue-600 transition-colors">Isla / Provincia</label>
                            <select
                                value={filterIsla}
                                onChange={(e) => {
                                    setFilterIsla(e.target.value);
                                    setFilterMunicipio([]);
                                }}
                                disabled={hideIslaCompletely}
                                className={`w-full px-3 py-2 text-sm border-b-2 border-transparent rounded-lg outline-none transition-all ${
                                    hideIslaCompletely
                                        ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-500 opacity-90 cursor-not-allowed shadow-none"
                                        : "bg-white shadow-sm hover:shadow focus:shadow-md dark:bg-gray-800 focus:bg-white focus:border-blue-500 dark:focus:bg-gray-900 dark:focus:border-blue-400 dark:text-gray-100 cursor-pointer"
                                }`}
                            >
                                <option value="todos">{hideIslaCompletely ? "Derivado del Subtipo" : "Todas"}</option>
                                {(!hideIslaCompletely ? islasParaMostrar : []).map((isla) => (
                                    <option key={isla} value={isla}>{isla}</option>
                                ))}
                            </select>
                        </div>

                        {/* Municipio */}
                        <div className="flex flex-col gap-1.5 focus-within:relative z-10 group">
                            <div className={`${!effectiveAreaValue || effectiveAreaValue === "todos" || municipiosParaMostrar.length === 0 ? "opacity-60" : ""}`}>
                                <MultiSelectField
                                    label="Municipio"
                                    name="municipio"
                                    options={municipioOptions}
                                    value={selectedMunicipios.join(",")}
                                    onChange={handleMunicipioChange}
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

                    {/* Acordeón filtros adicionales */}
                    <details className="group mt-4 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700/60 bg-white shadow-sm dark:bg-gray-800/80">
                        <summary className="flex cursor-pointer items-center justify-between px-5 py-3 font-semibold text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors list-none">
                            <div className="flex items-center gap-3">
                                <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-1.5 group-open:bg-blue-100 dark:group-open:bg-blue-900/50 group-open:text-blue-600 transition-colors flex items-center justify-center">
                                    <Filter className="w-3.5 h-3.5" />
                                </div>
                                <span className="tracking-wide">Filtros Adicionales (MMI, Licitaciones, Suscripción, Frecuencia)</span>
                                {hasExtraFilters && <span className="ml-1 h-2 w-2 rounded-full bg-blue-500" />}
                            </div>
                            <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-full group-open:bg-blue-100 dark:group-open:bg-blue-900/40 text-gray-500 group-open:text-blue-600 transition-colors">
                                <svg className="transition-transform duration-300 group-open:rotate-180" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" width="16"><path d="M6 9l6 6 6-6" /></svg>
                            </div>
                        </summary>

                        <div className="border-t border-gray-100 dark:border-gray-700/60 px-6 pt-5 pb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 bg-gray-50/50 dark:bg-gray-900/20">
                            <div className="flex flex-col gap-1.5 focus-within:relative z-10 group">
                                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1 group-focus-within:text-blue-600">Cliente MMI</label>
                                <select value={filterUsuarioMMI} onChange={(e) => setFilterUsuarioMMI(e.target.value)}
                                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white shadow-sm hover:shadow focus:shadow-md dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 dark:text-gray-100 rounded-lg outline-none transition-all cursor-pointer">
                                    <option value="todos">Cualquiera</option>
                                    <option value="true">Es usuario</option>
                                    <option value="false">No es usuario</option>
                                    <option value="sin_datos">Sin datos</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5 focus-within:relative z-10 group">
                                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1 group-focus-within:text-blue-600">Licitaciones</label>
                                <select value={filterLicita} onChange={(e) => setFilterLicita(e.target.value)}
                                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white shadow-sm hover:shadow focus:shadow-md dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 dark:text-gray-100 rounded-lg outline-none transition-all cursor-pointer">
                                    <option value="todos">Cualquiera</option>
                                    <option value="1">Sí Licita</option>
                                    <option value="0">No Licita</option>
                                    <option value="sin_datos">Sin Datos</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5 focus-within:relative z-10 group">
                                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1 group-focus-within:text-blue-600">Suscripción</label>
                                <select value={filterSuscripcion} onChange={(e) => setFilterSuscripcion(e.target.value)}
                                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white shadow-sm hover:shadow focus:shadow-md dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 dark:text-gray-100 rounded-lg outline-none transition-all cursor-pointer">
                                    <option value="todos">Cualquiera</option>
                                    <option value="activa">Suscripción Activa</option>
                                    <option value="inactiva">No Suscritas</option>
                                </select>
                            </div>

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

            {/* Chips de resumen */}
            <div className="flex items-center flex-wrap gap-2 px-1">
                <div className="text-sm font-bold text-gray-700 dark:text-gray-300 mr-2 flex items-center gap-2 border-r border-gray-300 dark:border-gray-700 pr-4 py-1">
                    <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="bg-blue-100/80 text-blue-800 font-extrabold text-xs px-2.5 py-1 rounded-md dark:bg-blue-900/50 dark:text-blue-300 tracking-wide">
                        {filteredCount} / {totalCount}
                    </span>
                    <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Correos</span>
                </div>

                {searchTerm && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <span className="opacity-60 mr-1.5 uppercase tracking-wider">Búsqueda:</span>"{searchTerm}"
                    </div>
                )}

                {filterStatus !== "todos" && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-sm">
                        <span className="opacity-60 mr-1.5 uppercase tracking-wider">Est:</span>
                        {ESTADO_BADGE_DISPLAY[filterStatus]?.label ?? "Filtrado"}
                    </div>
                )}

                {filterType !== "todos" && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-sm">
                        <span className="opacity-60 mr-1.5 uppercase tracking-wider">Tipo:</span>
                        {isListaBlancaNacional && filterType === TIPOS_ENTIDAD.SECTOR_PUBLICO_CANARIO ? "Sector Público" : formatLabel(filterType)}
                    </div>
                )}

                {filterSubType && filterSubType !== "todos" && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 border border-pink-200 dark:border-pink-800 shadow-sm">
                        <span className="opacity-60 mr-1.5 uppercase tracking-wider">Sub:</span>{formatLabel(filterSubType)}
                    </div>
                )}

                {filterClase && filterClase !== "todos" && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border border-rose-200 dark:border-rose-800 shadow-sm">
                        <span className="opacity-60 mr-1.5 uppercase tracking-wider">Clase:</span>{formatLabel(filterClase)}
                    </div>
                )}

                {filterIsla !== "todos" && !hideIslaCompletely && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-sm">
                        <span className="opacity-60 mr-1.5 uppercase tracking-wider">{isListaBlancaNacional ? "Prov:" : "Isla:"}</span>{filterIsla}
                    </div>
                )}

                {hasSelectedMunicipios && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border border-teal-200 dark:border-teal-800 shadow-sm">
                        <span className="opacity-60 mr-1.5 uppercase tracking-wider">Mun:</span>{selectedMunicipios.join(", ")}
                    </div>
                )}

                {hasExtraFilters && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-sm">
                        + Filtros Extra
                    </div>
                )}

                {!isClean && (
                    <div className="ml-auto">
                        <button
                            onClick={handleClearFilters}
                            className="text-[10px] font-black text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 uppercase tracking-widest transition-colors py-1 px-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                            Borrar Filtros
                        </button>
                    </div>
                )}
            </div>

            {lastRefreshLabel && (
                <div className="flex justify-end -mt-2 pr-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50 px-2 py-0.5 rounded-md border border-gray-100 dark:border-gray-800">
                        Sincronización: {lastRefreshLabel}
                    </span>
                </div>
            )}
        </div>
    );
};

export default ZimbraFilters;
