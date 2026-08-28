import React from 'react';
import OrganizationFrequencyFilter from "./OrganizationFrequencyFilter";

const OrganizationSecondaryFilters = ({
    filterLicita, setFilterLicita,
    filterSuscripcion, setFilterSuscripcion,
    filterFrecuencia, setFilterFrecuencia
}) => {
    return (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {/* 5. Selector de Licitaciones */}
            <select
                value={filterLicita}
                onChange={(e) => setFilterLicita(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors">
                <option value="todos">Licitaciones (Todos)</option>
                <option value="1">Licita</option>
                <option value="0">No Licita</option>
                <option value="sin_datos">Sin Datos</option>
            </select>

            {/* 6. Selector de Suscripción */}
            <select
                value={filterSuscripcion}
                onChange={(e) => setFilterSuscripcion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors">
                <option value="activa">Suscripción activa</option>
                <option value="inactiva">No suscritas</option>
            </select>

            {/* 7. Selector de Frecuencia */}
            <OrganizationFrequencyFilter
                filterFrecuencia={filterFrecuencia}
                setFilterFrecuencia={setFilterFrecuencia}
            />
        </div>
    );
};

export default OrganizationSecondaryFilters;
