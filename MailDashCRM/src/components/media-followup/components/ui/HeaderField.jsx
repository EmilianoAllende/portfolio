import React from "react";

export default function HeaderField({ label, primary, secondary }) {
    return (
        <div className="rounded-[8px] border border-[var(--border)] bg-[var(--bg2)] px-3 py-3">
            <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--text3)]">{label}</div>
            <div className="mt-1 text-[11px] sm:text-[12px] font-medium text-[var(--text)] break-words">{primary}</div>
            {secondary ? <div className="mt-1 text-[9px] sm:text-[10px] text-[var(--text3)] break-words">{secondary}</div> : null}
        </div>
    );
}
