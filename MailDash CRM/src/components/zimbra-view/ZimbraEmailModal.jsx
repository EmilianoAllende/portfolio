import React, { useEffect } from "react";
import { X, Mail, Clock, MailOpen, MailCheck } from "lucide-react";
import { ESTADO_BADGE_DISPLAY, formatPlainTextEmail } from "./zimbraUtils";
import { ESTADOS_CLIENTE } from "../../utils/organizationUtils";
import { normalizeLicitaValue } from "./zimbraUtils";

const ZimbraEmailModal = ({ email, onClose, onToggleRead }) => {
    const { 
        from, 
        fromEmail, 
        subject, 
        body, 
        time, 
        date, 
        matchedOrg,
        estado_cliente,
        tipo_entidad,
        sub_tipo_entidad,
        isla,
        clase_entidad,
        motivo
    } = email;

    // Usar estado_cliente del email, fallback a matchedOrg
    const estadoKey = estado_cliente !== undefined ? estado_cliente : 
                     (matchedOrg ? matchedOrg.estado_cliente : ESTADOS_CLIENTE.PENDIENTE);
    const badge = ESTADO_BADGE_DISPLAY[estadoKey] ?? ESTADO_BADGE_DISPLAY[ESTADOS_CLIENTE.PENDIENTE];
    const licita = matchedOrg && normalizeLicitaValue(matchedOrg.licita_medios) === "1";

    useEffect(() => {
        const handler = (e) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="relative w-3/5 min-w-[520px] max-h-[85vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden">

                {/* Cabecera */}
                <div className="flex items-start gap-4 px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-snug">
                            {subject}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-2">
                            {/* Email remitente — RESALTADO */}
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-800 min-w-0">
                                <Mail className="h-3.5 w-3.5 flex-none text-blue-600 dark:text-blue-400" />
                                <span className="font-semibold text-blue-700 dark:text-blue-300 text-xs truncate">
                                    {fromEmail}
                                </span>
                            </div>
                            
                            {/* Nombre de la organización */}
                            {from && from !== fromEmail && (
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">
                                    {from}
                                </span>
                            )}
                            
                            {/* Fecha y hora */}
                            <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                                <Clock className="h-3 w-3 flex-none" />
                                <span>{date} · {time}</span>
                            </div>

                            {/* Badges de clasificación */}
                            <div className="flex flex-wrap gap-2">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${badge.style}`}>
                                    {badge.label}
                                </span>
                                {licita && (
                                    <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                                        Licita
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex-none p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        aria-label="Cerrar"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Cuerpo */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 bg-white dark:bg-gray-900">
                    {/* Contenido del email - Estilo como correo real */}
                    <div className="bg-white dark:bg-gray-800 border-l-4 border-gray-300 dark:border-gray-700 rounded-r p-4 font-sans">
                        {body ? (
                            body.includes('<') ? (
                                // Si contiene HTML, renderizar como HTML
                                <div
                                    className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed 
                                              [&_p]:mb-3 [&_p]:last:mb-0
                                              [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ul]:last:mb-0
                                              [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_ol]:last:mb-0
                                              [&_li]:mb-1
                                              [&_em]:italic [&_strong]:font-semibold 
                                              [&_h1]:text-base [&_h1]:font-bold [&_h1]:mb-2 [&_h1]:mt-3
                                              [&_h2]:text-sm [&_h2]:font-bold [&_h2]:mb-2 [&_h2]:mt-2
                                              [&_a]:text-blue-600 [&_a]:dark:text-blue-400 [&_a]:underline
                                              [&_pre]:bg-gray-100 [&_pre]:dark:bg-gray-900 [&_pre]:p-3 [&_pre]:rounded [&_pre]:overflow-x-auto [&_pre]:mb-3
                                              [&_code]:font-mono [&_code]:text-xs
                                              [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:dark:border-gray-600 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:mb-3
                                              [&_br]:block [&_br]:h-0"
                                    dangerouslySetInnerHTML={{ __html: body }}
                                />
                            ) : (
                                // Si es texto plano, mostrar con saltos de línea preservados y formateado
                                <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-sans whitespace-pre-wrap break-words">
                                    {formatPlainTextEmail(body)}
                                </div>
                            )
                        ) : (
                            <p className="text-sm text-gray-400 italic">Sin contenido disponible.</p>
                        )}
                    </div>

                    {/* Sección de clasificación */}
                    {(estado_cliente !== undefined || tipo_entidad || motivo) && (
                        <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-3">
                                📊 Clasificación Automática
                            </h4>
                            
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                {/* Estado cliente */}
                                {estado_cliente !== undefined && (
                                    <div className="col-span-2">
                                        <div className="font-semibold text-gray-600 dark:text-gray-400 mb-1">Estado Cliente:</div>
                                        <div className={`px-3 py-1.5 rounded-md w-fit font-semibold ${badge.style}`}>
                                            {badge.label}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Tipo de entidad */}
                                {tipo_entidad && (
                                    <div>
                                        <div className="font-semibold text-gray-600 dark:text-gray-400 mb-1">Tipo Entidad:</div>
                                        <div className="px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                                            {tipo_entidad}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Subtipo de entidad */}
                                {sub_tipo_entidad && (
                                    <div>
                                        <div className="font-semibold text-gray-600 dark:text-gray-400 mb-1">Subtipo:</div>
                                        <div className="px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 truncate">
                                            {sub_tipo_entidad}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Isla */}
                                {isla && (
                                    <div>
                                        <div className="font-semibold text-gray-600 dark:text-gray-400 mb-1">Isla:</div>
                                        <div className="px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                                            {isla}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Clase de entidad */}
                                {clase_entidad && (
                                    <div>
                                        <div className="font-semibold text-gray-600 dark:text-gray-400 mb-1">Clase:</div>
                                        <div className="px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                                            {clase_entidad}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Motivo de clasificación */}
                            {motivo && (
                                <div className="col-span-2 mt-3 pt-3 border-t border-purple-200 dark:border-purple-800">
                                    <div className="font-semibold text-gray-600 dark:text-gray-400 mb-1.5">💡 Motivo:</div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed italic">
                                        {motivo}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Pie */}
                <div className="px-6 py-2.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                        Vista de solo lectura — Bandeja espejo Zimbra
                    </span>
                    {email.isRead ? (
                        <button
                            onClick={() => onToggleRead(email, false)}
                            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                        >
                            <MailOpen className="h-3.5 w-3.5" />
                            Marcar como no leído
                        </button>
                    ) : (
                        <button
                            onClick={() => onToggleRead(email, true)}
                            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                        >
                            <MailCheck className="h-3.5 w-3.5" />
                            Marcar como leído
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ZimbraEmailModal;
