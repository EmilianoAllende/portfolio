import React from "react";

const BasicInfoFields = ({ editingTpl, handleFieldChange }) => {
    if (!editingTpl) return null;

    return (
        <>
            {/* Título e ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Título
                    </label>
                    <input
                        type="text"
                        value={editingTpl.title}
                        onChange={(e) => handleFieldChange("title", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 transition"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        ID (solo lectura)
                    </label>
                    <input
                        type="text"
                        value={editingTpl.id}
                        disabled
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 cursor-not-allowed"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Descripción
                </label>
                <textarea
                    rows={2}
                    value={editingTpl.description}
                    onChange={(e) => handleFieldChange("description", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 transition"
                />
            </div>

            {/* Selector de modo */}
            <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Modo
                </label>
                <select
                    value={editingTpl.mode}
                    onChange={(e) => handleFieldChange("mode", e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 transition">
                    <option value="builder">Builder</option>
                    <option value="raw">RAW (prompt completo)</option>
                </select>
            </div>
        </>
    );
};

export default BasicInfoFields;
