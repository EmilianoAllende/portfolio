export function formatShortDate(value) {
    if (!value) return "sin fecha";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "sin fecha";

    return new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
}

export function formatFullDate(value) {
    if (!value) return "sin fecha registrada";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "sin fecha registrada";

    return new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(date);
}

// Users in any Spanish timezone always see Canary Islands time.
const SPAIN_TIMEZONES = new Set(["Europe/Madrid", "Atlantic/Canary", "Africa/Ceuta"]);

function resolveDisplayTimezone() {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return SPAIN_TIMEZONES.has(tz) ? "Atlantic/Canary" : (tz || "Atlantic/Canary");
}

export function formatDateTime(value, opts = {}) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const locale = navigator.language || "es-ES";
    const tz = opts.timezone || resolveDisplayTimezone();
    const showZone = opts.showZone !== false;

    const formatted = new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: tz,
    }).format(date);

    const tzMap = {
        "Europe/Madrid": "España peninsular",
        "Atlantic/Canary": "Canarias",
        "America/Argentina/Buenos_Aires": "Argentina",
        "America/Montevideo": "Uruguay",
        "America/Santiago": "Chile",
        "America/Mexico_City": "México",
    };
    let tzLabel = tzMap[tz] || tz;
    if (!tzMap[tz] && tz.includes("/")) {
        tzLabel = tz.split("/").pop().replace(/_/g, " ");
    }

    return showZone ? `${formatted} (${tzLabel})` : formatted;
}

export function extractScheduleTimestamp(supabase, emailEnvio, item) {
    const candidates = [
        supabase?.timestamp,
        supabase?.created_at,
        supabase?.createdAt,
        supabase?.fecha,
        supabase?.fecha_creacion,
        supabase?.inserted_at,
        emailEnvio?.timestamp,
        emailEnvio?.created_at,
        item?.timestamp,
    ];

    return candidates.find((candidate) => {
        if (!candidate) return false;
        return !Number.isNaN(new Date(candidate).getTime());
    }) || null;
}

// Returns the UTC offset (in minutes) of a given IANA timezone at a specific UTC instant.
// Uses noon UTC to safely avoid DST boundary edge cases.
function getTimezoneOffsetMinutes(utcDate, timeZone) {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone,
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        hour12: false,
    }).formatToParts(utcDate);
    const get = (type) => parseInt(parts.find((p) => p.type === type).value, 10);
    const localHour = get("hour") % 24;
    const naiveUtcMs = Date.UTC(get("year"), get("month") - 1, get("day"), localHour, get("minute"), get("second"));
    return Math.round((naiveUtcMs - utcDate.getTime()) / 60000);
}

export function getScheduledFollowupDate(value) {
    if (!value) return null;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    // Skip 2 calendar days using UTC to match the n8n SQL calculation
    date.setUTCDate(date.getUTCDate() + 2);
    const dow = date.getUTCDay();
    if (dow === 6) date.setUTCDate(date.getUTCDate() + 2);      // Saturday → Monday
    else if (dow === 0) date.setUTCDate(date.getUTCDate() + 1); // Sunday → Monday

    // Set to 11:00 Canarias time, adjusted for DST (WET = UTC+0, WEST = UTC+1)
    const noon = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12, 0, 0));
    const canariasOffsetMin = getTimezoneOffsetMinutes(noon, "Atlantic/Canary");
    date.setUTCHours(11 - Math.floor(canariasOffsetMin / 60), 0, 0, 0);

    return date;
}
