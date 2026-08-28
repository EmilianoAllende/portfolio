import React from "react";
import { Edit2, Trash2 } from "lucide-react";

const CtasList = ({ ctas, editingId, handleEditClick, handleDelete }) => {
    return (
        <div>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                CTAs existentes
            </h4>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {ctas.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm italic">
                        No hay CTAs registrados.
                    </div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 font-medium">
                            <tr>
                                <th className="px-4 py-3">Etiqueta</th>
                                <th className="px-4 py-3">Texto</th>
                                <th className="px-4 py-3">URL</th>
                                <th className="px-4 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {ctas.map((cta) => (
                                <tr
                                    key={cta.id}
                                    className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                                        editingId === cta.id
                                            ? "bg-amber-50 dark:bg-amber-900/10"
                                            : ""
                                    }`}>
                                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">
                                        {cta.label}
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                        {cta.buttonText}
                                    </td>
                                    <td className="px-4 py-3 text-slate-500 font-mono text-xs max-w-[220px] truncate">
                                        {cta.buttonUrl}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEditClick(cta)}
                                                className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-1.5 rounded transition-colors"
                                                title="Editar">
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cta.id)}
                                                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded transition-colors"
                                                title="Eliminar">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default CtasList;
