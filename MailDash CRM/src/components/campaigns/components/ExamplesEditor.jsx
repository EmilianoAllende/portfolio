import React from "react";

const ExamplesEditor = ({ editingTpl, handleFieldChange }) => {
    if (!editingTpl) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Ejemplos (Buenos)
                </label>
                <textarea
                    rows={4}
                    value={editingTpl.builder?.examplesGood || ""}
                    onChange={(e) =>
                        handleFieldChange("builder.examplesGood", e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 transition"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Ejemplos (Malos)
                </label>
                <textarea
                    rows={4}
                    value={editingTpl.builder?.examplesBad || ""}
                    onChange={(e) =>
                        handleFieldChange("builder.examplesBad", e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 transition"
                />
            </div>
        </div>
    );
};

export default ExamplesEditor;
