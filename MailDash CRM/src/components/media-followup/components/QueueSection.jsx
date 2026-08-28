import React from "react";
import { statusBadgeClassName, getStatusSummary } from "../utils/statusUtils";
import { formatDateTime, getScheduledFollowupDate } from "../utils/dateUtils";

const sectionLabelClassName = "mb-2 font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--text3)]";

export default function QueueSection({ title, items, selectedId, onSelect, devTimezone }) {
    return (
        <div className="mb-5">
            <div className={sectionLabelClassName}>{title}</div>
            <div className="space-y-1">
                {items.length === 0 && (
                    <div className="rounded-md border border-dashed border-[var(--border)] px-3 py-3 text-[10px] text-[var(--text3)]">
                        Sin elementos en esta sección.
                    </div>
                )}
                {items.map((item) => {
                    const isActive = item.id === selectedId;
                    const scheduledLabel = devTimezone && item.scheduleTimestamp
                        ? formatDateTime(getScheduledFollowupDate(item.scheduleTimestamp), { timezone: devTimezone })
                        : item.scheduledSendLabel;
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => onSelect(item.id)}
                            className={`marko-card w-full rounded-[10px] border px-3 py-3 text-left transition-all duration-150 ${
                                isActive
                                    ? "border-[var(--accent-border)] bg-[var(--accent-bg)] shadow-[inset_0_0_0_1px_rgba(37,99,235,0.06)]"
                                    : "border-transparent bg-transparent hover:bg-[var(--bg3)]"
                            }`}
                        >
                            <div className="mb-2 flex items-start justify-between gap-3">
                                <span className="flex items-center gap-1.5 text-[12px] font-medium leading-snug text-[var(--text)]">
                                    {item.notaDesactualizada && (
                                        <span title="Nota de prensa más reciente que el correo guardado" className="mt-[1px] h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                                    )}
                                    {item.organizacion}
                                </span>
                                <span className={statusBadgeClassName(item.envio, item.revision)}>
                                    {item.envioLabel}
                                    {item.revision === "confirmado" && (
                                        <span className="ml-2 rounded bg-blue-100 px-2 py-[2px] text-[10px] font-mono uppercase text-blue-700">confirmado</span>
                                    )}
                                </span>
                            </div>
                            <div className="font-mono text-[10px] text-[var(--text3)]">{item.emailCliente || item.id}</div>
                            <div className="mt-2 line-clamp-2 text-[11px] leading-5 text-[var(--text2)]">{item.subject || "Sin asunto"}</div>
                            <div className="mt-3 flex items-center justify-between gap-2 text-[10px]">
                                <span className="rounded-full bg-[var(--bg2)] px-2 py-[4px] text-[var(--text2)]">
                                    {getStatusSummary(item).nextStep}
                                </span>
                                <span className="text-[var(--text3)]">
                                    {scheduledLabel || item.scheduleTimestampLabel || "sin fecha"}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
