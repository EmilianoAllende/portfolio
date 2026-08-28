import React from "react";
import { ORG_TYPES } from "../constants";

const DynamicContentEditor = ({
    editingTpl,
    activeOrgType,
    setActiveOrgType,
    handleDynamicContentChange,
}) => {
    if (!editingTpl) return null;

    return (
        <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
            <h4 className="text-md font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                🧩 Personalización por Tipo de Entidad
            </h4>

            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                {/* Selector de Tipo de Entidad */}
                <div className="mb-4">
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">
                        Editando textos para:
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {ORG_TYPES.map((type) => {
                            // Verificamos si este tipo tiene contenido guardado
                            const hasContent =
                                editingTpl.builder?.dynamicContent?.[type.id]?.reto ||
                                editingTpl.builder?.dynamicContent?.[type.id]?.app;

                            return (
                                <button
                                    key={type.id}
                                    onClick={() => setActiveOrgType(type.id)}
                                    className={`relative px-3 py-1.5 text-xs font-medium rounded-full transition-colors border ${activeOrgType === type.id
                                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                            : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-200 dark:hover:bg-slate-600"
                                        }`}>
                                    {/* Texto del botón */}
                                    {type.label}

                                    {/* Punto verde indicador de contenido */}
                                    {hasContent && (
                                        <span className={`absolute -top-1 -right-1 flex h-2.5 w-2.5`}>
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 border border-white dark:border-slate-800"></span>
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Campos de Edición para el Tipo Seleccionado */}
                <div className="grid grid-cols-1 gap-4 animate-fadeIn">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        <h5 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">
                            {ORG_TYPES.find((t) => t.id === activeOrgType)?.label}
                        </h5>

                        {/* Campo: RETO */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Párrafo 1: El Reto / Problema
                                <span className="text-xs font-normal text-slate-500 ml-2">
                                    (Ej: "la gestión de múltiples perfiles...")
                                </span>
                            </label>
                            <textarea
                                rows={2}
                                placeholder="Describe el reto específico de este tipo de entidad..."
                                value={
                                    editingTpl.builder?.dynamicContent?.[activeOrgType]?.reto || ""
                                }
                                onChange={(e) =>
                                    handleDynamicContentChange(
                                        activeOrgType,
                                        "reto",
                                        e.target.value
                                    )
                                }
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 transition"
                            />
                        </div>

                        {/* Campo: SOLUCIÓN / APLICACIÓN */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Párrafo 2/3: La Solución / Aplicación
                                <span className="text-xs font-normal text-slate-500 ml-2">
                                    (Ej: "comunicados del alcalde e información local...")
                                </span>
                            </label>
                            <textarea
                                rows={2}
                                placeholder="Enumera las aplicaciones prácticas..."
                                value={
                                    editingTpl.builder?.dynamicContent?.[activeOrgType]?.app || ""
                                }
                                onChange={(e) =>
                                    handleDynamicContentChange(
                                        activeOrgType,
                                        "app",
                                        e.target.value
                                    )
                                }
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 transition"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DynamicContentEditor;
