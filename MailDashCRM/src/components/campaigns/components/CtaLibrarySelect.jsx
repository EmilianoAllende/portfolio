import React from "react";

const CtaLibrarySelect = ({
    ctas = [],
    isLoading,
    onApply,
    onClear,
    onManage,
    selectedCtaId = "",
}) => {
    const handleSelect = (event) => {
        const selectedId = event.target.value;
        if (!selectedId) {
            onClear?.();
            return;
        }

        const selectedCta = ctas.find((cta) => cta.id.toString() === selectedId.toString());
        if (selectedCta) {
            onApply?.(selectedCta);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
            <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Biblioteca CTA (reutilizable)
                </label>
                <select
                    disabled={isLoading}
                    value={selectedCtaId || ""}
                    onChange={handleSelect}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 transition text-sm disabled:opacity-70">
                    <option value="">
                        {isLoading
                            ? "Cargando CTAs..."
                            : ctas.length === 0
                              ? "No hay CTAs guardados"
                              : "Selecciona un CTA para aplicar..."}
                    </option>
                    {ctas.map((cta) => (
                        <option key={cta.id} value={cta.id}>
                            {cta.label} · {cta.buttonText}
                        </option>
                    ))}
                </select>
            </div>
            <button
                type="button"
                onClick={onManage}
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                Gestionar CTAs
            </button>
        </div>
    );
};

export default CtaLibrarySelect;
