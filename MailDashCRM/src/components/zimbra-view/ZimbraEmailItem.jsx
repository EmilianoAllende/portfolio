import React from "react";
import { MailOpen, MailCheck } from "lucide-react";
import { ESTADO_BADGE_DISPLAY, normalizeLicitaValue } from "./zimbraUtils";
import { ESTADOS_CLIENTE } from "../../utils/organizationUtils";

const ZimbraEmailItem = ({ email, isSelected, onClick, onToggleRead }) => {
    const { from, fromEmail, subject, time, isRead, matchedOrg, estado_cliente } = email;

    const estadoKey = estado_cliente !== undefined ? estado_cliente :
                     (matchedOrg ? matchedOrg.estado_cliente : ESTADOS_CLIENTE.PENDIENTE);
    const badge = ESTADO_BADGE_DISPLAY[estadoKey] ?? ESTADO_BADGE_DISPLAY[ESTADOS_CLIENTE.PENDIENTE];

    const licita = matchedOrg && normalizeLicitaValue(matchedOrg.licita_medios) === "1";

    const handleKeyDown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick(e);
        }
    };

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={handleKeyDown}
            className={`w-full flex items-start gap-3 px-5 py-3.5 text-left transition-colors border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50/60 dark:hover:bg-gray-800/50 cursor-pointer ${
                isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""
            }`}
        >
            {/* Indicador de lectura */}
            <div className="flex-none mt-[7px]">
                {!isRead ? (
                    <span className="block h-2 w-2 rounded-full bg-blue-500" />
                ) : (
                    <span className="block h-2 w-2 rounded-full border border-gray-300 dark:border-gray-600" />
                )}
            </div>

            {/* Contenido */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex-1 min-w-0">
                        <span
                            className={`text-sm truncate ${
                                !isRead
                                    ? "font-bold text-gray-900 dark:text-gray-100"
                                    : "font-medium text-gray-600 dark:text-gray-400"
                            }`}
                        >
                            {from}
                        </span>
                        {/* Email resaltado en pequeño */}
                        {fromEmail && fromEmail !== from && (
                            <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5 truncate">
                                📧 {fromEmail}
                            </div>
                        )}
                    </div>
                    <span className="flex-none text-xs text-gray-400 dark:text-gray-500 font-medium tabular-nums">
                        {time}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <p
                        className={`text-xs truncate flex-1 min-w-0 ${
                            !isRead
                                ? "text-gray-700 dark:text-gray-300"
                                : "text-gray-400 dark:text-gray-500"
                        }`}
                    >
                        {subject}
                    </p>
                    {licita && (
                        <span className="flex-none text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                            Licita
                        </span>
                    )}
                    <span className={`flex-none text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${badge.style}`}>
                        {badge.label}
                    </span>
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleRead(email, !isRead); }}
                        title={isRead ? "Marcar como no leído" : "Marcar como leído"}
                        className="flex-none p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        {isRead
                            ? <MailOpen className="h-3.5 w-3.5" />
                            : <MailCheck className="h-3.5 w-3.5" />
                        }
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ZimbraEmailItem;
