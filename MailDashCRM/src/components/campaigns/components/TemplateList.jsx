import React from "react";

const TemplateList = ({
    campaignTemplates = [],
    selectedTplId,
    setSelectedTplId,
    isLoadingTemplates,
}) => {
    return (
        <div className="md:col-span-1 border-r border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-900/20">
            <div className="p-3 space-y-1 max-h-96 overflow-y-auto scrollbar-thin">
                {isLoadingTemplates && (
                    <div className="p-3 text-sm text-slate-600 dark:text-slate-300 text-center animate-pulse">
                        Cargando plantillas...
                    </div>
                )}
                {!isLoadingTemplates && campaignTemplates.length === 0 && (
                    <div className="p-3 text-sm text-slate-600 dark:text-slate-300 text-center">
                        No hay plantillas.
                    </div>
                )}
                {campaignTemplates.length > 0
                    ? campaignTemplates.map((tpl) => (
                        <button
                            key={tpl.id}
                            onClick={() => setSelectedTplId(tpl.id)}
                            className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${selectedTplId === tpl.id
                                    ? "bg-blue-50 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700 shadow-sm"
                                    : "border-transparent hover:bg-slate-100 dark:hover:bg-slate-700/40"
                                }`}>
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-slate-800 dark:text-slate-100">
                                    {tpl.title}
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 dark:text-slate-300">
                                    {tpl.mode === "raw" ? "RAW" : "Builder"}
                                </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                {tpl.description}
                            </p>
                            {/* Mostrar autor si existe */}
                            {(tpl.created_by || tpl.author) && (
                                <span className="block mt-1 text-[10px] text-blue-500 uppercase tracking-wide font-semibold">
                                    Por: {tpl.created_by || tpl.author}
                                </span>
                            )}
                        </button>
                    ))
                    : null}
            </div>
        </div>
    );
};

export default TemplateList;
