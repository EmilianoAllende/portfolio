import React from "react";
import { AlertTriangle, ExternalLink, Loader2, RefreshCw, Send, Trash2 } from "lucide-react";
import { statusBadgeClassName } from "../utils/statusUtils";
import HeaderField from "./ui/HeaderField";
import ActionButton from "./ui/ActionButton";

export default function EmailPreviewPanel({
    selectedItem,
    selectedSender,
    selectedStatusSummary,
    scheduledSendLabel,
    scheduleTimestampLabel,
    canEdit,
    canSend,
    canDiscard,
    canDelete,
    canCopy,
    isUpdatingEnvio,
    isRegenerating,
    regenerateError,
    onRegenerateEmail,
    onChangeEnvio,
    onDeleteEmail,
    onUnconfirmEnvio,
    onOpenEmailEditModal,
    onOpenPressModal,
    setNotification,
}) {
    return (
        <div className="rounded-[12px] border border-[var(--border)] bg-[linear-gradient(180deg,var(--bg2),var(--bg))] p-4">
            <div className="mb-4 rounded-[10px] border border-[var(--border)] bg-[var(--bg)] px-3 py-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                        <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--text3)]">estado del flujo</div>
                        <div className="mt-1 text-[15px] font-semibold text-[var(--text)]">{selectedStatusSummary?.headline}</div>
                        <div className="mt-1 text-[11px] sm:text-[12px] leading-5 text-[var(--text3)] break-words">{selectedStatusSummary?.hint}</div>
                    </div>
                    <span className={statusBadgeClassName(selectedItem.envio, selectedItem.revision)}>
                        {selectedItem.envioLabel}
                        {selectedItem.revision === "confirmado" && (
                            <span className="ml-2 rounded bg-blue-100 px-2 py-[2px] text-[10px] font-mono uppercase text-blue-700">confirmado</span>
                        )}
                    </span>
                </div>
            </div>

            <div className="mb-4 rounded-[10px] border border-[var(--border)] bg-[var(--bg)] px-3 py-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2">
                    <HeaderField label="de" primary={selectedSender.displayName} secondary={selectedSender.email} />
                    <HeaderField label="para" primary={selectedItem.organizacion} secondary={selectedItem.emailCliente || "sin email"} />
                    <HeaderField label="se enviará" primary={scheduledSendLabel || "sin fecha estimada"} secondary="corrida hábil de las 7am" />
                    <HeaderField label="registro" primary={scheduleTimestampLabel || "sin registro"} secondary={`id cliente: ${selectedItem.id}`} />
                </div>
            </div>

            {selectedItem.notaDesactualizada && (
                <div className="mb-4 rounded-[10px] border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 px-4 py-3">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-[1px] h-4 w-4 shrink-0 text-amber-500" />
                        <div className="flex-1 min-w-0">
                            <div className="text-[12px] font-semibold text-amber-800 dark:text-amber-300">
                                Nota de prensa más reciente que el correo guardado
                            </div>
                            <div className="mt-1 text-[11px] leading-5 text-amber-700 dark:text-amber-400">
                                Se recibió una nota de prensa nueva desde que se generó este correo. Puedes regenerarlo para que refleje la información actualizada.
                                {selectedItem.fechaUltimaNotaFull && (
                                    <span className="ml-1 font-mono">Nota: {selectedItem.fechaUltimaNotaFull}.</span>
                                )}
                            </div>
                            {regenerateError && (
                                <div className="mt-2 flex items-center gap-2 rounded-[6px] border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800 px-3 py-2 text-[11px] text-red-700 dark:text-red-400">
                                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                    <span className="flex-1">{regenerateError}</span>
                                </div>
                            )}
                            <div className="mt-3">
                                <button
                                    type="button"
                                    onClick={onRegenerateEmail}
                                    disabled={isRegenerating || isUpdatingEnvio}
                                    className="inline-flex items-center gap-2 rounded-[7px] border border-amber-400 bg-amber-100 px-3 py-1.5 text-[11px] font-medium text-amber-800 transition-colors hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-300 dark:hover:bg-amber-900/60"
                                >
                                    {isRegenerating
                                        ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Generando correo...</>
                                        : regenerateError
                                            ? <><RefreshCw className="h-3.5 w-3.5" />Reintentar</>
                                            : <><RefreshCw className="h-3.5 w-3.5" />Regenerar correo</>
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="rounded-[10px] border border-[var(--border)] bg-[var(--bg)] p-4 shadow-[0_1px_0_rgba(15,23,42,0.02)]">
                <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--text3)]">preview del correo</div>
                <div className="mt-3 rounded-[8px] border border-[var(--border)] bg-[var(--bg2)] px-3 py-3 text-[12px] sm:text-[13px] font-medium leading-6 text-[var(--text)] break-words">
                    {selectedItem.subject || "Sin asunto"}
                </div>
                <div className="marko-card mt-3 min-h-[320px] sm:min-h-[420px] whitespace-pre-line rounded-[8px] border border-[var(--border)] bg-[var(--bg)] px-4 py-4 text-[11px] sm:text-[12px] leading-7 text-[var(--text2)] shadow-[0_1px_0_rgba(15,23,42,0.02)] break-words overflow-wrap-anywhere">
                    {selectedItem.body || "No hay cuerpo disponible."}
                </div>
            </div>

            <div className="mt-4 grid gap-3 rounded-[10px] border border-[var(--border)] bg-[var(--bg)] p-3">
                <div>
                    <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--text3)]">acciones principales</div>
                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-2">
                        {canEdit && (
                            <ActionButton label="editar correo" onClick={onOpenEmailEditModal} tone="default" disabled={isUpdatingEnvio} />
                        )}
                        {canSend && selectedItem.revision !== "confirmado" && (
                            <ActionButton
                                label={isUpdatingEnvio ? "actualizando..." : selectedItem.envio === "descartado" ? "reactivar envío" : "confirmar envío"}
                                onClick={() => void onChangeEnvio("enviado")}
                                tone="green"
                                disabled={isUpdatingEnvio}
                                icon={Send}
                            />
                        )}
                        {selectedItem.revision === "confirmado" && (
                            <ActionButton
                                label={isUpdatingEnvio ? "desconfirmando..." : "desconfirmar envío"}
                                onClick={onUnconfirmEnvio}
                                tone="accent"
                                disabled={isUpdatingEnvio}
                            />
                        )}
                        <ActionButton label="ver nota origen" onClick={onOpenPressModal} tone="default" icon={ExternalLink} />
                        {canCopy && (
                            <ActionButton
                                label="copiar correo"
                                onClick={() => {
                                    navigator.clipboard
                                        ?.writeText(`${selectedItem.subject}\n\n${selectedItem.body || ""}`)
                                        .then(() => setNotification?.({ type: "success", title: "Correo copiado", message: "Se copió el asunto y el cuerpo al portapapeles." }))
                                        .catch(() => setNotification?.({ type: "warning", title: "Copiado no disponible", message: "No se pudo copiar el correo al portapapeles." }));
                                }}
                                tone="default"
                            />
                        )}
                    </div>
                </div>

                {(canDiscard || canDelete) && (
                    <div className="border-t border-[var(--border)] pt-3">
                        <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--text3)]">acciones de estado</div>
                        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-2">
                            {canDiscard && (
                                <ActionButton
                                    label={isUpdatingEnvio ? "actualizando..." : "descartar correo"}
                                    onClick={() => void onChangeEnvio("descartado")}
                                    tone="red"
                                    disabled={isUpdatingEnvio}
                                />
                            )}
                            {canDelete && (
                                <ActionButton
                                    label={isUpdatingEnvio ? "eliminando..." : "eliminar de la bandeja"}
                                    onClick={() => void onDeleteEmail()}
                                    tone="red"
                                    disabled={isUpdatingEnvio}
                                    icon={Trash2}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
