import React from "react";

export default function InfoCard({ icon: Icon, label, value, compact = false }) {
    return (
        <div className="marko-card rounded-[10px] border border-[var(--border)] bg-[var(--bg2)] px-3 py-3">
            <div className="mb-2 flex items-center gap-2 text-[var(--text3)]">
                <Icon size={12} />
                <span className="font-mono text-[9px] uppercase tracking-[0.16em]">{label}</span>
            </div>
            <div className={`${compact ? "text-[11px] leading-5" : "text-[12px] leading-6"} text-[var(--text2)] break-words`}>{value}</div>
        </div>
    );
}
