import React from "react";

export default function ActionButton({ label, onClick, tone = "default", disabled = false, icon: Icon }) {
    const tones = {
        default: "border-[var(--border)] bg-[var(--bg)] text-[var(--text2)] hover:bg-[var(--bg3)] hover:text-[var(--text)]",
        accent: "border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--accent)] hover:bg-[var(--bg3)]",
        green: "border-[color:var(--green-bg)] bg-[var(--green-bg)] text-[var(--green)] hover:brightness-95",
        red: "border-[color:var(--red-bg)] bg-[var(--red-bg)] text-[var(--red)] hover:brightness-95",
    };

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`rounded-[8px] border px-3 py-[10px] text-[11px] font-medium transition-colors duration-150 ${tones[tone] || tones.default} ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
        >
            <span className="inline-flex items-center gap-2">
                {Icon ? <Icon size={13} /> : null}
                {label}
            </span>
        </button>
    );
}
