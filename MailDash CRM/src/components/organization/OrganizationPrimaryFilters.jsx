import React from 'react';

const OrganizationPrimaryFilters = ({
    filterStatus, setFilterStatus,
    filterType, setFilterType,
    filterSubType, setFilterSubType,
    filterComunidad, setFilterComunidad,
    filterIsla, setFilterIsla,
    isListaBlancaNacional,
    subTypeOptions, formatLabel, sectorPublicoLabel, islasParaMostrar,
    ESTADOS_CLIENTE, TIPOS_ENTIDAD, COMUNIDADES_AUTONOMAS_ESPANA
}) => {
    return (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {/* 1. Selector de Estado */}
            <select
                value={filterStatus}
                onChange={(e) =>
                    setFilterStatus(
                        e.target.value === "todos" ? "todos" : parseInt(e.target.value)
                    )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors">
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

            {/* 2. Selector de Tipo (Primer Nivel) */}
            <select
                value={filterType}
                onChange={(e) => {
                    setFilterType(e.target.value);
                    setFilterSubType("todos"); // Resetear subtipo al cambiar tipo
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors">
                <option value="todos">Todos los tipos</option>
                <option value={TIPOS_ENTIDAD.SECTOR_PUBLICO_CANARIO}>{sectorPublicoLabel}</option>
                <option value={TIPOS_ENTIDAD.EMPRESAS}>Empresas</option>
                <option value={TIPOS_ENTIDAD.ASOCIACIONES}>Asociaciones</option>
                <option value={TIPOS_ENTIDAD.MEDIOS}>Medios</option>
                <option value={TIPOS_ENTIDAD.AGENCIAS}>Agencias</option>
                <option value={TIPOS_ENTIDAD.CON_COMPETIDORES}>Con Competidores</option>
            </select>

            {/* 3. Selector de Sub-Tipo */}
            <select
                value={filterSubType}
                onChange={(e) => setFilterSubType(e.target.value)}
                disabled={!filterType || filterType === "todos"}
                className={`w-full px-3 py-2 border rounded-lg outline-none transition-colors ${!filterType || filterType === "todos"
                    ? "bg-gray-100 border-gray-200 text-gray-400 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-600 cursor-not-allowed"
                    : "bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    }`}>
                <option value="todos">Todos los subtipos</option>
                {subTypeOptions.map((subType) => (
                    <option key={subType} value={subType}>
                        {formatLabel(subType)}
                    </option>
                ))}
            </select>

            {/* Selector de Comunidad Autónoma (Solo Nacional) */}
            <select
                value={filterComunidad}
                onChange={(e) => {
                    setFilterComunidad(e.target.value);
                    setFilterIsla("todos"); // Resetear provincia al cambiar comunidad
                }}
                disabled={!isListaBlancaNacional}
                className={`w-full px-3 py-2 border rounded-lg outline-none transition-colors ${!isListaBlancaNacional
                    ? "bg-gray-100 border-gray-200 text-gray-400 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-600 cursor-not-allowed"
                    : "bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    }`}>
                <option value="todos">Todas las Comunidades</option>
                {COMUNIDADES_AUTONOMAS_ESPANA.map((com) => (
                    <option key={com} value={com}>
                        {com}
                    </option>
                ))}
            </select>

            {/* 4. Selector de Isla / Provincia */}
            <select
                value={filterIsla}
                onChange={(e) => setFilterIsla(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors">
                <option value="todos">{isListaBlancaNacional ? "Todas las provincias" : "Todas las islas"}</option>
                {islasParaMostrar.map((isla) => (
                    <option key={isla} value={isla}>
                        {isla}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default OrganizationPrimaryFilters;
