import React from "react";
import { useSenders } from "../../../hooks/useSenders";

const SenderSelector = ({ editingTpl, setEditingTpl }) => {
    const { senders, isLoading } = useSenders();

    if (!editingTpl) return null;

    // Handle backward compatibility: map displayName to ID for the select value
    const currentValue = editingTpl.builder?.senderName || "";
    let selectValue = currentValue;
    if (currentValue && senders && senders.length > 0) {
        const matchingSender = senders.find(s => s.displayName === currentValue || s.id.toString() === currentValue);
        if (matchingSender) {
            selectValue = matchingSender.id.toString();
        }
    }

    return (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Remitente (Firma y Email)
            </label>

            {isLoading ? (
                <div className="text-xs text-slate-500 italic py-2">Cargando remitentes...</div>
            ) : (
                <>
                    <select
                        value={selectValue}
                        onChange={(e) => {
                            const selectedId = e.target.value;
                            const selectedOption = senders.find(
                                (opt) => opt.id.toString() === selectedId
                            );
                            const nextState = JSON.parse(JSON.stringify(editingTpl));

                            if (!nextState.builder) nextState.builder = {};

                            // Store ID directly, compatible with new standard
                            nextState.builder.senderName = selectedId;

                            if (selectedOption) {
                                nextState.builder.senderEmail = selectedOption.email;
                                nextState.builder.senderFooter = selectedOption.footerText;
                            } else {
                                nextState.builder.senderName = "";
                                nextState.builder.senderEmail = "";
                                nextState.builder.senderFooter = "";
                            }

                            setEditingTpl(nextState);
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 transition">
                        <option value="">-- Seleccionar remitente predefinido --</option>

                        {senders.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.label} ({option.email})
                            </option>
                        ))}
                    </select>

                    {/* Mostrar visualmente qué email se usará */}
                    {editingTpl.builder?.senderEmail && (
                        <p className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-mono">
                            ✉️ Se enviará desde: <strong>{editingTpl.builder.senderEmail}</strong>
                        </p>
                    )}

                    {senders.length === 0 && !isLoading && (
                        <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                            No hay remitentes configurados. Usa el botón de engranaje en la cabecera para añadir uno.
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default SenderSelector;
