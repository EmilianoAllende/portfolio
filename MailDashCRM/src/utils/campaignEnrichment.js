/**
 * campaignEnrichment.js
 * 
 * Utilidades para enriquecer el historial de campañas con eventos de Brevo
 * Mapea email_stats y email_events a campaigns_log para mostrar último evento
 */

/**
 * Mapeo de eventos Brevo a estados legibles
 */
const parseDeepJson = (value, fallback = {}) => {
	let current = value;

	for (let i = 0; i < 3; i += 1) {
		if (current == null) return fallback;
		if (typeof current === "object") return current;
		if (typeof current !== "string") return fallback;

		const text = current.trim();
		if (!text) return fallback;

		try {
			current = JSON.parse(text);
		} catch {
			return fallback;
		}
	}

	return typeof current === "object" && current !== null ? current : fallback;
};

export const BREVO_EVENT_LABELS = {
	// Enviados
	request: { label: "Enviado", color: "bg-blue-100 text-blue-800", icon: "📤" },
	
	// Entregados
	delivered: { label: "Entregado", color: "bg-green-100 text-green-800", icon: "✅" },
	
	// Abiertos
	opened: { label: "Abierto", color: "bg-purple-100 text-purple-800", icon: "👁️" },
	unique_opened: { label: "Abierto (único)", color: "bg-purple-100 text-purple-800", icon: "👁️" },
	proxy_open: { label: "Abierto por proxy", color: "bg-violet-100 text-violet-800", icon: "🛡️" },
	unique_proxy_open: { label: "Abierto por proxy (único)", color: "bg-violet-100 text-violet-800", icon: "🛡️" },
	
	// Clics
	click: { label: "Clic", color: "bg-indigo-100 text-indigo-800", icon: "🔗" },
	unique_click: { label: "Clic (único)", color: "bg-indigo-100 text-indigo-800", icon: "🔗" },
	
	// Rechazos/Bounces
	soft_bounce: { label: "Soft Bounce", color: "bg-amber-100 text-amber-800", icon: "⚠️" },
	hard_bounce: { label: "Rebotado (definitivo)", color: "bg-red-100 text-red-800", icon: "❌" },
	deferred: { label: "Pospuesto temporal", color: "bg-yellow-100 text-yellow-800", icon: "⏸️" },
	
	// Bloqueados
	blocked: { label: "Bloqueado", color: "bg-red-100 text-red-800", icon: "🚫" },
	spam: { label: "Spam", color: "bg-red-100 text-red-800", icon: "🚫" },
	
	// Inválidos/Desuscritos
	invalid_email: { label: "Email inválido", color: "bg-gray-100 text-gray-800", icon: "❌" },
	unsubscribed: { label: "Desuscrito", color: "bg-gray-100 text-gray-800", icon: "🚫" },
};

/**
 * Mapea un `status` (OPENED, CLICKED, DELIVERED, SENT, BLOCKED, BOUNCED, UNSUBSCRIBED)
 * al `eventType` esperado por los labels (opened, click, delivered, request, blocked, hard_bounce, unsubscribed)
 */
export const mapStatusToEventType = (status) => {
	if (!status) return undefined;
	const s = String(status).toUpperCase();
	switch (s) {
 		case "OPENED": return "opened";
 		case "CLICKED": return "click";
 		case "DELIVERED": return "delivered";
 		case "SENT": return "request";
 		case "BLOCKED": return "blocked";
 		case "UNSUBSCRIBED": return "unsubscribed";
 		case "BOUNCED": return "hard_bounce"; // genérico si no distinguimos
 		default: return undefined;
 	}
};

const normalizeEmailKey = (value) => String(value || "").trim().toLowerCase();

const getStatsForEmail = (email, emailStats = {}) => {
	const emailKey = normalizeEmailKey(email);
	if (emailStats[email]) return emailStats[email];
	if (emailKey && emailStats[emailKey]) return emailStats[emailKey];
	const matched = Object.keys(emailStats || {}).find((key) => normalizeEmailKey(key) === emailKey);
	return matched ? emailStats[matched] : undefined;
};

const getEventTimestampMs = (value) => {
	if (!value) return 0;

	const candidate = value.lastEvent
		?? value.timestampIso
		?? value.timestamp
		?? value.lastEventTs
		?? value.last_event
		?? value.lastEmailSync
		?? value.lastEmailSyncTs
		?? value.lastBrevoEventAt
		?? value.lastBrevoEventTs;

	if (candidate == null) return 0;
	if (typeof candidate === "number") {
		return candidate < 1e12 ? candidate * 1000 : candidate;
	}

	if (typeof candidate === "string") {
		const raw = candidate.trim();
		if (!raw) return 0;
		if (/^\d+$/.test(raw)) {
			const num = Number(raw);
			return num < 1e12 ? num * 1000 : num;
		}
		const parsed = new Date(raw).getTime();
		return Number.isNaN(parsed) ? 0 : parsed;
	}

	return 0;
};

const pickLatestEventCandidate = (...candidates) => {
	const validCandidates = candidates.filter(Boolean);
	if (validCandidates.length === 0) return null;

	return validCandidates.reduce((latest, current) => {
		if (!latest) return current;
		return getEventTimestampMs(current) >= getEventTimestampMs(latest) ? current : latest;
	}, null);
};

/**
 * Obtiene el evento más reciente de un email
 */
export const getLatestEventForEmail = (email, emailEvents = {}, emailStats = {}, opts = {}) => {
	const normalizeText = (value) => String(value || "").trim().toLowerCase();
	const emailKey = normalizeText(email);
	const getCounter = (source, key) => (typeof source?.[key] === "number" ? source[key] : 0);

	const toTimestampMs = (value) => {
		if (value == null) return 0;
		if (typeof value === "number") {
			return value < 1e12 ? value * 1000 : value;
		}
		if (typeof value === "string") {
			const raw = value.trim();
			if (!raw) return 0;
			if (/^\d+$/.test(raw)) {
				const num = Number(raw);
				return num < 1e12 ? num * 1000 : num;
			}
			const parsed = new Date(raw).getTime();
			return Number.isNaN(parsed) ? 0 : parsed;
		}
		return 0;
	};

	const statsForEmail = getStatsForEmail(email, emailStats);

	// Buscar en emailEvents todos los eventos para este email
	let allEvents = [];
	Object.keys(emailEvents || {}).forEach((key) => {
		const keyText = normalizeText(key);
		if (!emailKey || keyText.startsWith(emailKey)) {
			const arr = Array.isArray(emailEvents[key]) ? emailEvents[key] : [];
			allEvents = allEvents.concat(arr);
		}
	});

	if (opts.messageId) {
		const msg = String(opts.messageId);
		const byMessage = allEvents.filter((ev) => String(ev?.messageId || "").includes(msg));
		if (byMessage.length > 0) allEvents = byMessage;
	}

	if (opts.campaignId) {
		const campaignText = String(opts.campaignId);
		const byCampaign = allEvents.filter((ev) => {
			const cId = ev?.campaignId || ev?.templateId || ev?.subject || "";
			if (typeof cId === "string") return cId.includes(campaignText);
			if (typeof cId === "object") return JSON.stringify(cId).includes(campaignText);
			return false;
		});
		if (byCampaign.length > 0) allEvents = byCampaign;
	}

	// Si hay eventos, mostrar siempre el más reciente
	if (allEvents.length > 0) {
		allEvents.sort((a, b) => {
			const ta = toTimestampMs(a?.timestamp ?? a?.timestampIso ?? a?.lastEvent ?? a?.last_event);
			const tb = toTimestampMs(b?.timestamp ?? b?.timestampIso ?? b?.lastEvent ?? b?.last_event);
			return tb - ta;
		});

		const latest = allEvents[0] || {};
		const eventType = latest.eventType || latest.type || mapStatusToEventType(latest.status) || "request";
		return {
			eventType,
			status: latest.status || statsForEmail?.status,
			lastEvent: latest.timestampIso || latest.lastEvent || latest.last_event || latest.timestamp || statsForEmail?.lastEvent || statsForEmail?.lastEventTs || null,
			opens: typeof latest.opens === "number" && latest.opens > 0 ? latest.opens : (statsForEmail?.opens || 0),
			clicks: typeof latest.clicks === "number" && latest.clicks > 0 ? latest.clicks : (statsForEmail?.clicks || 0),
			openedCount: getCounter(latest, "openedCount") || getCounter(statsForEmail, "openedCount"),
			uniqueOpenedCount: getCounter(latest, "uniqueOpenedCount") || getCounter(statsForEmail, "uniqueOpenedCount"),
			proxyOpenCount: getCounter(latest, "proxyOpenCount") || getCounter(statsForEmail, "proxyOpenCount"),
			uniqueProxyOpenCount: getCounter(latest, "uniqueProxyOpenCount") || getCounter(statsForEmail, "uniqueProxyOpenCount"),
			clickCount: getCounter(latest, "clickCount") || getCounter(statsForEmail, "clickCount"),
			uniqueClickCount: getCounter(latest, "uniqueClickCount") || getCounter(statsForEmail, "uniqueClickCount"),
			softBounceCount: getCounter(latest, "softBounceCount") || getCounter(statsForEmail, "softBounceCount"),
			hardBounceCount: getCounter(latest, "hardBounceCount") || getCounter(statsForEmail, "hardBounceCount"),
			deferredCount: getCounter(latest, "deferredCount") || getCounter(statsForEmail, "deferredCount"),
			timestamp: latest.timestamp ?? latest.timestampIso ?? latest.lastEvent ?? latest.last_event ?? null,
			messageId: latest.messageId || statsForEmail?.messageId || null,
		};
	}

	// Fallback: usar emailStats si no hay eventos
	const stats = statsForEmail;
	if (stats) {
		const eventType = stats.eventType || mapStatusToEventType(stats.status) || "request";
		return {
			eventType,
			status: stats.status,
			lastEvent: stats.lastEvent || stats.lastEventTs,
			opens: stats.opens || 0,
			clicks: stats.clicks || 0,
			openedCount: getCounter(stats, "openedCount"),
			uniqueOpenedCount: getCounter(stats, "uniqueOpenedCount"),
			proxyOpenCount: getCounter(stats, "proxyOpenCount"),
			uniqueProxyOpenCount: getCounter(stats, "uniqueProxyOpenCount"),
			clickCount: getCounter(stats, "clickCount"),
			uniqueClickCount: getCounter(stats, "uniqueClickCount"),
			softBounceCount: getCounter(stats, "softBounceCount"),
			hardBounceCount: getCounter(stats, "hardBounceCount"),
			deferredCount: getCounter(stats, "deferredCount"),
			timestamp: stats.timestamp || stats.lastEventTs,
			messageId: stats.messageId,
		};
	}
	return null;
};

/**
 * Enriquece una organización con datos de eventos de Brevo
 * Si no hay evento, asigna "request" (Enviado) por defecto
 */
export const enrichOrganizationWithBrevoData = (org, opts = {}) => {
    if (!org) return org;
    const enriched = { ...org };
	const brevoData = parseDeepJson(org.brevo_data, {});
	const marketingData = parseDeepJson(org.marketing_data, {});
	const emailStats = parseDeepJson(org.email_stats, {});
	const emailEvents = parseDeepJson(org.email_events, {});
	const marketingEmailStats = parseDeepJson(marketingData.email_stats, {});
	const marketingEmailEvents = parseDeepJson(marketingData.email_events, {});
	const mergedEmailStats = { ...marketingEmailStats, ...emailStats };
	const mergedEmailEvents = { ...marketingEmailEvents, ...emailEvents };
	const emailKey = org.email || org.id;
	const campaignId = opts.campaignId || org.campaignId || org.templateId || undefined;
	const messageId = opts.messageId || org.messageId || undefined;
	const statsForEmail = getStatsForEmail(emailKey, mergedEmailStats) || {};

	const latestFromEmailData = getLatestEventForEmail(emailKey, mergedEmailEvents, mergedEmailStats, { campaignId, messageId });

	const latestFromBrevoData = (brevoData.lastBrevoStatus || brevoData.eventType || brevoData.lastBrevoEventAt || brevoData.lastEmailSync)
		? {
			eventType: (brevoData.eventType || brevoData.eventFamily || mapStatusToEventType(brevoData.lastBrevoStatus) || "request"),
			status: brevoData.lastBrevoStatus || "SENT",
			lastEvent: brevoData.lastBrevoEventAt || brevoData.lastEmailSync || null,
			opens: statsForEmail.opens || 0,
			clicks: statsForEmail.clicks || 0,
			openedCount: statsForEmail.openedCount || 0,
			uniqueOpenedCount: statsForEmail.uniqueOpenedCount || 0,
			proxyOpenCount: statsForEmail.proxyOpenCount || 0,
			uniqueProxyOpenCount: statsForEmail.uniqueProxyOpenCount || 0,
			clickCount: statsForEmail.clickCount || 0,
			uniqueClickCount: statsForEmail.uniqueClickCount || 0,
			softBounceCount: statsForEmail.softBounceCount || 0,
			hardBounceCount: statsForEmail.hardBounceCount || 0,
			deferredCount: statsForEmail.deferredCount || 0,
			timestamp: brevoData.lastBrevoEventTs || brevoData.lastEmailSyncTs || null,
			messageId: statsForEmail.messageId || null,
		}
		: null;

	const marketingBrevo = marketingData.brevo_data || marketingData.brevo || marketingData;
	const latestFromMarketingBrevo = (marketingBrevo.lastBrevoStatus || marketingBrevo.eventType || marketingBrevo.lastBrevoEventAt || marketingBrevo.lastEmailSync || marketingBrevo.status)
		? {
			eventType: (
				marketingBrevo.eventType ||
				marketingBrevo.eventFamily ||
				mapStatusToEventType(marketingBrevo.lastBrevoStatus || marketingBrevo.status) ||
				"request"
			),
			status: marketingBrevo.lastBrevoStatus || marketingBrevo.status || "SENT",
			lastEvent: marketingBrevo.lastBrevoEventAt || marketingBrevo.lastEmailSync || marketingBrevo.lastEvent || null,
			opens: marketingBrevo.opens ?? (statsForEmail.opens || 0),
			clicks: marketingBrevo.clicks ?? (statsForEmail.clicks || 0),
			openedCount: marketingBrevo.openedCount ?? (statsForEmail.openedCount || 0),
			uniqueOpenedCount: marketingBrevo.uniqueOpenedCount ?? (statsForEmail.uniqueOpenedCount || 0),
			proxyOpenCount: marketingBrevo.proxyOpenCount ?? (statsForEmail.proxyOpenCount || 0),
			uniqueProxyOpenCount: marketingBrevo.uniqueProxyOpenCount ?? (statsForEmail.uniqueProxyOpenCount || 0),
			clickCount: marketingBrevo.clickCount ?? (statsForEmail.clickCount || 0),
			uniqueClickCount: marketingBrevo.uniqueClickCount ?? (statsForEmail.uniqueClickCount || 0),
			softBounceCount: marketingBrevo.softBounceCount ?? (statsForEmail.softBounceCount || 0),
			hardBounceCount: marketingBrevo.hardBounceCount ?? (statsForEmail.hardBounceCount || 0),
			deferredCount: marketingBrevo.deferredCount ?? (statsForEmail.deferredCount || 0),
			timestamp: marketingBrevo.lastBrevoEventTs || marketingBrevo.lastEmailSyncTs || marketingBrevo.lastEventTs || null,
			messageId: marketingBrevo.messageId || statsForEmail.messageId || null,
		}
		: null;

	const latestFromOrgFields = (org.lastBrevoStatus || org.lastBrevoEventAt || org.lastBrevoEventTs)
		? {
			eventType: mapStatusToEventType(org.lastBrevoStatus) || "request",
			status: org.lastBrevoStatus || "SENT",
			lastEvent: org.lastBrevoEventAt || org.lastBrevoEventTs || null,
			opens: statsForEmail.opens || 0,
			clicks: statsForEmail.clicks || 0,
			openedCount: statsForEmail.openedCount || 0,
			uniqueOpenedCount: statsForEmail.uniqueOpenedCount || 0,
			proxyOpenCount: statsForEmail.proxyOpenCount || 0,
			uniqueProxyOpenCount: statsForEmail.uniqueProxyOpenCount || 0,
			clickCount: statsForEmail.clickCount || 0,
			uniqueClickCount: statsForEmail.uniqueClickCount || 0,
			softBounceCount: statsForEmail.softBounceCount || 0,
			hardBounceCount: statsForEmail.hardBounceCount || 0,
			deferredCount: statsForEmail.deferredCount || 0,
			messageId: statsForEmail.messageId || null,
		}
		: null;

	let latestEvent = pickLatestEventCandidate(
		latestFromEmailData,
		latestFromBrevoData,
		latestFromMarketingBrevo,
		latestFromOrgFields
	);

    // Si aún no hay evento, asignar "Enviado" por defecto
    if (!latestEvent) {
        latestEvent = {
            eventType: "request",
            status: "SENT",
            opens: 0,
            clicks: 0,
			openedCount: 0,
			uniqueOpenedCount: 0,
			proxyOpenCount: 0,
			uniqueProxyOpenCount: 0,
			clickCount: 0,
			uniqueClickCount: 0,
			softBounceCount: 0,
			hardBounceCount: 0,
			deferredCount: 0,
            lastEvent: null,
            messageId: null,
        };
    }

    enriched.brevo_latest_event = latestEvent;
    return enriched;
};

/**
 * Enriquece campaigns_log con datos de Brevo
 */
export const enrichCampaignsLogWithBrevo = (org, campaignsLog = {}) => {
	if (!org) return campaignsLog;

	const enriched = { ...campaignsLog };
	const marketingData = parseDeepJson(org.marketing_data, {});
	const emailStats = {
		...parseDeepJson(marketingData.email_stats, {}),
		...parseDeepJson(org.email_stats, {}),
	};

	// Para cada campaña en el log, intentar agregar estadísticas de Brevo
	Object.keys(enriched).forEach((campaignId) => {
		const campaign = enriched[campaignId];
		const messageId = campaign.messageId;

		if (messageId && emailStats[org.id]) {
			const stats = emailStats[org.id];
			if (stats.messageId === messageId) {
					enriched[campaignId] = {
					...campaign,
					brevo_stats: {
						status: stats.status,
						opens: stats.opens || 0,
						clicks: stats.clicks || 0,
						openedCount: stats.openedCount || 0,
						uniqueOpenedCount: stats.uniqueOpenedCount || 0,
						proxyOpenCount: stats.proxyOpenCount || 0,
						uniqueProxyOpenCount: stats.uniqueProxyOpenCount || 0,
						clickCount: stats.clickCount || 0,
						uniqueClickCount: stats.uniqueClickCount || 0,
						softBounceCount: stats.softBounceCount || 0,
						hardBounceCount: stats.hardBounceCount || 0,
						deferredCount: stats.deferredCount || 0,
						lastEvent: stats.lastEvent,
							eventType: stats.eventType || mapStatusToEventType(stats.status) || "request",
						timestamp: stats.timestamp,
					},
				};
			}
		}
	});

	return enriched;
};

/**
 * Formatea una fecha para mostrar en la UI
 */
export const formatEventDate = (dateStr) => {
	if (!dateStr) return "";
	
	try {
		// Si es timestamp Unix
		if (typeof dateStr === "number") {
			const dt = new Date(dateStr * 1000);
			return dt.toLocaleString("es-ES", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			});
		}

		// Si es string con formato dd/mm/yyyy hh:mm
		if (typeof dateStr === "string" && dateStr.includes("/")) {
			return dateStr;
		}

		// Si es ISO string
		const dt = new Date(dateStr);
		if (!isNaN(dt.getTime())) {
			return dt.toLocaleString("es-ES", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			});
		}

		return dateStr;
	} catch (e) {
		return dateStr;
	}
};

/**
 * Obtiene el label de un evento Brevo
 */
export const getEventLabel = (eventType) => {
	const key = (eventType ? String(eventType).toLowerCase() : "");
	return BREVO_EVENT_LABELS[key] || {
		label: "Desconocido",
		color: "bg-gray-100 text-gray-800",
		icon: "❓",
	};
};
