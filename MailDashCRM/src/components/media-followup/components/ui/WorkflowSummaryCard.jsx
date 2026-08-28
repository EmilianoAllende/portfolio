import React from "react";

export default function WorkflowSummaryCard({ icon: Icon, label, value, accent = false }) {
    return (
        <div className={`rounded-[10px] border px-3 py-3 ${accent ? "border-[var(--accent-border)] bg-[var(--accent-bg)]" : "border-[var(--border)] bg-[var(--bg)]"}`}>
            <div className="mb-2 flex items-center gap-2 text-[var(--text3)]">
                {Icon ? <Icon size={12} /> : null}
                <span className="font-mono text-[9px] uppercase tracking-[0.16em]">{label}</span>
            </div>
            <div className="text-[11px] sm:text-[12px] font-medium leading-5 text-[var(--text)] break-words">{value}</div>
        </div>
    );
}
