import React from "react";

const ActionButtonEditor = ({ editingTpl, handleFieldChange }) => {
    if (!editingTpl) return null;

    return (
        <div className="p-5 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                🔘 Botón de Acción (Opcional)
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                Si defines un botón aquí, se incluirá automáticamente en todos los emails
                generados con esta campaña.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Texto del botón
                    </label>
                    <input
                        type="text"
                        value={editingTpl.builder?.buttonText || ""}
                        onChange={(e) =>
                            handleFieldChange("builder.buttonText", e.target.value)
                        }
                        placeholder="Ej: Agendar reunión"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 transition text-sm"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        URL del botón
                    </label>
                    <input
                        type="url"
                        value={editingTpl.builder?.buttonUrl || ""}
                        onChange={(e) =>
                            handleFieldChange("builder.buttonUrl", e.target.value)
                        }
                        placeholder="Ej: https://calendly.com/..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 transition text-sm"
                    />
                </div>
            </div>
            {editingTpl.builder?.buttonText && editingTpl.builder?.buttonUrl && (
                <div className="mt-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-amber-300 dark:border-amber-700">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                        Vista previa del botón:
                    </p>
                    <div className="text-center">
                        <span className="inline-block bg-slate-800 dark:bg-slate-700 text-white px-6 py-2 rounded-md text-sm font-semibold">
                            {editingTpl.builder.buttonText}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActionButtonEditor;
