import React, { useState } from "react";
import { User, ChevronDown, AlertTriangle } from "lucide-react";
import { DEFAULT_MEDIA_FOLLOWUP_SENDER_ID } from "../utils/normalizationUtils";

export default function EditEmailModal({ selectedItem, availableSenders, onClose, onSave, isSaving }) {
    const defaultSenderId = selectedItem.emailEnvioRaw?.senderId || DEFAULT_MEDIA_FOLLOWUP_SENDER_ID;
    
    const [subject, setSubject] = useState(selectedItem.subject || "");
    const [body, setBody] = useState(selectedItem.body || "");
    const [senderId, setSenderId] = useState(defaultSenderId);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 md:px-8 py-4 md:py-8">
            <div className="relative w-full h-full max-w-6xl overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-2xl flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Editar Correo</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors text-2xl"
                        disabled={isSaving}
                    >
                        ✕
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6 marko-scrollbar space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
                        <div className="flex-1">
                            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Para (Destinatario)</span>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{selectedItem.organizacion}</span>
                            </div>
                        </div>

                        <div className="flex-1 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700/50 pt-3 md:pt-0 md:pl-4">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <User size={12}/> De (Remitente)
                            </label>
                            
                            {availableSenders && availableSenders.length > 0 ? (
                                <div className="relative">
                                    <select
                                        value={senderId}
                                        onChange={(e) => setSenderId(e.target.value)}
                                        disabled={isSaving}
                                        className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 pr-8 transition-colors hover:border-blue-400 cursor-pointer shadow-sm"
                                    >
                                        {availableSenders.map(sender => (
                                            <option key={sender.id} value={sender.id}>
                                                {sender.label || sender.displayName} ({sender.email})
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg text-xs border border-amber-200 dark:border-amber-800">
                                    <AlertTriangle size={14} />
                                    <span>No hay remitentes configurados. Se usará el predeterminado.</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Asunto
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            disabled={isSaving}
                            className="block w-full px-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Cuerpo del mensaje
                        </label>
                        <textarea
                            rows="14"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            disabled={isSaving}
                            className="block w-full px-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-[13px] leading-relaxed resize-none"
                        />
                    </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
                    <button
                        onClick={onClose}
                        disabled={isSaving}
                        className="px-5 py-2.5 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onSave({ subject, body, senderId })}
                        disabled={isSaving}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 disabled:opacity-60"
                    >
                        {isSaving ? "Guardando..." : "Guardar Cambios"}
                    </button>
                </div>
            </div>
        </div>
    );
}
