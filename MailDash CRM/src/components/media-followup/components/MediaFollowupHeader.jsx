import React from "react";
import { Clock3, RefreshCw, Search } from "lucide-react";
import { filterTabClassName } from "../utils/statusUtils";

const IS_LOCALHOST = typeof window !== "undefined" && window.location.hostname === "localhost";

const DEV_TIMEZONES = [
    { tz: null, label: "auto" },
    { tz: "Atlantic/Canary", label: "Canarias" },
    { tz: "Europe/Madrid", label: "España" },
    { tz: "America/Argentina/Buenos_Aires", label: "Argentina" },
    { tz: "America/Montevideo", label: "Uruguay" },
    { tz: "America/Santiago", label: "Chile" },
    { tz: "America/Mexico_City", label: "México" },
];

const chipClassName =
    "rounded-sm border border-[var(--border2)] bg-[var(--bg2)] px-2 py-[3px] text-[10px] font-medium tracking-[0.08em] text-[var(--text2)] transition-colors duration-150";

export default function MediaFollowupHeader({
    filterButtons,
    activeFilter,
    onFilterChange,
    searchQuery,
    setSearchQuery,
    devTimezone,
    setDevTimezone,
    onRefresh,
}) {
    return (
        <header className="shrink-0 border-b border-[var(--border)] bg-[linear-gradient(180deg,var(--bg),var(--bg2))] px-5 py-4">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="min-w-0">
                        <div className="font-mono text-[14px] tracking-[0.18em] text-[var(--text)]">seguimiento de medios</div>
                        <h1 className="mt-2 text-[18px] sm:text-[20px] font-semibold tracking-[-0.02em] text-[var(--text)] break-words">
                            Bandeja editorial y seguimiento de correos
                        </h1>
                        <p className="mt-1 text-[11px] sm:text-[12px] leading-relaxed text-[var(--text3)] break-words">
                            Revisa primero lo pendiente, valida el contexto de prensa y deja cada correo listo para enviarse en la siguiente corrida hábil.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {IS_LOCALHOST && (
                            <button
                                type="button"
                                onClick={() => {
                                    const tzValues = DEV_TIMEZONES.map((t) => t.tz);
                                    const currentIndex = tzValues.indexOf(devTimezone);
                                    setDevTimezone(tzValues[(currentIndex + 1) % tzValues.length]);
                                }}
                                className={`${chipClassName} hover:bg-[var(--bg3)] hover:text-[var(--text)] border-dashed`}
                                title="Dev: cambiar zona horaria de visualización"
                            >
                                <span className="inline-flex items-center gap-1">
                                    <Clock3 size={12} />
                                    tz: {DEV_TIMEZONES.find((t) => t.tz === devTimezone)?.label ?? "auto"}
                                </span>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onRefresh}
                            className={`${chipClassName} hover:bg-[var(--bg3)] hover:text-[var(--text)]`}
                        >
                            <span className="inline-flex items-center gap-1">
                                <RefreshCw size={12} />
                                refrescar
                            </span>
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap gap-2 order-2 lg:order-1 w-full">
                        {filterButtons.map((button) => (
                            <button
                                key={button.key}
                                type="button"
                                onClick={() => void onFilterChange(button.key)}
                                className={filterTabClassName(button.tone, activeFilter === button.key)}
                            >
                                <span>{button.label}</span>
                                <span className="rounded-full bg-black/5 px-2 py-[1px] text-[10px] dark:bg-white/10">
                                    {button.count}
                                </span>
                            </button>
                        ))}
                    </div>
                    <label className="flex w-full max-w-[320px] order-1 lg:order-2 lg:max-w-[320px] items-center gap-2 rounded-[10px] border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--text2)] shrink-0">
                        <Search size={14} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar por organización, email o asunto"
                            className="w-full bg-transparent text-[12px] outline-none placeholder:text-[var(--text3)]"
                        />
                    </label>
                </div>
            </div>
        </header>
    );
}
