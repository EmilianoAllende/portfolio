import React, { useState } from 'react';
import { HelpCircle } from "lucide-react";

const OrganizationFrequencyFilter = ({
    filterFrecuencia,
    setFilterFrecuencia
}) => {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div className="flex items-center gap-2">
            <select
                value={filterFrecuencia}
                onChange={(e) => setFilterFrecuencia(e.target.value)}
                className="flex-1 w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            >
                <option value="todas">Todas las frec.</option>
                <option value="alta">Frec. Alta</option>
                <option value="media">Frec. Media</option>
                <option value="baja">Frec. Baja</option>
                <option value="sin_datos">Sin Datos</option>
            </select>
            <div 
                className="relative flex-shrink-0 flex items-center justify-center cursor-help p-1"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
            >
                <HelpCircle className={`w-5 h-5 transition-colors ${showTooltip ? 'text-blue-500' : 'text-gray-400'}`} />
                
                {/* Tooltip personalizado */}
                {showTooltip && (
                    <div className="absolute bottom-full right-0 mb-2 w-48 p-2.5 text-xs font-medium text-left text-white bg-gray-800 dark:bg-gray-700 rounded-lg transition-all duration-200 z-50 shadow-xl leading-relaxed">
                        La Frecuencia se calcula semanalmente, de acuerdo a la cantidad de Comunicados de Prensa recibidos durante las dos semanas previas.
                        {/* Triángulo inferior */}
                        <div className="absolute top-full right-1.5 border-[5px] border-transparent border-t-gray-800 dark:border-t-gray-700"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrganizationFrequencyFilter;
