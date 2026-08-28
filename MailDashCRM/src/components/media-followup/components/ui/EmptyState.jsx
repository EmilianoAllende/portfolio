import React from "react";

export default function EmptyState({ icon: Icon, title, description, spinning = false }) {
    return (
        <div className="flex h-full min-h-[320px] items-center justify-center p-6">
            <div className="max-w-md text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg2)] text-[var(--accent)]">
                    <Icon size={20} className={spinning ? "animate-spin" : ""} />
                </div>
                <div className="text-[14px] font-medium text-[var(--text)]">{title}</div>
                <p className="mt-2 text-[11px] leading-relaxed text-[var(--text3)]">{description}</p>
            </div>
        </div>
    );
}
