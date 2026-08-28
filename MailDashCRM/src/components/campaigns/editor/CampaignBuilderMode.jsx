import React from "react";

export const ORGTYPES = [
    { id: "AYUNTAMIENTO", label: "Ayuntamiento" },
    { id: "ADMINISTRACION_AUTONOMICA", label: "Administración Autonómica" },
    { id: "CABILDO", label: "Cabildo" },
    { id: "MANCOMUNIDAD", label: "Mancomunidad" },
    { id: "ORGANISMO_AUTONOMO", label: "Organismo Autónomo" },
    { id: "EMPRESAS_PUBLICAS_CANARIAS", label: "Empresa Pública Canaria" },
    { id: "CONSORCIO", label: "Consorcio" },
    { id: "FUERZAS_SEGURIDAD", label: "Fuerzas de Seguridad" },
    { id: "DELEGACION_CENTRAL", label: "Delegación del Gobierno" },
    { id: "DEFAULT", label: "Por Defecto (Otros)" },
];

const CampaignBuilderMode = ({
    editingTpl,
    activeOrgType,
    setActiveOrgType,
    onFieldChange,
    onDynamicContentChange
}) => {
    return (
        <div className="p-5 space-y-5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Tipo de campaña
                    </label>
                    <input
                        type="text"
                        value={editingTpl.builder?.campaignType || ""}
                        onChange={(e) => onFieldChange("builder.campaignType", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 transition"
                    />
                </div>
                <div className="flex items-center gap-2 pt-6">
                    <input
                        id="useMetadata"
                        type="checkbox"
                        checked={!!editingTpl.builder?.useMetadata}
                        onChange={(e) => onFieldChange("builder.useMetadata", e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="useMetadata" className="text-sm text-slate-700 dark:text-slate-300">
                        Usar metadatos
                    </label>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Instrucciones base (Prompt Principal)
                </label>
                <textarea
                    rows={4}
                    value={editingTpl.builder?.instructions || ""}
                    onChange={(e) => onFieldChange("builder.instructions", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 transition"
                />
            </div>

            {/* SECCIÓN DINÁMICA POR TIPO DE ENTIDAD */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                <h4 className="text-md font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                    Personalización por Tipo de Entidad
                </h4>
                
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                    <div className="mb-4">
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">
                            Editando textos para:
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {ORGTYPES.map((type) => {
                                const hasContent = 
                                    editingTpl.builder?.dynamicContent?.[type.id]?.reto || 
                                    editingTpl.builder?.dynamicContent?.[type.id]?.app;
                                    
                                return (
                                    <button
                                        key={type.id}
                                        onClick={() => setActiveOrgType(type.id)}
                                        className={`relative px-3 py-1.5 text-xs font-medium rounded-full transition-colors border ${
                                            activeOrgType === type.id
                                                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                                : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-200 dark:hover:bg-slate-600"
                                        }`}
                                    >
                                        {type.label}
                                        {hasContent && (
                                            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 border border-white dark:border-slate-800"></span>
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 animate-fadeIn">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                            <h5 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">
                                {ORGTYPES.find(t => t.id === activeOrgType)?.label}
                            </h5>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Párrafo 1: El Reto / Problema
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Describe el reto específico..."
                                    value={editingTpl.builder?.dynamicContent?.[activeOrgType]?.reto || ""}
                                    onChange={(e) => onDynamicContentChange(activeOrgType, "reto", e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 transition"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Párrafo 2: La Solución / Aplicación
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Enumera las aplicaciones prácticas..."
                                    value={editingTpl.builder?.dynamicContent?.[activeOrgType]?.app || ""}
                                    onChange={(e) => onDynamicContentChange(activeOrgType, "app", e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 transition"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Ejemplos Buenos
                    </label>
                    <textarea
                        rows={4}
                        value={editingTpl.builder?.examplesGood || ""}
                        onChange={(e) => onFieldChange("builder.examplesGood", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 transition"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Ejemplos Malos
                    </label>
                    <textarea
                        rows={4}
                        value={editingTpl.builder?.examplesBad || ""}
                        onChange={(e) => onFieldChange("builder.examplesBad", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 transition"
                    />
                </div>
            </div>
        </div>
    );
};

export default CampaignBuilderMode;
