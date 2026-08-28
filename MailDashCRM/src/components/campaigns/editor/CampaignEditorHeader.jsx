import React from "react";
import { Archive, ArchiveRestore, Trash2, Save, Mail } from "lucide-react";

const CampaignEditorHeader = ({
    editingTpl,
    hasUnsavedChanges,
    onFieldChange,
    onToggleStatus,
    onDeleteTemplate,
    onSaveTemplate,
    onUseTemplate,
}) => {
    return (
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between shadow-sm z-10 gap-4">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    {editingTpl.active === false && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 text-[10px] uppercase font-bold rounded-md whitespace-nowrap">
                            Archivada
                        </span>
                    )}
                    <input
                        type="text"
                        value={editingTpl.title || ""}
                        onChange={(e) => onFieldChange("title", e.target.value)}
                        className="text-xl font-bold bg-transparent border-none focus:ring-0 text-slate-900 dark:text-slate-100 placeholder-slate-400 w-full p-0"
                        placeholder="Título de la campaña..."
                    />
                </div>
                <input
                    type="text"
                    value={editingTpl.placeholder || ""}
                    onChange={(e) => onFieldChange("placeholder", e.target.value)}
                    className="text-sm text-slate-500 dark:text-slate-400 bg-transparent border-none focus:ring-0 w-full mt-1 p-0"
                    placeholder="Descripción corta para la lista..."
                />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <button
                    onClick={onToggleStatus}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors font-medium text-sm whitespace-nowrap ${
                        editingTpl.active !== false
                            ? "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-transparent hover:border-amber-200 dark:hover:border-amber-800"
                            : "text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800"
                    }`}
                    title={editingTpl.active !== false ? "Archivar campaña (ocultar de las listas)" : "Reactivar campaña (volver a mostrar)"}
                >
                    {editingTpl.active !== false ? (
                        <><Archive size={16} /><span className="hidden sm:inline">Archivar</span></>
                    ) : (
                        <><ArchiveRestore size={16} /><span className="hidden sm:inline">Reactivar</span></>
                    )}
                </button>

                <button
                    onClick={onDeleteTemplate}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Eliminar plantilla permanentemente"
                >
                    <Trash2 size={20} />
                </button>
                
                <button
                    onClick={onSaveTemplate}
                    disabled={!hasUnsavedChanges}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-900 dark:disabled:hover:bg-slate-700"
                    title={!hasUnsavedChanges ? "No hay cambios por guardar" : "Guardar cambios"}
                >
                    <Save size={18} />
                    <span className="hidden sm:inline">Guardar</span>
                </button>

                <button
                    onClick={onUseTemplate}
                    disabled={!editingTpl}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 disabled:hover:shadow-sm disabled:transform-none"
                    title="Hacer una copia de esta plantilla para poder editarla (incluye cambios no guardados)"
                >
                    <Mail size={18} />
                    <span className="hidden sm:inline">Usar Plantilla</span>
                </button>
            </div>
        </div>
    );
};

export default CampaignEditorHeader;
