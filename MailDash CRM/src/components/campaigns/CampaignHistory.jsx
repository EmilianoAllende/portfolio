/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  ChevronDown,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  MessageSquare,
  Eye,
  X
} from "lucide-react";
import BrevoEventBadge from "../preview/BrevoEventBadge";
import { enrichOrganizationWithBrevoData } from "../../utils/campaignEnrichment";
import CommercialObservationsModal from "./CommercialObservationsModal";
import EmailContentModal from "./EmailContentModal";
import apiClient from "../../api/apiClient";

// Mantener vacío para no ocultar campañas/organizaciones por filtros hardcodeados.
const HIDDEN_HISTORY_EMAILS = new Set([]);

const DEBUG_HISTORY_ORG_KEYS = new Set([
  "alcaldia@elpaso.es",
  "prensa@elpaso.es",
]);

const normalizeEmail = (value) => (value ?? "").toString().trim().toLowerCase();

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

const getOrgPrimaryEmail = (org) =>
  normalizeEmail(org?.email || org?.id || org?.client_id || "");

const findOrganizationRecord = (orgRef, organizations = []) => {
  if (!orgRef || !Array.isArray(organizations) || organizations.length === 0) return null;

  const refId = (orgRef.id ?? "").toString().trim();
  const refEmail = normalizeEmail(orgRef.email || orgRef.id || orgRef.client_id || "");

  return organizations.find((candidate) => {
    const candidateId = (candidate?.id ?? "").toString().trim();
    const candidateClientId = (candidate?.client_id ?? "").toString().trim();
    const candidateEmail = getOrgPrimaryEmail(candidate);

    if (refId && (candidateId === refId || candidateClientId === refId)) return true;
    if (refEmail && (candidateEmail === refEmail || normalizeEmail(candidateClientId) === refEmail)) return true;
    return false;
  }) || null;
};

const shouldDebugHistoryOrg = (orgRef, fullOrg) => {
  const candidates = [
    orgRef?.id,
    orgRef?.email,
    orgRef?.client_id,
    fullOrg?.id,
    fullOrg?.email,
    fullOrg?.client_id,
  ];

  return candidates
    .map((v) => normalizeEmail(v))
    .some((key) => key && DEBUG_HISTORY_ORG_KEYS.has(key));
};

const shouldHideHistoryRecipient = (orgEntry) => {
  if (!orgEntry) return false;
  if (typeof orgEntry === "string") {
    return HIDDEN_HISTORY_EMAILS.has(normalizeEmail(orgEntry));
  }
  const emailCandidate = orgEntry.email || orgEntry.id;
  return HIDDEN_HISTORY_EMAILS.has(normalizeEmail(emailCandidate));
};

const getBajaReasonText = (value) => {
  if (value === null || value === undefined) return null;

  const normalizeText = (text) => {
    const cleaned = String(text || "").trim();
    if (!cleaned || cleaned.toLowerCase() === "null") return null;
    return cleaned;
  };

  if (Array.isArray(value)) {
    const items = value.map((v) => normalizeText(v)).filter(Boolean);
    return items.length ? items.join(", ") : null;
  }

  if (typeof value === "string") {
    const direct = normalizeText(value);
    if (!direct) return null;

    const parsed = parseDeepJson(direct, null);
    if (Array.isArray(parsed)) {
      const items = parsed.map((v) => normalizeText(v)).filter(Boolean);
      return items.length ? items.join(", ") : null;
    }
    if (typeof parsed === "string") {
      return normalizeText(parsed);
    }

    return direct;
  }

  return normalizeText(value);
};

const getBrevoTerminalMeta = (eventTypeRaw, statusRaw) => {
  const eventType = String(eventTypeRaw || "").toLowerCase();
  const status = String(statusRaw || "").toLowerCase();

  if (["blocked", "spam"].includes(eventType) || ["blocked", "spam"].includes(status)) {
    return { key: "blocked", label: "Bloqueado" };
  }

  if (["hard_bounce"].includes(eventType)) {
    return { key: "hard_bounce", label: "Rebotado definitivo" };
  }

  if (["soft_bounce"].includes(eventType)) {
    return { key: "soft_bounce", label: "Soft Bounce" };
  }

  if (["deferred"].includes(eventType)) {
    return { key: "deferred", label: "Deferred" };
  }

  if (["bounced", "bounce"].includes(status)) {
    return { key: "soft_bounce", label: "Bounce" };
  }

  if (["unsubscribed"].includes(eventType) || ["unsubscribed"].includes(status)) {
    return { key: "unsubscribed", label: "Desuscrito" };
  }

  return null;
};

const getEventTimestampMs = (eventLike) => {
  const value = eventLike?.timestamp ?? eventLike?.ts ?? eventLike?.timestampIso ?? eventLike?.lastEvent;
  if (value == null) return 0;

  if (typeof value === "number") {
    return value < 1e12 ? value * 1000 : value;
  }

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const normalizeRefKeys = (...values) => values
  .map((v) => normalizeEmail(v))
  .filter(Boolean);

const keyMatchesOrgRef = (key, refs) => {
  const normalizedKey = normalizeEmail(key);
  if (!normalizedKey || refs.length === 0) return false;

  return refs.some((ref) => normalizedKey.startsWith(ref) || ref.startsWith(normalizedKey));
};

const resolveTerminalFromEmailData = (orgEntry) => {
  const refs = normalizeRefKeys(orgEntry?.email, orgEntry?.id, orgEntry?.client_id);
  const emailEvents = parseDeepJson(orgEntry?.email_events, {}) || {};
  const emailStats = parseDeepJson(orgEntry?.email_stats, {}) || {};

  let latestMeta = null;
  let latestMs = 0;

  Object.entries(emailEvents).forEach(([key, events]) => {
    if (!Array.isArray(events)) return;
    if (refs.length > 0 && !keyMatchesOrgRef(key, refs)) return;

    events.forEach((eventItem) => {
      const meta = getBrevoTerminalMeta(eventItem?.type || eventItem?.eventType, eventItem?.status);
      if (!meta) return;
      const tsMs = getEventTimestampMs(eventItem);
      if (!latestMeta || tsMs >= latestMs) {
        latestMeta = meta;
        latestMs = tsMs;
      }
    });
  });

  if (latestMeta) return latestMeta;

  Object.entries(emailStats).forEach(([key, stat]) => {
    if (!stat || typeof stat !== "object") return;
    if (refs.length > 0 && !keyMatchesOrgRef(key, refs)) return;

    const meta = getBrevoTerminalMeta(stat?.eventType, stat?.status);
    if (!meta) return;
    const tsMs = getEventTimestampMs(stat);
    if (!latestMeta || tsMs >= latestMs) {
      latestMeta = meta;
      latestMs = tsMs;
    }
  });

  return latestMeta;
};

const resolveBajaBrevoMeta = (orgEntry, brevoEvent) => {
  const direct = getBrevoTerminalMeta(brevoEvent?.eventType, brevoEvent?.status);
  if (direct) return direct;

  const fromEmailData = resolveTerminalFromEmailData(orgEntry);
  if (fromEmailData) return fromEmailData;

  const brevoData = parseDeepJson(orgEntry?.brevo_data, {}) || {};
  const marketingData = parseDeepJson(orgEntry?.marketing_data, {}) || {};
  const marketingBrevo = marketingData.brevo_data || marketingData.brevo || marketingData || {};

  const fromBrevoData = getBrevoTerminalMeta(
    brevoData.eventType || brevoData.lastBrevoStatus,
    brevoData.lastBrevoStatus || brevoData.status
  );
  if (fromBrevoData) return fromBrevoData;

  const fromMarketing = getBrevoTerminalMeta(
    marketingBrevo.eventType || marketingBrevo.lastBrevoStatus || marketingBrevo.status,
    marketingBrevo.lastBrevoStatus || marketingBrevo.status
  );
  if (fromMarketing) return fromMarketing;

  return null;
};

const isBlockedOrBouncedBrevo = (brevoEvent) => {
  if (!brevoEvent) return false;
  const eventType = String(brevoEvent.eventType || "").toLowerCase();
  const status = String(brevoEvent.status || "").toLowerCase();

  const blocked = ["blocked", "spam"].includes(eventType) || ["blocked", "spam"].includes(status);
  const bounced = ["hard_bounce", "soft_bounce", "deferred"].includes(eventType)
    || ["bounced", "bounce"].includes(status);

  return blocked || bounced;
};

const filterHistoryRecipients = (history) => {
  if (!history || !Array.isArray(history.types)) return history;

  const filteredTypes = history.types
    .map((typeEntry) => {
      const filteredDates = (typeEntry.dates || [])
        .map((dateEntry) => ({
          ...dateEntry,
          organizations: (dateEntry.organizations || []).filter(
            (orgEntry) => !shouldHideHistoryRecipient(orgEntry)
          ),
        }))
        .filter((dateEntry) => (dateEntry.organizations || []).length > 0);

      return {
        ...typeEntry,
        dates: filteredDates,
      };
    })
    .filter((typeEntry) => (typeEntry.dates || []).length > 0);

  return {
    ...history,
    types: filteredTypes,
  };
};


const CampaignHistory = ({
  campanasActivas = [],
  organizaciones = [],
  campaignTemplates = [],
  historyData,
  isLoading,
  onRefresh,
  setNotification,
  setConfirmProps,
  closeConfirm,
}) => {
  const [displayHistory, setDisplayHistory] = useState({
    types: [],
    summary: { hace_dias_ultima_campana: null },
  });

  const [isObservationsModalOpen, setIsObservationsModalOpen] = useState(false);
  const [orgForObservations, setOrgForObservations] = useState(null);

  // Estados para el modal de email
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailDataForModal, setEmailDataForModal] = useState(null);

  // NUEVO ESTADO PARA CARGA DEL CORREO
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);

  const [expandedType, setExpandedType] = useState(null);
  const [expandedDateByType, setExpandedDateByType] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const hasRequestedHistoryRef = useRef(false);

  const setDisplayHistoryIfChanged = useCallback((nextHistory) => {
    setDisplayHistory((prevHistory) => {
      try {
        const prevSerialized = JSON.stringify(prevHistory);
        const nextSerialized = JSON.stringify(nextHistory);
        return prevSerialized === nextSerialized ? prevHistory : nextHistory;
      } catch {
        return nextHistory;
      }
    });
  }, []);

  // --- MAPEO DE CAMPAIGN ID/TAG/TITLE A TÍTULO MOSTRABLE ---
  const normalizeKey = (v) => (v ?? "").toString().trim().toLowerCase();
  const campaignIdToTitle = React.useMemo(() => {
    const map = {};
    const manual = {
      "mmi analytics": "Campaña Suscripción MMI - Ayuntamientos",
    };
    Object.entries(manual).forEach(([k, v]) => {
      map[normalizeKey(k)] = v;
    });

    (campaignTemplates || []).forEach((template) => {
      const title = template.title || template.id || "";
      const candidates = [template.id, template.tag, template.title, slugify(title)];
      candidates.filter(Boolean).forEach((c) => {
        map[normalizeKey(c)] = title;
      });
    });
    return map;
  }, [campaignTemplates]);

  const getCampaignTitle = useCallback(
    (typeIdRaw, templateId) => {
      if (typeIdRaw === "1" || typeIdRaw === 1) {
        return "Administracion";
      }

      if (templateId) {
        const key = normalizeKey(templateId);
        if (campaignIdToTitle[key]) return campaignIdToTitle[key];
      }
      if (!typeIdRaw) return typeIdRaw;
      let typeId = typeIdRaw;
      if (typeof typeIdRaw === "string" && typeIdRaw.trim().startsWith("[")) {
        try {
          const arr = JSON.parse(typeIdRaw);
          if (Array.isArray(arr) && arr.length) {
            typeId = arr[0];
          }
        } catch (e) { }
      }
      const key = normalizeKey(typeId);
      if (campaignIdToTitle[key]) {
        return campaignIdToTitle[key];
      }
      const slugKey = normalizeKey(slugify(typeId));
      if (campaignIdToTitle[slugKey]) {
        return campaignIdToTitle[slugKey];
      }
      return typeId;
    },
    [campaignIdToTitle]
  );

  const fallbackHistory = useMemo(() => {
    return buildFallbackHistory(campanasActivas, campaignTemplates, organizaciones);
  }, [campanasActivas, campaignTemplates, organizaciones]);

  useEffect(() => {
    if (historyData) {
      hasRequestedHistoryRef.current = false;
      const enrichedHistory = {
        ...historyData,
        types: (historyData.types || [])
          .map((t) => {
          let templateId = t.templateId || t.id;
          const tpl = campaignTemplates.find(tmp => tmp.id === t.id || tmp.title === t.id || tmp.tag === t.id);
          if (tpl && tpl.id) templateId = tpl.id;
          const backendTitle = (t.title || "").toString().trim();
          const resolvedTitle = backendTitle || getCampaignTitle(t.id, templateId);
          return {
            ...t,
            templateId,
            title: resolvedTitle,
            dates: (t.dates || []).map((dateEntry) => ({
              ...dateEntry,
              organizations: (dateEntry.organizations || []).map((org) => {
                const fullOrg = findOrganizationRecord(org, organizaciones);
                if (fullOrg) {
                  const enrichedOrg = enrichOrganizationWithBrevoData(fullOrg);
                  
                  let timestamp = org.timestamp;
                  let emailBody = org.body || org.html || null;
                  let subject = org.subject || null;

                  // FIX: Buscar tanto con guión bajo como sin él
                  const rawLog = fullOrg.campaignslog || fullOrg.campaigns_log;
                  
                  if (rawLog) {
                    const log = parseDeepJson(rawLog, {});
                    
                    let campaignKey = Object.keys(log).find(key => key === templateId || key.includes(templateId));
                    if (!campaignKey) {
                      campaignKey = Object.keys(log).find(key => key === t.id || key.includes(t.id));
                    }

                    if (campaignKey && log[campaignKey]) {
                      const logEntry = log[campaignKey];
                      // FIX: Soportar formato de n8n (lastsent en vez de last_sent)
                      if (!timestamp) timestamp = logEntry.lastsent || logEntry.last_sent;
                      
                      if (!emailBody) emailBody = logEntry.body || logEntry.html || logEntry.content || logEntry.html_content;
                      if (!subject) subject = logEntry.subject;

                      if (shouldDebugHistoryOrg(org, fullOrg)) {
                        console.groupCollapsed("🧪 [Historial Debug Org] alcaldia@elpaso.es");
                        console.log("Org referencia:", {
                          orgId: org?.id,
                          orgEmail: org?.email,
                          orgClientId: org?.client_id,
                        });
                        console.log("Org encontrada en dataset:", {
                          id: fullOrg?.id,
                          email: fullOrg?.email,
                          client_id: fullOrg?.client_id,
                          organizacion: fullOrg?.organizacion,
                        });
                        console.log("Campaña resuelta:", {
                          historyTypeId: t?.id,
                          historyTemplateId: templateId,
                          campaignKey,
                          templateTitle: logEntry?.template_title || logEntry?.templatetitle,
                          subject: logEntry?.subject,
                        });
                        console.log("Fechas:", {
                          timestampUI: timestamp || null,
                          log_last_sent: logEntry?.last_sent || logEntry?.lastsent || null,
                          log_created_at: logEntry?.created_at || null,
                          log_updated_at: logEntry?.updated_at || null,
                        });
                        console.log("Brevo resuelto:", enrichedOrg?.brevo_latest_event || null);
                        console.groupEnd();
                      }
                    }
                  }
                  
                  return {
                    ...org,
                    timestamp: timestamp,
                    brevoEvent: enrichedOrg.brevo_latest_event,
                    suscripcion: fullOrg.suscripcion,
                    organizacionBaja: fullOrg.organizacion_baja,
                    brevo_data: fullOrg.brevo_data,
                    marketing_data: fullOrg.marketing_data,
                    email_events: fullOrg.email_events,
                    email_stats: fullOrg.email_stats,
                    emailContent: emailBody ? { body: emailBody, subject: subject } : null
                  };
                }
                return {
                  ...org,
                  suscripcion: org.suscripcion || org.subscription || null,
                  organizacionBaja: org.organizacionBaja || org.organizacion_baja || null,
                  brevo_data: org.brevo_data || null,
                  marketing_data: org.marketing_data || null,
                  email_events: org.email_events || null,
                  email_stats: org.email_stats || null,
                };
              })
            }))
          };
        }),
      };
      const mergedHistory = mergeHistories(enrichedHistory, fallbackHistory);
      const filteredHistory = filterHistoryRecipients(mergedHistory);
      setDisplayHistoryIfChanged(normalizeHistoryForDisplay(filteredHistory));
    } else if (!isLoading && typeof onRefresh === "function") {
      if (!hasRequestedHistoryRef.current) {
        hasRequestedHistoryRef.current = true;
        onRefresh();
      }
    } else if (fallbackHistory) {
      const filteredHistory = filterHistoryRecipients(fallbackHistory);
      setDisplayHistoryIfChanged(normalizeHistoryForDisplay(filteredHistory));
    }
  }, [historyData, isLoading, onRefresh, fallbackHistory, getCampaignTitle, organizaciones, campaignTemplates, setDisplayHistoryIfChanged]);

  const handleManualRefresh = async () => {
    if (onRefresh) {
      // Limpiar vista actual para forzar recarga visual desde cero.
      setDisplayHistoryIfChanged({
        types: [],
        summary: { hace_dias_ultima_campana: null },
      });
      setExpandedType(null);
      setExpandedDateByType({});

      await onRefresh();
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }
  };

  const handleOpenObservationsModal = (org) => {
    const fullOrg = organizaciones.find(o => o.id === org.id);
    setOrgForObservations(fullOrg || org);
    setIsObservationsModalOpen(true);
  };

  // NUEVA FUNCIÓN PARA OBTENER EL EMAIL DESDE EL BACKEND
  const handleFetchAndOpenEmail = async (orgId, campaignId, fallbackContent) => {
    // Si ya tenemos el contenido cargado previamente (desde el historial), usarlo
    if (fallbackContent && fallbackContent.body) {
      setEmailDataForModal(fallbackContent);
      setIsEmailModalOpen(true);
      return;
    }

    // Si no, lo pedimos a n8n
    try {
      setIsLoadingEmail(true);
      const response = await apiClient.getEmailContent(orgId, campaignId);

      if (response && response.data) {
        setEmailDataForModal(response.data);
        setIsEmailModalOpen(true);
      } else {
        alert("No se pudo cargar el contenido del correo.");
      }
    } catch (error) {
      console.error("Error cargando email", error);
      alert("Ocurrió un error al intentar leer el correo.");
    } finally {
      setIsLoadingEmail(false);
    }
  };


  const handleSaveObservationsSuccess = (updatedOrg) => {
    if (onRefresh) {
      onRefresh();
    }
  };

  const toggleType = (typeId) => {
    setExpandedType((prev) => (prev === typeId ? null : typeId));
    setExpandedDateByType((prev) => ({
      ...prev,
      [typeId]: prev[typeId] || null,
    }));
  };

  const toggleDate = (typeId, dateStr) => {
    setExpandedDateByType((prev) => ({
      ...prev,
      [typeId]: prev[typeId] === dateStr ? null : dateStr,
    }));
  };

  useEffect(() => {
    const types = displayHistory?.types || [];
    if (!types.length) return;

    const rows = [];
    types.forEach((typeEntry) => {
      const dates = typeEntry?.dates || [];
      dates.forEach((dateEntry, index) => {
        rows.push({
          campana: typeEntry.title || typeEntry.id,
          fecha: dateEntry.date,
          haceDiasCalculado: daysSince(dateEntry.date),
          haceDiasCampana: index === 0 ? typeEntry.last_sent_hace_dias : "",
          organizaciones: (dateEntry.organizations || []).length,
          primerOrg: dateEntry.organizations?.[0]?.name || dateEntry.organizations?.[0]?.id || "",
        });
      });
    });

    console.groupCollapsed("📊 Debug Historial Campañas (hace_dias)");
    console.table(rows);
    console.log("summary.hace_dias_ultima_campana:", displayHistory?.summary?.hace_dias_ultima_campana);
    console.groupEnd();
  }, [displayHistory]);

  useEffect(() => {
    const types = displayHistory?.types || [];
    if (!types.length) return;

    const blockedOrBouncedRows = [];

    types.forEach((typeEntry) => {
      (typeEntry?.dates || []).forEach((dateEntry) => {
        (dateEntry?.organizations || []).forEach((orgEntry) => {
          if (isBlockedOrBouncedBrevo(orgEntry?.brevoEvent)) {
            blockedOrBouncedRows.push({
              campana: typeEntry?.title || typeEntry?.id || "-",
              fecha: dateEntry?.date || "-",
              organizacion: orgEntry?.name || orgEntry?.organizacion || orgEntry?.id || "-",
              email: orgEntry?.email || "-",
              eventType: orgEntry?.brevoEvent?.eventType || "-",
              status: orgEntry?.brevoEvent?.status || "-",
              lastEvent: orgEntry?.brevoEvent?.lastEvent || "-",
            });
          }
        });
      });
    });

    if (blockedOrBouncedRows.length > 0) {
      console.groupCollapsed("🚨 [Historial Debug Brevo] Solo bloqueados y bounceados");
      console.table(blockedOrBouncedRows);
      console.groupEnd();
    }
  }, [displayHistory]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h3 className={styles.headerTitle}>📅 Historial de Campañas</h3>
            {showSuccess && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-100 text-green-700 text-xs font-medium animate-fadeIn">
                <CheckCircle2 size={14} /> Actualizado
              </span>
            )}
          </div>
          <button
            onClick={handleManualRefresh}
            disabled={isLoading}
            className={styles.refreshButton}
            title="Actualizar historial">
            <RefreshCw
              size={18}
              className={isLoading ? "animate-spin text-blue-600" : ""}
            />
          </button>
        </div>

        <div className={styles.summaryText}>
          {isLoading && !historyData ? (
            <span className="text-blue-600">Cargando datos...</span>
          ) : displayHistory.summary?.hace_dias_ultima_campana != null ? (
            <span>
              Última campaña enviada: hace{" "}
              {displayHistory.summary.hace_dias_ultima_campana} días
            </span>
          ) : (
            <span>No hay información de envíos recientes.</span>
          )}
        </div>

        {/* Lista Principal */}
        <div className={styles.listContainer}>
          {displayHistory.types.map((t) => {
            const isTypeExpanded = expandedType === t.id;
            return (
              <div key={t.id} className={styles.typeItemBorder}>
                <button
                  onClick={() => toggleType(t.id)}
                  className={`${styles.typeButtonBase} ${isTypeExpanded
                    ? styles.typeButtonActive
                    : styles.typeButtonInactive
                    }`}>
                  <div>
                    <div className="flex items-center gap-2">
                      {isTypeExpanded ? (
                        <ChevronDown size={16} className="text-blue-600" />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {t.title}
                      </span>
                    </div>
                    <p className="ml-6 text-sm text-slate-600 dark:text-slate-400">
                      {t.description}
                    </p>
                  </div>
                  {t.last_sent_hace_dias != null && (
                    <span className="text-xs text-slate-500">
                      hace {t.last_sent_hace_dias} días
                    </span>
                  )}
                </button>

                {isTypeExpanded && (
                  <div className={styles.datesContainer}>
                    {t.dates && t.dates.length > 0 ? (
                      <div className="space-y-2">
                        {t.dates.map((d) => {
                          const isDateExpanded =
                            expandedDateByType[t.id] === d.date;

                          return (
                            <div key={d.date} className={styles.dateCard}>
                              <button
                                onClick={() => toggleDate(t.id, d.date)}
                                className={`${styles.dateButtonBase} ${isDateExpanded
                                  ? styles.dateButtonActive
                                  : styles.dateButtonInactive
                                  }`}>
                                <div className="flex items-center gap-2">
                                  {isDateExpanded ? (
                                    <ChevronDown size={14} />
                                  ) : (
                                    <ChevronRight size={14} />
                                  )}
                                  <span className="text-sm text-slate-800 dark:text-slate-200">
                                    {formatHistoryDateForDisplay(d.date)}
                                  </span>
                                </div>
                                <span className="text-xs text-slate-600 dark:text-slate-300">
                                  {d.organizations?.length || 0} orgs
                                </span>
                              </button>

                              {isDateExpanded && (
                                <div className={styles.orgsContainer}>
                                  {(d.organizations || []).length === 0 ? (
                                    <p className="text-sm text-slate-600 dark:text-slate-300">
                                      Sin organizaciones.
                                    </p>
                                  ) : (
                                    <ul className={styles.orgsList}>
                                      {d.organizations.map((o, idx) => {
                                        let orgName = o.name || o.organizacion || o;
                                        if (typeof orgName === 'string' && orgName.trim().toLowerCase() === 'indefinido') {
                                          orgName = o.organizacion || o.nombre || o.id || 'Org';
                                        }

                                        let brevoEvent = o.brevoEvent;
                                        if (!brevoEvent) {
                                          brevoEvent = {
                                            eventType: 'request',
                                            status: 'SENT',
                                            clicks: 0,
                                            opens: 0,
                                            lastEvent: null
                                          };
                                        }

                                        const bajaReason = getBajaReasonText(o.organizacionBaja || o.organizacion_baja);
                                        const isInactive = String(o.suscripcion || o.subscription || "").toLowerCase() === "inactiva";
                                        const resolvedBajaMeta = resolveBajaBrevoMeta(o, brevoEvent);

                                        if ((bajaReason || isInactive) && resolvedBajaMeta) {
                                          brevoEvent = {
                                            ...brevoEvent,
                                            eventType: resolvedBajaMeta.key,
                                            status: resolvedBajaMeta.key === "blocked" ? "BLOCKED" : "BOUNCED",
                                          };
                                        }

                                        const bajaBrevoState = resolvedBajaMeta?.label || ((bajaReason || isInactive) ? "Rebotado definitivo" : null);

                                        return (
                                          <li key={o.id || idx} className="py-2 flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-700 last:border-b-0">
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center gap-2 truncate">
                                                <span className="truncate font-medium">{orgName}</span>
                                                {o.email && (
                                                  <span className="ml-2 text-xs text-slate-500 dark:text-slate-400 font-mono">({o.email})</span>
                                                )}
                                              </div>
                                              <div className="mt-1 flex items-center gap-2">
                                                {brevoEvent && <BrevoEventBadge event={brevoEvent} compact={true} />}
                                                {bajaReason && (
                                                  <span
                                                    className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300"
                                                    title={bajaReason}
                                                  >
                                                    Baja: {bajaReason}{bajaBrevoState ? ` | ${bajaBrevoState}` : ""}
                                                  </span>
                                                )}
                                                {brevoEvent && brevoEvent.clicks > 0 && (
                                                  <span className="text-xs text-indigo-700 dark:text-indigo-300 font-bold">🔗 {brevoEvent.clicks} clics</span>
                                                )}
                                                {brevoEvent && brevoEvent.lastEvent && (
                                                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono" title={brevoEvent.lastEvent}>
                                                    📅 {typeof brevoEvent.lastEvent === 'string'
                                                      ? new Date(brevoEvent.lastEvent).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
                                                      : new Date(brevoEvent.lastEvent * 1000).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}
                                                  </span>
                                                )}
                                              </div>
                                            </div>

                                            {/* Acciones */}
                                            <div className="flex items-center gap-1 text-xs whitespace-nowrap">
                                              {o.user && (
                                                <span className="text-slate-600 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded mr-1">
                                                  {o.user}
                                                </span>
                                              )}

                                              {/* BOTÓN VER EMAIL */}
                                              {o.emailContent && (
                                                <button
                                                  className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors border border-blue-200 dark:border-blue-700"
                                                  title="Ver correo enviado"
                                                  onClick={() => handleFetchAndOpenEmail(o.id, t.templateId, o.emailContent)}
                                                  disabled={isLoadingEmail}
                                                >
                                                  <Eye className="w-4 h-4" />
                                                </button>
                                              )}

                                              <button
                                                className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-200 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors border border-purple-200 dark:border-purple-700"
                                                title="Ver/Editar observación comercial"
                                                onClick={() => handleOpenObservationsModal(o)}
                                              >
                                                <MessageSquare className="w-4 h-4" />
                                              </button>
                                            </div>
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        No hay fechas registradas.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {isObservationsModalOpen && (
        <CommercialObservationsModal
          show={isObservationsModalOpen}
          onClose={() => setIsObservationsModalOpen(false)}
          organization={orgForObservations}
          onSaveSuccess={handleSaveObservationsSuccess}
          setNotification={setNotification}
          setConfirmProps={setConfirmProps}
          closeConfirm={closeConfirm}
        />
      )}

      {/* Modal de Email Content */}
      <EmailContentModal
        show={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        emailData={emailDataForModal}
      />
    </div>
  );
};

// --- ESTILOS ---
const styles = {
  container: "space-y-6 p-6",
  card: "bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5",
  headerTitle: "text-xl font-semibold text-slate-900 dark:text-slate-100",
  refreshButton:
    "p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-blue-600 transition-colors disabled:opacity-50",
  summaryText: "text-sm text-slate-700 dark:text-slate-300 mb-4 h-5",
  listContainer:
    "border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden",
  typeItemBorder:
    "border-b border-slate-200 dark:border-slate-700 last:border-b-0",
  typeButtonBase:
    "w-full flex items-start justify-between text-left p-4 transition-colors duration-200",
  typeButtonActive: "bg-blue-600 text-white dark:bg-blue-500 dark:text-white",
  typeButtonInactive: "hover:bg-blue-100 hover:text-blue-900 dark:hover:bg-blue-800 dark:hover:text-white",
  datesContainer:
    "p-4 pt-0 ml-6 border-l border-slate-200 dark:border-slate-600",
  dateCard:
    "border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden",
  dateButtonBase:
    "w-full flex items-center justify-between px-3 py-2 transition-colors",
  dateButtonActive: "bg-slate-100 dark:bg-slate-700",
  dateButtonInactive: "bg-white dark:bg-slate-800 hover:bg-slate-50",
  orgsContainer: "px-4 pb-3 pt-2 bg-white dark:bg-slate-800",
  orgsList:
    "list-disc list-inside text-sm text-slate-800 dark:text-slate-200 space-y-1",
};

// --- HELPERS ---
function slugify(str) {
  return (str || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function buildFallbackHistory(
  campanasActivas,
  campaignTemplates,
  organizaciones
) {
  // FIX: Helper para extraer el log independientemente del nombre del campo o formato string/object
  const getParsedLog = (org) => {
    let raw = org?.campaignslog || org?.campaigns_log;
    if (!raw) return null;
    const parsed = parseDeepJson(raw, null);
    return parsed && typeof parsed === "object" ? parsed : null;
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
        const titleSlug = slugify(title || "");
        const typedCampaignId = titleSlug
          ? `${templateId}::${titleSlug}`
          : templateId;
        // FIX: Soportar formato de n8n (lastsent en vez de last_sent)
        const lastDate = normalizeDate(info.lastsent || info.last_sent); 

        // FIX: Soportar formato de n8n (sentby en vez de sent_by)
        const user = info.sentby || info.sent_by || info.created_by || info.usuario || info.user || null;
        
        const emailContent = (info.body || info.html || info.content || info.html_content) ? {
            body: info.body || info.html || info.content || info.html_content,
            subject: info.subject
        } : null;

        if (!typeMap.has(typedCampaignId))
          typeMap.set(typedCampaignId, {
            id: typedCampaignId,
            templateId,
            title,
            description,
            dates: new Map(),
          });
        const entry = typeMap.get(typedCampaignId);

        if (lastDate) {
          allDates.push(lastDate);
          if (!entry.dates.has(lastDate)) entry.dates.set(lastDate, []);
          entry.dates.get(lastDate).push({
            name: org.organizacion || org.nombre || org.id || "Org",
            id: org.id,
            user: user,
            timestamp: info.lastsent || info.last_sent,
            brevoEvent: enrichedOrg.brevo_latest_event,
            suscripcion: org.suscripcion,
            organizacionBaja: org.organizacion_baja,
            brevo_data: org.brevo_data,
            marketing_data: org.marketing_data,
            email_events: org.email_events,
            email_stats: org.email_stats,
            messageId: info.messageId,
            emailContent: emailContent 
          });
        }
      });
    });

    const types = Array.from(typeMap.values()).map((t) => ({
      id: t.id,
      templateId: t.templateId,
      title: t.title,
      description: t.description,
      last_sent_at: null,
      last_sent_hace_dias: null,
      dates: Array.from(t.dates.entries())
        .sort((a, b) => getDateSortValue(b[0]) - getDateSortValue(a[0]))
        .map(([date, orgs]) => ({ date, organizations: orgs })),
    }));
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

function normalizeDate(d) {
  const parsed = parseHistoryDate(d);
  if (!parsed) return "";
  const year = parsed.getUTCFullYear();
  const month = String(parsed.getUTCMonth() + 1).padStart(2, "0");
  const day = String(parsed.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseHistoryDate(value) {
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

function getDateSortValue(value) {
  const parsed = parseHistoryDate(value);
  if (!parsed) return 0;
  return parsed.getTime();
}

function formatHistoryDateForDisplay(value) {
  const parsed = parseHistoryDate(value);
  if (!parsed) return value;
  return parsed.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
}

function mergeHistories(primary, fallback) {
  if (!primary) return fallback;
  if (!fallback || !Array.isArray(fallback.types) || fallback.types.length === 0) {
    return primary;
  }

  const normalizeTypeKey = (value) =>
    (value || "")
      .toString()
      .trim()
      .toLowerCase();

  const buildTypeSignature = (typeEntry) => {
    const idPart = normalizeTypeKey(typeEntry.templateId || typeEntry.id);
    const titlePart = normalizeTypeKey(typeEntry.title);
    return `${idPart}::${titlePart}`;
  };

  const existingSignatures = new Set(
    (primary.types || []).map((typeEntry) => buildTypeSignature(typeEntry))
  );

  const missingTypes = (fallback.types || []).filter((typeEntry) => {
    const signature = buildTypeSignature(typeEntry);
    return signature && !existingSignatures.has(signature);
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

function normalizeHistoryForDisplay(history) {
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

function getLastNonFutureDate(dateEntries = []) {
  for (const entry of dateEntries) {
    const rawDate = entry?.date;
    const diffDays = daysSince(rawDate);
    if (Number.isFinite(diffDays) && diffDays >= 0) {
      return rawDate;
    }
  }
  return null;
}

function extractTemplateId(key) {
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

function daysSince(isoOrYMD) {
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

export default CampaignHistory;
