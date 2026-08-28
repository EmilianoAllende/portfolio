import React from "react";

const RawEditor = ({ editingTpl, handleFieldChange }) => {
    if (!editingTpl) return null;

    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Prompt completo (RAW)
            </label>
            <textarea
                rows={10}
                value={editingTpl.rawPrompt || ""}
                onChange={(e) => handleFieldChange("rawPrompt", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 font-mono text-sm transition"
            />
        </div>
    );
};

export default RawEditor;
