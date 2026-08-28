import React from "react";

export default function StatCard({ icon: Icon, value, label, accent = false, compact = false }) {
    return (
        <div
            className={`marko-card rounded-[10px] border px-3 py-3 ${
                accent
                    ? "border-[var(--accent-border)] bg-[var(--accent-bg)]"
                    : "border-[var(--border)] bg-[var(--bg2)]"
            }`}
        >
            <div className="mb-2 flex items-center gap-2 text-[var(--text3)]">
                {Icon && <Icon size={13} />}
                <span className="font-mono text-[9px] uppercase tracking-[0.16em]">{label}</span>
            </div>
            <div className={`${compact ? "text-[11px] sm:text-[12px]" : "text-[12px] sm:text-[13px]"} font-medium text-[var(--text)] break-words`}>{value}</div>
        </div>
    );
}
