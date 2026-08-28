import React from "react";
import HeaderField from "./ui/HeaderField";
import PressEmailBody from "./PressEmailBody";

export default function PressModal({ selectedItem, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div className="marko-scrollbar relative max-h-[90vh] w-full max-w-[calc(100vw-2rem)] mx-4 overflow-y-auto rounded-[12px] border border-[var(--border)] bg-[var(--bg2)] p-4 sm:p-5 shadow-2xl">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 text-[var(--text3)] transition-colors duration-150 hover:text-[var(--text)]"
                    aria-label="Cerrar nota"
                >
                    ✕
                </button>
                <div className="pr-10">
                    <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--text3)]">nota origen</div>
                    <div className="mt-2 text-[16px] font-semibold leading-snug text-[var(--text)]">
                        {selectedItem.pressSubject || "Sin asunto de nota"}
                    </div>
                    <div className="mt-2 font-mono text-[10px] text-[var(--text3)]">
                        {selectedItem.fechaUltimaNotaFull || "sin fecha registrada"}
                    </div>
                </div>
                <div className="mt-4 rounded-[12px] border border-[var(--border)] bg-white p-4 shadow-[0_1px_0_rgba(15,23,42,0.02)] dark:bg-[var(--bg)]">
                    <div className="border-b border-[var(--border)] pb-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <HeaderField label="asunto" primary={selectedItem.pressSubject || "Sin asunto de nota"} />
                            <HeaderField label="fecha" primary={selectedItem.fechaUltimaNotaFull || "sin fecha registrada"} />
                        </div>
                    </div>
                    <div className="mt-4 space-y-3 text-[13px] leading-7 text-slate-700 dark:text-[var(--text2)]">
                        <PressEmailBody content={selectedItem.pressBody} />
                    </div>
                </div>
            </div>
        </div>
    );
}
