import React from "react";
import { Trash2, Save, Mail } from "lucide-react";

const EditorActions = ({
    handleUseClick,
    handleDeleteClick,
    handleSaveClick,
}) => {
    return (
        <div className="flex items-center gap-3 justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
                onClick={handleUseClick}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-700">
                <Mail size={16} /> Usar en envío
            </button>
            <button
                onClick={handleDeleteClick}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-red-600 text-red-600 hover:bg-red-50 dark:text-red-400 dark:border-red-700">
                <Trash2 size={16} /> Eliminar
            </button>
            <button
                onClick={handleSaveClick}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700">
                <Save size={16} /> Guardar cambios
            </button>
        </div>
    );
};

export default EditorActions;
