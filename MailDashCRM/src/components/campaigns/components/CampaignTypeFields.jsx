import React from "react";

const CampaignTypeFields = ({ editingTpl, handleFieldChange }) => {
    if (!editingTpl) return null;

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Tipo de campaña
                    </label>
                    <input
                        type="text"
                        value={editingTpl.builder?.campaignType || ""}
                        onChange={(e) =>
                            handleFieldChange("builder.campaignType", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 transition"
                    />
                </div>
                <div className="flex items-center gap-2 pt-6">
                    <input
                        id="useMetadata"
                        type="checkbox"
                        checked={!!editingTpl.builder?.useMetadata}
                        onChange={(e) =>
                            handleFieldChange("builder.useMetadata", e.target.checked)
                        }
                        className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                        htmlFor="useMetadata"
                        className="text-sm text-slate-700 dark:text-slate-300">
                        Usar metadatos
                    </label>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Instrucciones adicionales
                </label>
                <textarea
                    rows={4}
                    value={editingTpl.builder?.instructions || ""}
                    onChange={(e) =>
                        handleFieldChange("builder.instructions", e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 transition"
                />
            </div>
        </>
    );
};

export default CampaignTypeFields;
