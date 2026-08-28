import React, { useEffect, useMemo, useState } from "react";
import { 
    Mail, 
    BarChart3, 
    Trophy,
    RefreshCw,
} from "lucide-react";

const UserAnalytics = ({ organizaciones = [], onRefreshMetrics, isRefreshingMetrics }) => {
    const [expandedActions, setExpandedActions] = useState({});
    const ACTION_PREVIEW_MAX = 34;

    const formatLastActivityDate = (date) => {
        if (!date) return "Sin actividad";
        const day = new Intl.DateTimeFormat("es-ES", { day: "2-digit" }).format(date);
        const month = new Intl.DateTimeFormat("es-ES", { month: "long" }).format(date);
        const year = new Intl.DateTimeFormat("es-ES", { year: "numeric" }).format(date);
        return `${day}, ${month} ${year}`;
    };

    // --- 1. PROCESAMIENTO DE DATOS ---
    const metrics = useMemo(() => {
        console.groupCollapsed("📊 [Métricas Usuario] Inicio de cálculo");
        console.log("Total organizaciones recibidas:", organizaciones.length);
        console.log("Campos buscados para autor de contacto:", ["created_by", "usuario_creacion"]);
        console.log("Campos buscados en campaigns_log para ejecutor:", ["sent_by", "created_by", "user", "usuario"]);
        console.log("Campos buscados para fecha de envío:", ["last_sent"]);
        console.log("Campos buscados para nombre de campaña:", ["template_title"]);

        const userStats = {};

        const parseCampaignsLog = (rawLog) => {
            if (!rawLog) return {};
            if (typeof rawLog === "object") return rawLog;
            if (typeof rawLog === "string") {
                try {
                    const parsed = JSON.parse(rawLog);
                    return parsed && typeof parsed === "object" ? parsed : {};
                } catch {
                    return {};
                }
            }
            return {};
        };

        const normalizeDate = (value) => {
            if (!value) {
                console.log("🗓️ [Métricas Usuario] Fecha vacía", { input: value });
                return null;
            }
            if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

            if (typeof value === "string") {
                const rawInput = value.trim();
                const utcSuffixMatch = rawInput.match(/\s*\(UTC([+-]\d{1,2})(?::?(\d{2}))?\)\s*$/i);
                const sanitizedInput = rawInput.replace(/\s*\(UTC[+-]\d{1,2}(?::?\d{2})?\)\s*$/i, "");

                const match = value
                    .trim()
                    .match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
                const sanitizedMatch = sanitizedInput
                    .match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);

                const effectiveMatch = sanitizedMatch || match;
                if (effectiveMatch) {
                    const [, partA, partB, rawYear, rawHour = "0", rawMinute = "0", rawSecond = "0"] = effectiveMatch;

                    const a = Number(partA);
                    const b = Number(partB);
                    const yearNumber = Number(rawYear);
                    const year = rawYear.length === 2
                        ? (yearNumber >= 70 ? 1900 + yearNumber : 2000 + yearNumber)
                        : yearNumber;

                    // Normalización robusta para fechas con '/'.
                    let month;
                    let day;

                    if (a > 12 && b <= 12) {
                        day = a;
                        month = b;
                    } else if (b > 12 && a <= 12) {
                        month = a;
                        day = b;
                    } else {
                        // Caso ambiguo (ej. 05/03/2026): priorizamos dd/mm
                        // para este flujo de métricas.
                        day = a;
                        month = b;
                    }

                    const hour = Number(rawHour);
                    const minute = Number(rawMinute);
                    const second = Number(rawSecond);

                    const baseUtcMillis = Date.UTC(year, month - 1, day, hour, minute, second);
                    let parsed = new Date(baseUtcMillis);

                    // Si viene sufijo UTC±X, convertimos la hora declarada en ese huso a UTC real.
                    if (utcSuffixMatch) {
                        const offsetHours = Number(utcSuffixMatch[1] || 0);
                        const offsetMinutes = Number(utcSuffixMatch[2] || 0);
                        const totalOffsetMinutes = (offsetHours * 60) + (offsetHours >= 0 ? offsetMinutes : -offsetMinutes);
                        parsed = new Date(baseUtcMillis - (totalOffsetMinutes * 60 * 1000));
                    }

                    if (!Number.isNaN(parsed.getTime())) {
                        console.log("🗓️ [Métricas Usuario] Fecha parseada", {
                            input: value,
                            sanitizedInput,
                            interpreted: {
                                day,
                                month,
                                year,
                                hour,
                                minute,
                                second,
                            },
                            isoUTC: parsed.toISOString(),
                            formattedES: formatLastActivityDate(parsed),
                        });
                        return parsed;
                    }
                }
            }

            const direct = new Date(value);
            if (!Number.isNaN(direct.getTime())) {
                console.log("🗓️ [Métricas Usuario] Fecha parseada (Date directo)", {
                    input: value,
                    isoUTC: direct.toISOString(),
                    formattedES: formatLastActivityDate(direct),
                });
                return direct;
            }

            console.warn("⚠️ [Métricas Usuario] No se pudo parsear fecha", { input: value });

            return null;
        };

        // Helper para inicializar usuario
        const initUser = (username) => {
            if (!username) return;
            if (!userStats[username]) {
                userStats[username] = {
                    name: username,
                    contactsCreated: 0,
                    emailsSent: 0,
                    campaignsExecuted: 0,
                    lastActivity: null,
                    lastActivityRaw: null,
                    lastActivityParsedIso: null,
                    campaignTypes: {} // Para ver qué tipo de campañas lanza más
                };
            }
        };

        organizaciones.forEach(org => {
            // A. Contactos Generados/Cargados
            // Asumimos que la org tiene un campo 'created_by' o 'usuario_creacion'
            const creator = org.created_by || org.usuario_creacion || null;
            if (creator) {
                initUser(creator);
                userStats[creator].contactsCreated++;
            }

            // B. Emails Enviados y Performance de Campaña
            const campaignsLog = parseCampaignsLog(org.campaigns_log);
            if (campaignsLog && typeof campaignsLog === "object") {
                Object.entries(campaignsLog).forEach(([campaignKey, log]) => {
                    const executor = log.user || log.usuario || log.created_by || log.sent_by || null;
                    
                    if (executor) {
                        initUser(executor);
                        
                        userStats[executor].emailsSent++;
                        userStats[executor].campaignsExecuted++;
                        
                        // Rastreo de última actividad
                        const rawEventDate = log.updated_at || log.last_sent || log.created_at;
                        console.log("🧪 [Métricas Usuario] Fecha cruda de evento", {
                            campaignKey,
                            executor,
                            rawEventDate,
                        });
                        const eventDate = normalizeDate(rawEventDate);
                        const campaignLabel = log.template_title || log.subject || campaignKey || "Campaña";

                        if (eventDate && (!userStats[executor].lastActivity || eventDate > userStats[executor].lastActivity)) {
                            userStats[executor].lastActivity = eventDate;
                            userStats[executor].lastActivityRaw = rawEventDate || null;
                            userStats[executor].lastActivityParsedIso = eventDate.toISOString();
                            userStats[executor].lastAction = `Envió: ${campaignLabel}`;
                        }

                        // Tipos de campaña (Performance por tipo)
                        const type = log.template_title || "Genérica";
                        userStats[executor].campaignTypes[type] = (userStats[executor].campaignTypes[type] || 0) + 1;
                    }
                });
            }
        });

        // Convertir a array y ordenar por actividad (emails enviados)
        const result = Object.values(userStats).sort((a, b) => b.emailsSent - a.emailsSent);
        const expectedRows = result.map((user) => {
            const topCampaign = Object.entries(user.campaignTypes || {})
                .sort(([, a], [, b]) => b - a)[0]?.[0] || "-";

            return {
                usuario: user.name,
                emailsEnviados: user.emailsSent,
                contactosCreados: user.contactsCreated,
                campanaMasUsada: topCampaign,
                ultimaAccion: user.lastAction || "-",
                ultimaActividad: formatLastActivityDate(user.lastActivity),
                fechaCruda: user.lastActivityRaw || "-",
                fechaParseada: user.lastActivityParsedIso || "-",
            };
        });

        console.log("🧾 [Métricas Usuario] Lo que se debe mostrar en tabla:", expectedRows);
        console.log("Usuarios detectados en métricas:", result.map((u) => u.name));
        console.log("Total usuarios en reporte:", result.length);
        console.groupEnd();
        return result;
    }, [organizaciones]);

    const displayedTableRows = useMemo(() => {
        return metrics.map((user) => {
            const topCampaign = Object.entries(user.campaignTypes || {})
                .sort(([, a], [, b]) => b - a)[0]?.[0] || "-";

            return {
                usuario: user.name,
                emailsEnviados: user.emailsSent,
                contactosCreados: user.contactsCreated,
                campanaMasUsada: topCampaign,
                ultimaAccion: user.lastAction || "-",
                ultimaActividad: formatLastActivityDate(user.lastActivity),
                fechaCruda: user.lastActivityRaw || "-",
                fechaParseada: user.lastActivityParsedIso || "-",
            };
        });
    }, [metrics]);

    useEffect(() => {
        console.log("👀 [Métricas Usuario] Lo que se está mostrando en tabla:", displayedTableRows);

        console.groupCollapsed("👥 [Métricas Usuario] Log por usuario");
        displayedTableRows.forEach((row) => {
            console.groupCollapsed(`👤 ${row.usuario}`);
            console.log("Emails enviados:", row.emailsEnviados);
            console.log("Contactos creados:", row.contactosCreados);
            console.log("Campaña más usada:", row.campanaMasUsada);
            console.log("Última acción:", row.ultimaAccion);
            console.log("Última actividad:", row.ultimaActividad);
            console.log("Fecha cruda:", row.fechaCruda);
            console.log("Fecha parseada:", row.fechaParseada);
            console.groupEnd();
        });
        console.groupEnd();
    }, [displayedTableRows]);

    const getActionPreview = (text) => {
        if (!text) return "-";
        if (text.length <= ACTION_PREVIEW_MAX) return text;
        return text.slice(0, ACTION_PREVIEW_MAX).trimEnd();
    };

    // --- 2. VISTA ---
    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                    <BarChart3 size={24} />
                </div>
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        Métricas por Usuario
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Seguimiento de productividad y ejecución de campañas.
                    </p>
                </div>
                <button
                    onClick={() => onRefreshMetrics?.()}
                    disabled={isRefreshingMetrics}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    title="Recargar métricas de usuario"
                >
                    <RefreshCw size={14} className={isRefreshingMetrics ? "animate-spin" : ""} />
                    {isRefreshingMetrics ? "Recargando..." : "Recargar"}
                </button>
            </div>

            {/* TARJETAS RESUMEN (TOP PERFORMERS) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {metrics.slice(0, 3).map((user, idx) => (
                    <div key={user.name} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden transition-transform hover:scale-[1.02]">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                    idx === 0 ? "bg-amber-100 text-amber-700" : 
                                    idx === 1 ? "bg-slate-100 text-slate-700" : 
                                    "bg-orange-100 text-orange-700"
                                }`}>
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-semibold text-slate-800 dark:text-white truncate max-w-[120px]">
                                    {user.name}
                                </span>
                            </div>
                            {idx === 0 && <Trophy size={18} className="text-amber-500" />}
                        </div>
                        
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Emails enviados</span>
                                <span className="font-medium text-slate-900 dark:text-slate-200">{user.emailsSent}</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                                <div 
                                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" 
                                    style={{ width: `${(user.emailsSent / (metrics[0]?.emailsSent || 1)) * 100}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-xs text-slate-400 mt-2">
                                <span>{user.contactsCreated} contactos creados</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* TABLA DETALLADA */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                <div className="overflow-hidden">
                    <table className="w-full text-left border-collapse table-fixed">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wider text-slate-500">
                                <th className="p-3 font-medium w-[18%]">Usuario</th>
                                <th className="p-3 font-medium text-center w-[12%]">Emails Enviados</th>
                                <th className="p-3 font-medium text-center w-[12%]">Contactos Creados</th>
                                <th className="p-3 font-medium w-[20%]">Campaña Más Usada</th>
                                <th className="p-3 font-medium w-[26%]">Última Acción</th>
                                <th className="p-3 font-medium text-right w-[12%]">Última Actividad</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {metrics.map((user) => {
                                // Calcular campaña más frecuente
                                const topCampaign = Object.entries(user.campaignTypes)
                                    .sort(([,a], [,b]) => b - a)[0]?.[0] || "-";
                                const fullAction = user.lastAction || "-";
                                const isExpanded = Boolean(expandedActions[user.name]);
                                const shouldTruncate = fullAction.length > ACTION_PREVIEW_MAX;
                                const visibleAction = isExpanded ? fullAction : getActionPreview(fullAction);

                                return (
                                    <tr key={user.name} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="p-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-xs font-bold">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-slate-700 dark:text-slate-200 truncate">
                                                    {user.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                <Mail size={12} className="mr-1" />
                                                {user.emailsSent}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                                {user.contactsCreated}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <span className="text-xs text-slate-500 truncate block" title={topCampaign}>
                                                {topCampaign}
                                            </span>
                                        </td>
                                        <td className="p-3 align-top">
                                            <span className={`text-xs text-slate-600 dark:text-slate-300 block ${isExpanded ? "whitespace-normal break-words" : "truncate"}`} title={fullAction}>
                                                {visibleAction}
                                                {shouldTruncate && !isExpanded && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setExpandedActions((prev) => ({ ...prev, [user.name]: true }))}
                                                        className="ml-1 text-blue-600 dark:text-blue-400 hover:underline"
                                                    >
                                                        ...
                                                    </button>
                                                )}
                                                {shouldTruncate && isExpanded && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setExpandedActions((prev) => ({ ...prev, [user.name]: false }))}
                                                        className="ml-1 text-blue-600 dark:text-blue-400 hover:underline"
                                                    >
                                                        ↑
                                                    </button>
                                                )}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right text-xs text-slate-500">
                                            {formatLastActivityDate(user.lastActivity)}
                                        </td>
                                    </tr>
                                );
                            })}
                            {metrics.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-500 italic">
                                        No hay datos de actividad registrados aún.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserAnalytics;
