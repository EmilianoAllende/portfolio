import React from "react";
import { Save, Plus, Edit2 } from "lucide-react";

const CtasForm = ({
    formData,
    setFormData,
    editingId,
    isLoading,
    handleSubmit,
    handleCancelEdit,
}) => {
    return (
        <div
            className={`p-5 rounded-xl border transition-colors ${
                editingId
                    ? "bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800"
                    : "bg-blue-50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-800/50"
            }`}>
            <div className="flex justify-between items-center mb-4">
                <h4
                    className={`text-sm font-semibold flex items-center gap-2 ${
                        editingId
                            ? "text-amber-800 dark:text-amber-300"
                            : "text-blue-800 dark:text-blue-300"
                    }`}>
                    {editingId ? <Edit2 size={16} /> : <Plus size={16} />}
                    {editingId ? "Editar CTA" : "Nuevo CTA"}
                </h4>
                {editingId && (
                    <button
                        onClick={handleCancelEdit}
                        className="text-xs text-slate-500 hover:text-slate-700 underline">
                        Cancelar edición
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                            Etiqueta
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Ej: Demo agenda"
                            value={formData.label}
                            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                            Categoría (opcional)
                        </label>
                        <input
                            type="text"
                            placeholder="Ej: Reuniones"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                            Texto del botón
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Ej: Agendar reunión"
                            value={formData.buttonText}
                            onChange={(e) =>
                                setFormData({ ...formData, buttonText: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                            URL del botón
                        </label>
                        <input
                            type="url"
                            required
                            placeholder="https://..."
                            value={formData.buttonUrl}
                            onChange={(e) =>
                                setFormData({ ...formData, buttonUrl: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`px-4 py-2 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50 ${
                            editingId
                                ? "bg-amber-600 hover:bg-amber-700"
                                : "bg-blue-600 hover:bg-blue-700"
                        }`}>
                        <Save size={16} />
                        {editingId ? "Actualizar CTA" : "Guardar CTA"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CtasForm;
