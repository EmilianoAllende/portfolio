import React from 'react';

const OrganizationActiveFilters = ({
    filteredOrgsLength, totalOrgsLength,
    searchTerm, filterStatus, filterType, filterSubType,
    filterComunidad, filterIsla, filterMunicipio, filterSuscripcion,
    filterUsuarioMMI,
    filterLicita, filterFrecuencia,
    isClean, handleClearFilters,
    isListaBlancaNacional, ESTADOS_CLIENTE, TIPOS_ENTIDAD, formatLabel
}) => {
    const selectedMunicipios = Array.isArray(filterMunicipio) ? filterMunicipio : [];

    return (
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1 flex-wrap gap-y-1">
            {/* El contador se muestra SIEMPRE */}
            <span className="mr-1">
                Mostrando {filteredOrgsLength} de {totalOrgsLength} organizaciones
            </span>

            {searchTerm && (
                <span className="mr-1 font-medium text-gray-700 dark:text-gray-300">
                    que coinciden con "{searchTerm}"
                </span>
            )}

            {filterStatus !== "todos" && (
                <span className="mr-1">
                    , estado:{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                        {filterStatus === ESTADOS_CLIENTE.LISTA_BLANCA
                            ? "Lista Blanca"
                            : filterStatus === ESTADOS_CLIENTE.LISTA_NEGRA
                                ? "Lista Negra"
                                : filterStatus === ESTADOS_CLIENTE.LISTA_BLANCA_NACIONAL
                                    ? "Lista Blanca Nacional"
                                    : filterStatus === ESTADOS_CLIENTE.OTRO_TIPO
                                        ? "Otro Tipo"
                                        : filterStatus === ESTADOS_CLIENTE.COMPETENCIA
                                            ? "Competencia"
                                            : filterStatus === ESTADOS_CLIENTE.REVISION
                                                ? "Revisión"
                                                : filterStatus === ESTADOS_CLIENTE.CONTACTOS_BODY
                                                    ? "Contactos solo body"
                                                    : filterStatus === ESTADOS_CLIENTE.PRUEBAS_INTERNAS
                                                        ? "Pruebas Internas"
                                                        : filterStatus === ESTADOS_CLIENTE.PENDIENTE
                                                            ? "Pendiente"
                                                            : filterStatus}
                    </span>
                </span>
            )}

            {filterType !== "todos" && (
                <span className="mr-1">
                    , tipo:{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                        {isListaBlancaNacional && filterType === TIPOS_ENTIDAD.SECTOR_PUBLICO_CANARIO
                            ? "Sector Público"
                            : formatLabel(filterType)}
                    </span>
                </span>
            )}

            {filterSubType && filterSubType !== "todos" && (
                <span className="mr-1">
                    , subtipo:{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                        {formatLabel(filterSubType)}
                    </span>
                </span>
            )}

            {isListaBlancaNacional && filterComunidad !== "todos" && (
                <span className="mr-1">
                    , CCAA:{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                        {filterComunidad}
                    </span>
                </span>
            )}

            {filterIsla !== "todos" && (
                <span className="mr-1">
                    , {isListaBlancaNacional ? "provincia" : "isla"}:{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                        {filterIsla}
                    </span>
                </span>
            )}

            {selectedMunicipios.length > 0 && (
                <span className="mr-1">
                    , municipio:{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                        {selectedMunicipios.join(", ")}
                    </span>
                </span>
            )}

            <span className="mr-1">
                , suscripción:{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                    {filterSuscripcion === "activa" ? "Activa" : "No suscritas"}
                </span>
            </span>

            {filterUsuarioMMI !== "todos" && (
                <span className="mr-1">
                    , cliente MMI:{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                        {filterUsuarioMMI === "true" ? "Es usuario" : filterUsuarioMMI === "false" ? "No es usuario" : "Sin datos"}
                    </span>
                </span>
            )}

            {filterLicita !== "todos" && (
                <span className="mr-1">
                    , licitaciones:{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                        {filterLicita === "1" ? "Licita" : filterLicita === "0" ? "No Licita" : "Sin Datos"}
                    </span>
                </span>
            )}

            {filterFrecuencia && filterFrecuencia !== "todas" && (
                <span className="mr-1">
                    , frecuencia:{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {filterFrecuencia === "alta" ? "Frec. Alta" : filterFrecuencia === "media" ? "Frec. Media" : "Frec. Baja"}
                    </span>
                </span>
            )}

            {!isClean && (
                <button
                    onClick={handleClearFilters}
                    className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium underline decoration-transparent hover:decoration-current transition-all">
                    (Limpiar filtros)
                </button>
            )}
        </div>
    );
};

export default OrganizationActiveFilters;
