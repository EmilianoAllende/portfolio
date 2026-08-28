import React from "react";
import {
    AlertCircle,
    Building2,
    CalendarDays,
    Clock3,
    ExternalLink,
    FileText,
    Globe,
    Mail,
    Pencil,
    Phone,
    Send,
    ShieldAlert,
} from "lucide-react";
import { statusBadgeClassName } from "../utils/statusUtils";
import { getEstadoLabel } from "../../../utils/organizationUtils";
import StatCard from "./ui/StatCard";
import InfoCard from "./ui/InfoCard";
import WorkflowSummaryCard from "./ui/WorkflowSummaryCard";

const sectionLabelClassName = "mb-2 font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--text3)]";

export default function SelectedItemDetail({
    selectedItem,
    selectedSender,
    selectedStatusSummary,
    scheduledSendLabel,
    scheduleTimestampLabel,
    setOpenPressModal,
    organizaciones,
    setOpenEditorModal,
}) {
    const handleEditOrg = () => {
        const orgFromId = organizaciones.find((o) => o.id === selectedItem.id) ?? null;
        const orgFromEmail = !orgFromId && selectedItem.emailCliente
            ? organizaciones.find((o) => o.email === selectedItem.emailCliente)
            : null;
        const orgToEdit = orgFromId || orgFromEmail || selectedItem.cliente || null;
        if (orgToEdit) setOpenEditorModal(orgToEdit);
        else console.warn("No hay datos de cliente disponibles.");
    };

    return (
        <>
            <div className="rounded-[12px] border border-[var(--border)] bg-[linear-gradient(180deg,var(--bg2),var(--bg))] p-4 shadow-[0_1px_0_rgba(15,23,42,0.02)]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                        <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--text3)]">caso seleccionado</div>
                        <h2 className="mt-2 text-[18px] sm:text-[22px] font-semibold tracking-[-0.03em] text-[var(--text)] break-words">
                            {selectedItem.organizacion}
                        </h2>
                        <p className="mt-2 text-[11px] sm:text-[12px] leading-relaxed text-[var(--text3)] break-words">
                            {selectedStatusSummary?.headline}
                        </p>
                    </div>
                    <span className={statusBadgeClassName(selectedItem.envio, selectedItem.revision)}>
                        {selectedItem.envioLabel}
                        {selectedItem.revision === "confirmado" && (
                            <span className="ml-2 rounded bg-blue-100 px-2 py-[2px] text-[10px] font-mono uppercase text-blue-700">confirmado</span>
                        )}
                    </span>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <WorkflowSummaryCard label="próximo paso" value={selectedStatusSummary?.nextStep} icon={Send} accent />
                    <WorkflowSummaryCard label="se enviará" value={scheduledSendLabel || "sin fecha estimada"} icon={Clock3} />
                    <WorkflowSummaryCard label="registro" value={scheduleTimestampLabel || "sin registro"} icon={CalendarDays} />
                    <WorkflowSummaryCard label="sender" value={selectedSender.displayName} icon={Mail} />
                </div>
            </div>

            <div className="mt-5 space-y-4">
                <article className="rounded-[12px] border border-[var(--border)] bg-[var(--bg2)] p-4">
                    <div className={sectionLabelClassName}>origen de prensa</div>
                    <div className="rounded-[10px] border border-[var(--border)] bg-[var(--bg)] p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <div className="text-[13px] sm:text-[14px] font-medium leading-snug text-[var(--text)] break-words">
                                    {selectedItem.pressSubject || "Sin asunto de nota"}
                                </div>
                                <div className="mt-1 font-mono text-[10px] text-[var(--text3)]">
                                    {selectedItem.fechaUltimaNotaFull || "sin fecha registrada"}
                                </div>
                            </div>
                            <div className="rounded-full border border-[var(--border)] bg-[var(--bg2)] p-2 text-[var(--accent)]">
                                <FileText size={14} />
                            </div>
                        </div>
                        <p className="mt-3 text-[11px] sm:text-[12px] leading-6 text-[var(--text2)] break-words">
                            {selectedItem.pressSnippet || "No hay cuerpo de nota disponible."}
                        </p>
                        <button
                            type="button"
                            onClick={() => setOpenPressModal(true)}
                            className="mt-4 inline-flex items-center gap-2 text-[11px] font-medium text-[var(--accent)] transition-colors duration-150 hover:text-[var(--text)]"
                        >
                            ver nota completa <ExternalLink size={12} />
                        </button>
                    </div>
                </article>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <article className="rounded-[12px] border border-[var(--border)] bg-[var(--bg2)] p-4">
                        <div className="flex items-center justify-between">
                            <div className={sectionLabelClassName}>datos del cliente</div>
                            <button
                                type="button"
                                className="ml-2 rounded p-1 text-[var(--accent)] hover:bg-[var(--bg3)]"
                                title="Editar organización en gestión"
                                onClick={handleEditOrg}
                            >
                                <Pencil size={16} />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            <InfoCard icon={Mail} label="email" value={selectedItem.emailCliente || "sin email"} compact />
                            <InfoCard icon={Phone} label="teléfono" value={selectedItem.telefono || "sin teléfono"} compact />
                            {selectedItem.direccion && <InfoCard icon={Building2} label="dirección" value={selectedItem.direccion} compact />}
                            {selectedItem.nif && <InfoCard icon={ShieldAlert} label="nif" value={selectedItem.nif} compact />}
                            <InfoCard icon={AlertCircle} label="estado cliente" value={getEstadoLabel(selectedItem.estado_cliente)} compact />
                        </div>
                    </article>

                    <article className="rounded-[12px] border border-[var(--border)] bg-[var(--bg2)] p-4">
                        <div className={sectionLabelClassName}>contexto</div>
                        <div className="grid grid-cols-1 gap-3">
                            <StatCard icon={Globe} value={selectedItem.domain || "s/d"} label="dominio" compact />
                            <StatCard icon={Building2} value={selectedItem.tipoEntidad || "s/d"} label="tipo entidad" compact />
                            {selectedItem.claseEntidad && <StatCard icon={FileText} value={selectedItem.claseEntidad} label="clase entidad" compact accent />}
                            <StatCard icon={CalendarDays} value={selectedItem.fechaUltimaNotaLabel} label="última nota" compact />
                        </div>
                    </article>
                </div>
            </div>
        </>
    );
}
