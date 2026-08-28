import {
    formatShortDate,
    formatFullDate,
    formatDateTime,
    extractScheduleTimestamp,
    getScheduledFollowupDate,
} from "./dateUtils";
import { statusStyles, getSnippet } from "./statusUtils";

export const DEFAULT_MEDIA_FOLLOWUP_SENDER_ID = "8a2f28d5-1010-48fd-b5df-fbb6d86a0bea";
export const FALLBACK_MEDIA_FOLLOWUP_SENDER = {
    id: DEFAULT_MEDIA_FOLLOWUP_SENDER_ID,
    displayName: "Kike de MMI Analytics",
    email: "ac.analytics@mmi-e.com",
    footerText: "Kike de MMI Analytics",
};

export function normalizeMediaFollowupResponse(rawData) {
    const payloads = Array.isArray(rawData) ? rawData : [rawData];
    const items = payloads.flatMap((entry) => {
        if (Array.isArray(entry?.clientes)) return entry.clientes;
        if (Array.isArray(entry?.data?.clientes)) return entry.data.clientes;
        if (Array.isArray(entry?.json?.clientes)) return entry.json.clientes;
        return [];
    });

    const deduped = new Map();

    items.forEach((item, index) => {
        const supabase = item?.supabase || {};
        const cliente = item?.cliente || {};
        const emailEnvio = parseEmailEnvio(supabase.email_envio || item?.email_envio || {});
        const envio = normalizeEnvio(emailEnvio.envio);
        if (envio === "eliminado") return;
        const id = cliente.id || supabase.id || item?.cliente_id || `media-followup-${index}`;
        const scheduleTimestamp = extractScheduleTimestamp(supabase, emailEnvio, item);

        const revision = emailEnvio.revision || null;

        // Detectar si la nota de prensa es más reciente que el email guardado
        const notaDate = cliente.fecha_ultima_nota ? new Date(cliente.fecha_ultima_nota) : null;
        const emailDate = supabase.timestamp ? new Date(supabase.timestamp) : null;
        const notaDesactualizada = !!(notaDate && emailDate && notaDate > emailDate && envio !== "enviado");

        deduped.set(id, {
            id,
            envio,
            envioLabel: (statusStyles[envio] || statusStyles.otro).label,
            revision,
            subject: emailEnvio.subject || item?.subject || "",
            body: emailEnvio.body || item?.body || "",
            emailEnvioRaw: emailEnvio,
            emailCliente: cliente.email || cliente.press_email || item?.email_cliente || supabase.id || "",
            organizacion:
                cliente.organizacion || cliente.nombre || cliente.email || supabase.id || "Sin organización",
            subline: [
                cliente.tipo_entidad,
                cliente.provincia,
                cliente.municipio,
                cliente.departamento,
                cliente.isla,
            ]
                .filter(Boolean)
                .join(" · "),
            tipoEntidad: cliente.tipo_entidad,
            claseEntidad: cliente.clase_entidad,
            domain: cliente.domain,
            telefono: cliente.telefono,
            direccion: cliente.direccion,
            nif: cliente.nif,
            pressSubject: cliente.press_subject,
            pressBody: cliente.press_body,
            pressSnippet: getSnippet(cliente.press_body),
            fechaUltimaNotaLabel: formatShortDate(cliente.fecha_ultima_nota),
            fechaUltimaNotaFull: formatFullDate(cliente.fecha_ultima_nota),
            scheduleTimestamp,
            scheduleTimestampLabel: formatDateTime(scheduleTimestamp),
            scheduledSendLabel: formatDateTime(getScheduledFollowupDate(scheduleTimestamp)),
            estado_cliente: typeof cliente.estado_cliente === "string" ? parseInt(cliente.estado_cliente, 10) : (cliente.estado_cliente ?? 0),
            notaDesactualizada,
            cliente,
            supabase,
        });
    });

    return Array.from(deduped.values());
}

export function parseEmailEnvio(value) {
    if (!value) return {};
    if (typeof value === "object") return value;

    try {
        return JSON.parse(value);
    } catch {
        return { body: String(value) };
    }
}

export function normalizeEnvio(value) {
    const normalized = String(value || "otro").trim().toLowerCase();

    if (normalized.includes("elim")) return "eliminado";
    if (normalized.includes("pend")) return "pendiente";
    if (normalized.includes("env")) return "enviado";
    if (normalized.includes("desc")) return "descartado";
    if (normalized.includes("error")) return "error";

    return normalized || "otro";
}

export function normalizeSender(sender) {
    if (!sender || typeof sender !== "object") {
        return FALLBACK_MEDIA_FOLLOWUP_SENDER;
    }

    return {
        id: sender.id || FALLBACK_MEDIA_FOLLOWUP_SENDER.id,
        displayName:
            sender.displayName ||
            sender.display_name ||
            sender.footerText ||
            sender.footer_text ||
            sender.label ||
            FALLBACK_MEDIA_FOLLOWUP_SENDER.displayName,
        email: sender.email || FALLBACK_MEDIA_FOLLOWUP_SENDER.email,
        footerText:
            sender.footerText ||
            sender.footer_text ||
            sender.displayName ||
            sender.display_name ||
            FALLBACK_MEDIA_FOLLOWUP_SENDER.footerText,
    };
}
