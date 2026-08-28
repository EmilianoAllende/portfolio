import { enrichOrganizationWithBrevoData } from "./campaignEnrichment";

export function slugify(str) {
  return (str || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

export function buildFallbackHistory(
  campanasActivas,
  campaignTemplates,
  organizaciones
) {
  // FIX: Helper para extraer el log independientemente del nombre del campo o formato string/object
  const getParsedLog = (org) => {
    let raw = org?.campaignslog || org?.campaigns_log;
    if (!raw) return null;
    if (typeof raw === "string") {
      try { return JSON.parse(raw); } catch (e) { return null; }
    }
    return typeof raw === "object" ? raw : null;
  };

  const hasLogs = Array.isArray(organizaciones) &&
    organizaciones.some((o) => getParsedLog(o) !== null);

  if (hasLogs) {
    const typeMap = new Map();
    const allDates = [];

    organizaciones.forEach((org) => {
      const log = getParsedLog(org);
      if (!log) return;

      const enrichedOrg = enrichOrganizationWithBrevoData(org);

      Object.entries(log).forEach(([key, info]) => {
        if (!info) return;

        let tpl = null;
        let templateId = extractTemplateId(key);
        tpl = campaignTemplates.find((t) => t.id === templateId);
        if (!tpl) tpl = campaignTemplates.find((t) => t.tag === templateId);
        if (!tpl) tpl = campaignTemplates.find((t) => t.title === templateId);
        
        // FIX: Soportar formato de n8n (templatetitle en vez de template_title)
        const title = tpl?.title || info.templatetitle || info.template_title || templateId;
        const description = tpl?.description || "";
        // FIX: Soportar formato de n8n (lastsent en vez de last_sent)
        const lastDate = normalizeDate(info.lastsent || info.last_sent); 

        // FIX: Soportar formato de n8n (sentby en vez de sent_by)
        const user = info.sentby || info.sent_by || info.created_by || info.usuario || info.user || null;
        
        const emailContent = (info.body || info.html || info.content || info.html_content) ? {
            body: info.body || info.html || info.content || info.html_content,
            subject: info.subject
        } : null;

        if (!typeMap.has(templateId))
          typeMap.set(templateId, { id: templateId, templateId, title, description, dates: new Map() });
        const entry = typeMap.get(templateId);

        if (lastDate) {
          allDates.push(lastDate);
          if (!entry.dates.has(lastDate)) entry.dates.set(lastDate, []);
          entry.dates.get(lastDate).push({
            name: org.organizacion || org.nombre || org.id || "Org",
            id: org.id,
            user: user,
            timestamp: info.lastsent || info.last_sent,
            brevoEvent: enrichedOrg.brevo_latest_event,
            messageId: info.messageId,
            emailContent: emailContent 
          });
        }
      });
    });

    const uniqueTypes = Array.from(typeMap.values()).reduce((acc, t) => {
      if (!acc.some(x => x.id === t.templateId)) {
        acc.push({
          id: t.templateId,
          templateId: t.templateId,
          title: t.title,
          description: t.description,
          last_sent_at: null,
          last_sent_hace_dias: null,
            dates: Array.from(t.dates.entries())
              .sort((a, b) => getDateSortValue(b[0]) - getDateSortValue(a[0]))
            .map(([date, orgs]) => ({ date, organizations: orgs })),
        });
      }
      return acc;
    }, []);

    const types = uniqueTypes;
    let hace_dias = null;
    if (allDates.length) {
      const newest = allDates.sort((a, b) => b.localeCompare(a))[0];
      hace_dias = daysSince(newest);
    }
    return { types, summary: { hace_dias_ultima_campana: hace_dias } };
  }

  // Fallback simple
  const titleToId = Object.fromEntries(
    campaignTemplates.map((t) => [t.title, t.id])
  );
  const map = new Map();
  (campanasActivas || []).forEach((c) => {
    const id = titleToId[c.tipo] || slugify(c.tipo);
    if (!map.has(id)) {
      const tpl = campaignTemplates.find((t) => t.id === id) || {
        title: c.tipo,
        description: "",
      };
      map.set(id, {
        id,
        title: tpl.title || c.tipo,
        description: tpl.description || "",
        dates: new Map(),
      });
    }
    const entry = map.get(id);
    const date = normalizeDate(c.fecha_envio);
    const user = c.sentby || c.sent_by || c.created_by || c.usuario || null;

    if (!entry.dates.has(date)) entry.dates.set(date, []);
    entry.dates
      .get(date)
      .push({ 
        name: c.organizacion, 
        id: c.id, 
        user: user,
        timestamp: c.fecha_envio 
      });
  });

  const types = Array.from(map.values()).map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    last_sent_at: null,
    last_sent_hace_dias: null,
    dates: Array.from(t.dates.entries())
      .sort((a, b) => getDateSortValue(b[0]) - getDateSortValue(a[0]))
      .map(([date, orgs]) => ({ date, organizations: orgs })),
  }));

  let hace_dias = null;
  if (Array.isArray(organizaciones) && organizaciones.length) {
    const values = organizaciones
      .map((o) => o?.hace_dias)
      .filter((v) => Number.isFinite(v));
    if (values.length) hace_dias = Math.min(...values);
  }
  return { types, summary: { hace_dias_ultima_campana: hace_dias } };
}

export function normalizeDate(d) {
  const parsed = parseHistoryDate(d);
  if (!parsed) return "";
  const year = parsed.getUTCFullYear();
  const month = String(parsed.getUTCMonth() + 1).padStart(2, "0");
  const day = String(parsed.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseHistoryDate(value) {
  if (!value) return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  const text = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    const [y, m, d] = text.split("-").map(Number);
    const normal = new Date(Date.UTC(y, m - 1, d));

    const swapped = new Date(Date.UTC(y, d - 1, m));
    const now = new Date();

    const normalIsFuture = normal.getTime() > now.getTime();
    const swappedIsValid = !Number.isNaN(swapped.getTime());
    const swappedIsFuture = swappedIsValid ? swapped.getTime() > now.getTime() : true;

    if (normalIsFuture && swappedIsValid && !swappedIsFuture) {
      return swapped;
    }

    return normal;
  }

  const dmyWithOptionalTime = text.match(
    /^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?/
  );
  if (dmyWithOptionalTime) {
    const day = Number(dmyWithOptionalTime[1]);
    const month = Number(dmyWithOptionalTime[2]);
    const year = Number(dmyWithOptionalTime[3]);
    const hour = Number(dmyWithOptionalTime[4] || 0);
    const minute = Number(dmyWithOptionalTime[5] || 0);
    const second = Number(dmyWithOptionalTime[6] || 0);
    return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  }

  const dmyDash = text.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dmyDash) {
    const day = Number(dmyDash[1]);
    const month = Number(dmyDash[2]);
    const year = Number(dmyDash[3]);
    return new Date(Date.UTC(year, month - 1, day));
  }

  const nativeDate = new Date(text);
  if (!Number.isNaN(nativeDate.getTime())) {
    return nativeDate;
  }

  return null;
}

export function getDateSortValue(value) {
  const parsed = parseHistoryDate(value);
  if (!parsed) return 0;
  return parsed.getTime();
}

export function formatHistoryDateForDisplay(value) {
  const parsed = parseHistoryDate(value);
  if (!parsed) return value;
  return parsed.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function mergeHistories(primary, fallback) {
  if (!primary) return fallback;
  if (!fallback || !Array.isArray(fallback.types) || fallback.types.length === 0) {
    return primary;
  }

  const normalizeTypeKey = (value) =>
    (value || "")
      .toString()
      .trim()
      .toLowerCase();

  const existingKeys = new Set(
    (primary.types || []).flatMap((typeEntry) => [
      normalizeTypeKey(typeEntry.id),
      normalizeTypeKey(typeEntry.templateId),
      normalizeTypeKey(typeEntry.title),
    ])
  );

  const missingTypes = (fallback.types || []).filter((typeEntry) => {
    const keys = [
      normalizeTypeKey(typeEntry.id),
      normalizeTypeKey(typeEntry.templateId),
      normalizeTypeKey(typeEntry.title),
    ];
    return !keys.some((key) => key && existingKeys.has(key));
  });

  if (missingTypes.length === 0) return primary;

  return {
    ...primary,
    types: [...(primary.types || []), ...missingTypes],
    summary: {
      ...primary.summary,
      hace_dias_ultima_campana:
        primary.summary?.hace_dias_ultima_campana ??
        fallback.summary?.hace_dias_ultima_campana ??
        null,
    },
  };
}

export function normalizeHistoryForDisplay(history) {
  if (!history || !Array.isArray(history.types)) return history;

  const sortedTypes = [...history.types]
    .map((typeEntry) => {
      const sortedDates = [...(typeEntry.dates || [])].sort(
        (a, b) => getDateSortValue(b?.date) - getDateSortValue(a?.date)
      );

      const fallbackDateValue = sortedDates[0]?.date || null;
      const validLastDateValue = getLastNonFutureDate(sortedDates) || fallbackDateValue;
      const lastSentHaceDias = validLastDateValue ? daysSince(validLastDateValue) : null;

      return {
        ...typeEntry,
        dates: sortedDates,
        last_sent_hace_dias: Number.isFinite(lastSentHaceDias)
          ? Math.max(0, lastSentHaceDias)
          : null,
      };
    })
    .sort((a, b) => {
      const aDate = a?.dates?.[0]?.date;
      const bDate = b?.dates?.[0]?.date;
      return getDateSortValue(bDate) - getDateSortValue(aDate);
    });

  const allSortedDates = sortedTypes.flatMap((typeEntry) => typeEntry?.dates || []);
  const globalLatestDate = getLastNonFutureDate(allSortedDates) || sortedTypes[0]?.dates?.[0]?.date || null;
  const globalHaceDias = globalLatestDate ? daysSince(globalLatestDate) : null;

  return {
    ...history,
    types: sortedTypes,
    summary: {
      ...(history.summary || {}),
      hace_dias_ultima_campana: Number.isFinite(globalHaceDias)
        ? Math.max(0, globalHaceDias)
        : history.summary?.hace_dias_ultima_campana ?? null,
    },
  };
}

export function getLastNonFutureDate(dateEntries = []) {
  for (const entry of dateEntries) {
    const rawDate = entry?.date;
    const diffDays = daysSince(rawDate);
    if (Number.isFinite(diffDays) && diffDays >= 0) {
      return rawDate;
    }
  }
  return null;
}

export function extractTemplateId(key) {
  if (!key) return "";
  let val = key;
  if (typeof val === "string" && val.trim().startsWith("[")) {
    try {
      const arr = JSON.parse(val);
      if (Array.isArray(arr) && arr.length) {
        val = arr[0];
      }
    } catch {}
  }
  return val.toString().trim().toLowerCase();
}

export function daysSince(isoOrYMD) {
  try {
    const dt = parseHistoryDate(isoOrYMD);
    if (Number.isNaN(dt.getTime())) return null;
    const now = new Date();

    const nowUtcMidnight = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    );
    const dtUtcMidnight = Date.UTC(
      dt.getUTCFullYear(),
      dt.getUTCMonth(),
      dt.getUTCDate()
    );

    const diffMs = nowUtcMidnight - dtUtcMidnight;
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
}
