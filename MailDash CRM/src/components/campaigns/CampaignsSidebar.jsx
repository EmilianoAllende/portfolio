import React, { useState, useEffect, useMemo } from "react";
import { Plus, Search, X, Clock, ArrowDownAZ, ArrowUpAZ, Calendar, Settings } from "lucide-react";

const CampaignsSidebar = ({
    campaignTemplates,
    visibleTemplates: baseVisibleTemplates,
    senders = [],
    isLoadingTemplates,
    selectedTplId,
    onSelectTemplate,
    onAddTemplate,
    onOpenSenderManager,
    // 🔥 NUEVOS PROPS
    allTemplatesCount,
    inactiveCount,
    viewFilter,
    onViewFilterChange,
    onToggleStatus
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState("date_desc");
    const [senderFilter, setSenderFilter] = useState("all");
    const [sidebarWidth, setSidebarWidth] = useState(320);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            const newWidth = Math.max(250, Math.min(e.clientX, window.innerWidth - 300));
            setSidebarWidth(newWidth);
        };

        const handleMouseUp = () => {
            if (isDragging) setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
            document.body.style.userSelect = "none";
        } else {
            document.body.style.userSelect = "";
        }

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            document.body.style.userSelect = "";
        };
    }, [isDragging]);

    const normalizeText = (text) => {
        return String(text || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    };

    const scopedTemplates = useMemo(() => {
        if (Array.isArray(baseVisibleTemplates)) return baseVisibleTemplates;
        return Array.isArray(campaignTemplates) ? campaignTemplates : [];
    }, [baseVisibleTemplates, campaignTemplates]);

    const sortedTemplates = useMemo(() => {
        let processed = [...scopedTemplates];

        if (searchTerm.trim()) {
            const normalizedTerm = normalizeText(searchTerm);
            processed = processed.filter(t => {
                const titleMatch = normalizeText(t.title || "").includes(normalizedTerm);
                let contentMatch = false;

                if (t.mode === "raw") {
                    contentMatch = normalizeText(t.rawPrompt || "").includes(normalizedTerm);
                } else if (t.mode === "builder" && t.builder) {
                    contentMatch = normalizeText(t.builder.instructions || "").includes(normalizedTerm);
                }

                return titleMatch || contentMatch;
            });
        }

        processed.sort((a, b) => {
            let tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            let tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

            if (isNaN(tA)) tA = 0;
            if (isNaN(tB)) tB = 0;

            if (tA === 0 && a.id && a.id.startsWith("custom_")) {
                const parts = a.id.split("_");
                if (parts[1]) tA = parseInt(parts[1]) || 0;
            }
            if (tB === 0 && b.id && b.id.startsWith("custom_")) {
                const parts = b.id.split("_");
                if (parts[1]) tB = parseInt(parts[1]) || 0;
            }

            const titleA = (a.title || "").toLowerCase();
            const titleB = (b.title || "").toLowerCase();

            switch (sortOrder) {
                case "date_desc":
                    return tB - tA;
                case "date_asc":
                    return tA - tB;
                case "alpha_asc":
                    return titleA.localeCompare(titleB);
                case "alpha_desc":
                    return titleB.localeCompare(titleA);
                default:
                    return 0;
            }
        });
        return processed;
    }, [scopedTemplates, sortOrder, searchTerm]);

    const senderLabelMap = useMemo(() => {
        const map = new Map();
        (Array.isArray(senders) ? senders : []).forEach((sender) => {
            if (sender?.id === undefined || sender?.id === null) return;
            const key = String(sender.id);
            const resolvedLabel = sender.displayName || sender.label || sender.email || `Remitente ${key}`;
            map.set(
                key,
                resolvedLabel
            );
            if (sender.displayName) map.set(String(sender.displayName), resolvedLabel);
            if (sender.label) map.set(String(sender.label), resolvedLabel);
        });
        return map;
    }, [senders]);

    const senderMatchValuesMap = useMemo(() => {
        const map = new Map();
        (Array.isArray(senders) ? senders : []).forEach((sender) => {
            if (sender?.id === undefined || sender?.id === null) return;
            const key = String(sender.id);
            const matchValues = new Set([key]);
            if (sender.displayName) matchValues.add(String(sender.displayName));
            if (sender.label) matchValues.add(String(sender.label));
            map.set(key, matchValues);
        });
        return map;
    }, [senders]);

    const senderFilterOptions = useMemo(() => {
        const availableSenderIds = new Set();

        (Array.isArray(senders) ? senders : []).forEach((sender) => {
            if (sender?.id === undefined || sender?.id === null) return;
            availableSenderIds.add(String(sender.id));
        });

        scopedTemplates.forEach((template) => {
            const rawSenderId = template?.builder?.senderName;
            if (rawSenderId === undefined || rawSenderId === null || String(rawSenderId).trim() === "") {
                availableSenderIds.add("__NO_SENDER__");
                return;
            }
            availableSenderIds.add(String(rawSenderId));
        });

        const options = Array.from(availableSenderIds).map((id) => ({
            value: id,
            label: id === "__NO_SENDER__"
                ? "Sin remitente"
                : (senderLabelMap.get(id) || `Remitente ${id}`),
        }));

        options.sort((a, b) => a.label.localeCompare(b.label, "es", { sensitivity: "base" }));
        return options;
    }, [scopedTemplates, senders, senderLabelMap]);

    useEffect(() => {
        if (senderFilter === "all") return;
        const exists = senderFilterOptions.some((opt) => opt.value === senderFilter);
        if (!exists) setSenderFilter("all");
    }, [senderFilter, senderFilterOptions]);

    const visibleTemplates = useMemo(() => {
        if (senderFilter === "all") return sortedTemplates;
        return sortedTemplates.filter((template) => {
            const rawSenderId = template?.builder?.senderName;
            const normalized = rawSenderId === undefined || rawSenderId === null || String(rawSenderId).trim() === ""
                ? "__NO_SENDER__"
                : String(rawSenderId);
            if (normalized === senderFilter) return true;

            const allowedMatches = senderMatchValuesMap.get(String(senderFilter));
            return allowedMatches ? allowedMatches.has(normalized) : false;
        });
    }, [sortedTemplates, senderFilter, senderMatchValuesMap]);

    return (
        <div
            className="relative border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col flex-shrink-0"
            style={{ width: `${sidebarWidth}px` }}
        >
            <div
                onMouseDown={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                className={`absolute top-0 right-0 w-1.5 h-full cursor-col-resize z-50 transition-colors ${
                    isDragging ? "bg-blue-500" : "hover:bg-blue-400"
                }`}
                style={{ transform: "translateX(50%)" }}
            />

            <div className="p-4 border-b border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                        Plantillas
                    </h2>
                    <div className="flex gap-1">
                        <button
                            onClick={onOpenSenderManager}
                            className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                            title="Gestionar Remitentes"
                        >
                            <Settings size={18} />
                        </button>
                        <button
                            onClick={onAddTemplate}
                            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-sm"
                            title="Nueva Plantilla"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>

                <div className="relative mb-3">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={14} className="text-slate-400" />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar campaña..."
                        className="block w-full pl-9 pr-8 py-2 border border-slate-300 dark:border-slate-600 rounded-lg leading-5 bg-white dark:bg-slate-700 placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-slate-900 dark:text-slate-100 transition duration-150 ease-in-out"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div className="flex gap-2 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                    <button
                        onClick={() => setSortOrder('date_desc')}
                        className={`flex-1 flex items-center justify-center py-1.5 rounded-md text-xs font-medium transition-all ${
                            sortOrder === 'date_desc'
                                ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                        }`}
                        title="Más recientes primero"
                    >
                        <Clock size={14} className="mr-1" /> Recientes
                    </button>
                    <button
                        onClick={() => setSortOrder('alpha_asc')}
                        className={`flex-1 flex items-center justify-center py-1.5 rounded-md text-xs font-medium transition-all ${
                            sortOrder.includes('alpha')
                                ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                        }`}
                        title="Orden alfabético"
                    >
                        {sortOrder === 'alpha_desc' ? <ArrowUpAZ size={14} className="mr-1" /> : <ArrowDownAZ size={14} className="mr-1" />}
                        A-Z
                    </button>
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                        Filtrar por remitente
                    </label>
                    <select
                        value={senderFilter}
                        onChange={(e) => setSenderFilter(e.target.value)}
                        className="block w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">Todos los remitentes</option>
                        {senderFilterOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 🔥 NUEVO: Selector de filtros visuales */}
            <div className="flex gap-1 p-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
                {[
                    { key: "active",   label: "Activas" },
                    { key: "all",      label: "Todas" },
                    { key: "inactive", label: "Archivadas" },
                ].map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => onViewFilterChange(key)}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                            viewFilter === key
                                ? "bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm"
                                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/50"
                        }`}
                    >
                        {label}
                        {key === "inactive" && inactiveCount > 0 && (
                            <span className="ml-1 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 text-[10px] px-1.5 rounded-full">
                                {inactiveCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto">
                {isLoadingTemplates ? (
                    <div className="p-8 text-center text-slate-500">
                        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                        Cargando...
                    </div>
                ) : visibleTemplates.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm">
                        {searchTerm || senderFilter !== "all"
                            ? "No se encontraron campañas con ese criterio."
                            : "No hay plantillas. Crea una nueva."}
                    </div>
                ) : (
                    <ul>
                        {visibleTemplates.map((t) => (
                            <li key={t.id}>
                                <div
                                    onClick={() => onSelectTemplate(t.id)}
                                    role="button"
                                    tabIndex={0}
                                    className={`w-full text-left p-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer ${
                                        selectedTplId === t.id ? "bg-blue-50 dark:bg-slate-700 border-l-4 border-l-blue-600" : "border-l-4 border-l-transparent"
                                    }`}
                                >
                                    <div className="font-medium text-slate-900 dark:text-slate-100 truncate">
                                        {t.title || "Sin título"}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                                        {t.placeholder || "Sin descripción"}
                                    </div>
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-600 px-1.5 py-0.5 rounded">
                                                {t.builder?.campaignType || "Campaña"}
                                            </span>
                                            {t.createdAt && (
                                                <span className="text-[10px] text-slate-400 flex items-center">
                                                    <Calendar size={10} className="mr-1" />
                                                    {new Date(t.createdAt).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>

                                        {onToggleStatus && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onToggleStatus(t);
                                                }}
                                                className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                                                    t.active !== false
                                                        ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                                        : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 font-medium bg-emerald-50/50 dark:bg-emerald-900/10"
                                                }`}
                                                title={t.active !== false ? "Archivar campaña" : "Reactivar campaña"}
                                            >
                                                {t.active !== false ? "Archivar" : "⟳ Reactivar"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default CampaignsSidebar;
