import React, { useState, useEffect } from "react";
import {
  Search,
  Calendar,
  ExternalLink,
  Mail,
  AlertCircle,
  Clock,
  RefreshCw,
  Zap,
  Brain,
  SendHorizonal,
  CheckSquare,
  Square,
  LayoutGrid,
  List as ListIcon,
  ChevronDown,
  ChevronUp,
  Target,
  Users,
  FileText,
  Activity
} from "lucide-react";
import { useAdjudicatarios } from "../../hooks/useAdjudicatarios";
import { Modal } from "../common/ui";
import { useAppState } from "../../hooks/useAppState";
import { isRecentlyContacted, getLastMailContactDetails, formatDate } from "../../utils/organizationUtils";
import PromptAdjudicatariosForm from "./PromptAdjudicatariosForm";
import TutorialGuide, { TutorialGuideButton } from "./TutorialGuide";

const TUTORIAL_STEPS = [
  {
    targetId: "guide-header",
    title: "Bienvenido al Módulo Adjudicatarios",
    content: "Este panel conecta visualmente con tus flujos de n8n.\n\nAl cargar esta página, el sistema llama al Flujo D (API Lectura MailDash CRM) para leer y mostrar todas las licitaciones recientes directamente desde Supabase."
  },
  {
    targetId: "guide-stats",
    title: "Métricas de Extracción",
    content: "Aquí puedes ver el volumen de datos de las últimas 24 horas y el rendimiento del scraper de emails.\n\nEs útil para detectar si hay muchas empresas 'Pendientes', lo que indicaría que el sistema necesita procesar nuevos contactos."
  },
  {
    targetId: "guide-sync",
    title: "Sincronizar (Buscar Nuevas)",
    content: "Inicia el ciclo completo de ingesta.\n\nDispara el Flujo A (Adjudicaciones recientes on-demand) que extrae datos de Equal Tenders, y el Sub-Flujo B que invoca al Microservicio Scraper Python para localizar los emails de las nuevas empresas."
  },
  {
    targetId: "guide-prompt",
    title: "Configurar el Cerebro de la IA",
    content: "Este botón abre el editor del Prompt de Adjudicatarios.\n\nAquí le dices al Agente de IA el tono y el objetivo de la campaña. n8n (Flujo C) usará estas instrucciones para redactar correos únicos y personalizados para cada empresa."
  },
  {
    targetId: "guide-reprocess",
    title: "Reprocesar Pendientes",
    content: "Si el proceso automático no encontró el email por errores transitorios, este botón reinicia el Flujo de Extracción para todas las licitaciones marcadas como 'Sin email' o 'Error'."
  },
  {
    targetId: "guide-table",
    title: "Gestión de Empresas",
    content: "La tabla principal muestra los resultados. Fíjate en el Status.\n\nPara poder enviar una 'Campaña' (Flujo E), la empresa debe tener el estado verde 'Email OK', solo entonces podrás seleccionar su casilla para el envío."
  },
  {
    targetId: "guide-edit",
    title: "Edición Manual Infalible",
    content: "Si el scraper no encuentra el email pero tú lo conoces, usa el icono del lápiz.\n\nAl guardar, el frontend llama al Flujo F (Webhook n8n) para persistir el dato permanentemente en Supabase y validar la fila."
  }
];

const STATUS_CONFIG = {
  FOUND_EMAIL: {
    label: "Email OK",
    dot: "bg-emerald-500",
    pill: "text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#1e293b] ring-1 ring-slate-200 dark:ring-slate-700/80 rounded-full",
    glow: "",
  },
  NO_EMAIL: {
    label: "Sin email",
    dot: "bg-amber-500",
    pill: "text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#1e293b] ring-1 ring-slate-200 dark:ring-slate-700/80 rounded-full",
    glow: "",
  },
  ERROR_TRANSIENT: {
    label: "Error",
    dot: "bg-red-500",
    pill: "text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#1e293b] ring-1 ring-slate-200 dark:ring-slate-700/80 rounded-full",
    glow: "",
  },
  PENDING: {
    label: "Pendiente",
    dot: "bg-slate-400",
    pill: "text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#1e293b] ring-1 ring-slate-200 dark:ring-slate-700/80 rounded-full",
    glow: "",
  },
  SENT: {
    label: "Enviado",
    dot: "bg-blue-500",
    pill: "text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#1e293b] ring-1 ring-slate-200 dark:ring-slate-700/80 rounded-full",
    glow: "",
  },
};

const MetricaCompacta = ({ icon: Icon, label, value, colorClass }) => (
  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all duration-200">
    <div className={`p-2 rounded-lg ${colorClass}`}>
      <Icon size={16} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{label}</p>
      <p className="text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">{value}</p>
    </div>
  </div>
);

const EmailAdjudicatariosView = ({ isAuthenticated, setNotification }) => {
  const {
    adjudicaciones,
    isLoading,
    error,
    refresh,
    retryExtraction,
    reprocess,
    isReprocessing,
    useTest,
    setUseTest
  } = useAdjudicatarios(isAuthenticated, setNotification);

  const [searchTerm, setSearchTerm] = useState("");
  const [retryingId, setRetryingId] = useState(null);
  const [showPromptsModal, setShowPromptsModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isSendingCampaign, setIsSendingCampaign] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState("list");
  const [filtroFecha, setFiltroFecha] = useState("all");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);
  const [mostrarMetricasAvanzadas, setMostrarMetricasAvanzadas] = useState(false);
  
  // Nuevos estados para filtros dinámicos n8n
  const [filterTipos, setFilterTipos] = useState([]);
  const [filterUbicacion, setFilterUbicacion] = useState(["Canarias"]); // Default a Canarias como solicitó el usuario
  const [filterFiltrosUnicos, setFilterFiltrosUnicos] = useState("");

  // Selector de Remitente (del remoto)
  const { senders } = useAppState();
  const [selectedSenderId, setSelectedSenderId] = useState("");

  // Inicializar el sender seleccionado cuando se cargan los senders
  useEffect(() => {
    if (senders.length > 0 && !selectedSenderId) {
      const defaultSender = senders.find(s => s.email === "ac.analytics@mmi-e.com") || senders[0];
      setSelectedSenderId(defaultSender.id);
    }
  }, [senders, selectedSenderId]);

  // Helper para normalizar los parámetros de sincronización (Fechas dinámicas)
  const getSyncParams = React.useCallback(() => {
    let finalInicio = fechaInicio;
    let finalFin = fechaFin;
    const now = new Date();
    
    // Función para obtener YYYY-MM-DD en hora LOCAL (evita desfases de UTC)
    const formatDateLocal = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (filtroFecha === "today") {
      finalInicio = formatDateLocal(now);
      finalFin = formatDateLocal(now);
    } else if (filtroFecha === "yesterday") {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      finalInicio = formatDateLocal(yesterday);
      finalFin = formatDateLocal(yesterday);
    } else if (filtroFecha === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      finalInicio = formatDateLocal(weekAgo);
      finalFin = formatDateLocal(now);
    } else if (filtroFecha === "all") {
      finalInicio = null;
      finalFin = null;
    }

    return {
      periodo: filtroFecha,
      fechaInicio: finalInicio,
      fechaFin: finalFin,
      tipos: filterTipos,
      ubicacion: filterUbicacion,
      filtrosUnicos: filterFiltrosUnicos
    };
  }, [fechaInicio, fechaFin, filtroFecha, filterTipos, filterUbicacion, filterFiltrosUnicos]);

  const handleManualRefresh = React.useCallback(() => {
    refresh(getSyncParams());
  }, [refresh, getSyncParams]);

  // Carga inicial automática usando los filtros por defecto (ej: Canarias)
  // Solo se dispara una vez al montar o cuando cambia el estado de autenticación
  useEffect(() => {
    if (isAuthenticated) {
      handleManualRefresh();
    }
  }, [isAuthenticated, handleManualRefresh]);

  // IDs con email disponible y NO contactadas recientemente (con sender awareness)
  const withEmailAndNotContacted = adjudicaciones.filter((a) => {
    const hasEmail = a.email && a.email !== "-";
    const contacted = isRecentlyContacted(a, selectedSenderId);
    return hasEmail && !contacted;
  });

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === withEmailAndNotContacted.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(withEmailAndNotContacted.map((a) => a.id)));
    }
  };

  const handleSendCampaign = async () => {
    if (selectedIds.size === 0 || !selectedSenderId) return;
    setIsSendingCampaign(true);
    try {
      const { adjudicatariosAPI } = await import("../../api/adjudicatariosClient");
      await adjudicatariosAPI.triggerCampaign([...selectedIds], selectedSenderId);
      setSelectedIds(new Set());
      setShowCampaignModal(false);
    } catch (err) {
      console.error("Error al disparar campaña:", err);
    } finally {
      setIsSendingCampaign(false);
    }
  };



  const filteredData = adjudicaciones.filter((item) => {
    const matchesSearch =
      (item.empresa || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.licitacion || "").toLowerCase().includes(searchTerm.toLowerCase());

    const hasEmail = item.email && item.email !== "-" && item.email !== null;
    let matchesFilter = true;
    if (filterType === "withEmail") matchesFilter = !!hasEmail;
    if (filterType === "withoutEmail") matchesFilter = !hasEmail;

    return matchesSearch && matchesFilter;
  });

  const groupedData = React.useMemo(() => {
    const groups = {};
    filteredData.forEach((item) => {
      const name = item.empresa || "Sin nombre";
      if (!groups[name]) {
        groups[name] = {
          name,
          uniqueTitles: new Set(),
          found: 0,
          missing: 0,
          items: [],
          nif: item.nif,
          lastDate: item.fecha,
          email: null
        };
      }
      
      const hasEmail = item.email && item.email !== "-" && item.email !== null;
      if (hasEmail && !groups[name].email) groups[name].email = item.email;
      if (item.licitacion && !groups[name].uniqueTitles.has(item.licitacion)) {
        groups[name].uniqueTitles.add(item.licitacion);
        groups[name].items.push(item);
      }
      if (hasEmail) groups[name].found++; else groups[name].missing++;
    });
    return Object.values(groups).sort((a, b) => b.uniqueTitles.size - a.uniqueTitles.size);
  }, [filteredData]);

  const stats = {
    total: adjudicaciones.length,
    found: adjudicaciones.filter((item) => item.email && item.email !== "-" && item.email !== null).length,
    missing: adjudicaciones.filter((item) => !(item.email && item.email !== "-" && item.email !== null)).length,
    empresasUnicas: new Set(adjudicaciones.map(a => a.empresa)).size,
    licitacionesUnicas: new Set(adjudicaciones.map(a => a.licitacion)).size,
    tasaExito: adjudicaciones.length > 0 
      ? Math.round((adjudicaciones.filter((item) => item.email && item.email !== "-" && item.email !== null).length / adjudicaciones.length) * 100) 
      : 0,
    enviados: adjudicaciones.filter((item) => item.status === "SENT").length,
  };

  const handleRetry = async (id) => {
    setRetryingId(id);
    await retryExtraction(id);
    setRetryingId(null);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
      {/* ── Header glassmorphism ── */}
      <div className="px-6 pt-6 pb-4">
        <div
          className="relative rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-700/50 shadow-md"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(241,245,249,0.85) 100%)",
          }}
        >
          <div className="dark:hidden absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(241,245,249,0.9) 100%)" }} />
          <div className="hidden dark:block absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.9) 100%)", backdropFilter: "blur(12px)" }} />
          
          <div id="guide-header" className="relative z-10 p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">Email Adjudicatarios</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Monitoreo de adjudicaciones recientes · Microservicio de extracción</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              {/* Selector de Remitentes */}
              <div className="flex items-center gap-2 mr-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Remitente:</span>
                <select
                  value={selectedSenderId}
                  onChange={(e) => setSelectedSenderId(e.target.value)}
                  className="pl-3 pr-8 py-1.5 text-sm font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-sm focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                >
                  {!senders?.length ? (
                    <option value="">Cargando remitentes...</option>
                  ) : (
                    senders.map(s => (
                      <option key={s.id} value={s.id}>{s.displayName} ({s.email})</option>
                    ))
                  )}
                </select>
              </div>

              {/* Lanzar Campaña */}
              {selectedIds.size > 0 && (
                <button
                  onClick={() => setShowCampaignModal(true)}
                  className="group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg transition-all duration-200 active:scale-95"
                >
                  <SendHorizonal size={15} />
                  Lanzar Campaña ({selectedIds.size})
                </button>
              )}

              <TutorialGuideButton onClick={() => setIsTutorialOpen(true)} />
              
              <button
                id="guide-reprocess"
                onClick={() => reprocess(getSyncParams())}
                disabled={isReprocessing || stats.missing === 0}
                className="group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md transition-all duration-200 disabled:opacity-30"
              >
                <Zap size={15} className={`${isReprocessing ? "animate-pulse text-amber-400" : ""}`} />
                {isReprocessing ? "Reprocesando…" : "Reprocesar Pendientes"}
              </button>

              <button
                id="guide-prompt"
                onClick={() => setShowPromptsModal(true)}
                className="group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm hover:text-indigo-600 transition-all duration-300"
              >
                <Brain size={15} className="group-hover:scale-110" />
                Prompt IA
              </button>

              <button
                onClick={() => setUseTest(!useTest)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-200 ${useTest ? "bg-amber-500/10 border-amber-500/50 text-amber-600 shadow-sm" : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600"}`}
              >
                <div className={`w-2 h-2 rounded-full ${useTest ? "bg-amber-500 animate-pulse" : "bg-slate-400"}`} />
                {useTest ? "Modo Test Activo" : "Usar Webhook Test"}
              </button>

              <button
                id="guide-sync"
                onClick={handleManualRefresh}
                disabled={isLoading}
                className="group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                <RefreshCw size={15} className={isLoading ? "animate-spin" : "group-hover:rotate-180 duration-500"} />
                {isLoading ? "Sincronizando…" : "Sincronizar"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="px-6 mb-2">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 text-xs">
            <AlertCircle size={14} />
            <span className="flex-1 font-medium">Sin conexión: {error}</span>
            <button onClick={refresh} className="px-2.5 py-1 rounded-lg bg-red-100 font-semibold">Reintentar</button>
          </div>
        </div>
      )}

      {/* ── Métricas ── */}
      <div id="guide-stats" className="px-6 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <MetricaCompacta icon={Clock} label="Últimas 24h" value={stats.total} colorClass="bg-blue-50 dark:bg-blue-900/30 text-blue-600" />
          <MetricaCompacta icon={Mail} label="Emails OK" value={stats.found} colorClass="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600" />
          <MetricaCompacta icon={AlertCircle} label="Pendientes" value={stats.missing} colorClass="bg-amber-50 dark:bg-amber-900/30 text-amber-600" />
          <MetricaCompacta icon={Target} label="Tasa Éxito" value={`${stats.tasaExito}%`} colorClass="bg-purple-50 dark:bg-purple-900/30 text-purple-600" />
        </div>
        <button
          onClick={() => setMostrarMetricasAvanzadas(!mostrarMetricasAvanzadas)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800/50 text-slate-600 hover:bg-slate-200 transition-all border border-slate-200 dark:border-slate-700"
        >
          {mostrarMetricasAvanzadas ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {mostrarMetricasAvanzadas ? "Ocultar métricas avanzadas" : "Ver métricas avanzadas"}
        </button>
        {mostrarMetricasAvanzadas && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 animate-fadeIn">
            <MetricaCompacta icon={Users} label="Empresas únicas" value={stats.empresasUnicas} colorClass="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600" />
            <MetricaCompacta icon={FileText} label="Licitaciones únicas" value={stats.licitacionesUnicas} colorClass="bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600" />
            <MetricaCompacta icon={SendHorizonal} label="Enviados" value={stats.enviados} colorClass="bg-teal-50 dark:bg-teal-900/30 text-teal-600" />
            <MetricaCompacta icon={Activity} label="Promedio/Empresa" value={(stats.total / Math.max(stats.empresasUnicas, 1)).toFixed(1)} colorClass="bg-rose-50 dark:bg-rose-900/30 text-rose-600" />
          </div>
        )}
      </div>

      {/* ── Búsqueda y Filtros ── */}
      <div className="px-6 pb-4 flex flex-col gap-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 h-fit">
            <button onClick={() => setViewMode("list")} className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all ${viewMode === "list" ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-500"}`}><ListIcon size={14} />Lista</button>
            <button onClick={() => setViewMode("grouped")} className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all ${viewMode === "grouped" ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-500"}`}><LayoutGrid size={14} />Agrupar</button>
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Buscar empresa o licitación…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500/50 transition-all" />
          </div>
          <button onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200 transition-all border border-slate-200 dark:border-slate-700">
            {mostrarFiltrosAvanzados ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            Filtros
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {[{ id: "all", label: "Todos", count: adjudicaciones.length }, { id: "withEmail", label: "Con Email", count: stats.found }, { id: "withoutEmail", label: "Sin Email", count: stats.missing }].map((tab) => (
            <button key={tab.id} onClick={() => setFilterType(tab.id)} className={`px-4 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all ${filterType === tab.id ? "bg-blue-600 text-white shadow-sm" : "bg-slate-200 dark:bg-slate-800 text-slate-600 hover:bg-slate-300"}`}>
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${filterType === tab.id ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-700"}`}>{tab.count}</span>
            </button>
          ))}
        </div>

        {mostrarFiltrosAvanzados && (
          <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 animate-fadeIn">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600"><Calendar size={14} /><span>Fecha de adjudicación</span></div>
              <div className="flex flex-wrap gap-2">
                {[{ id: "all", label: "Todas" }, { id: "today", label: "Hoy" }, { id: "yesterday", label: "Ayer" }, { id: "week", label: "Última semana" }, { id: "custom", label: "Personalizada" }].map(opcion => (
                  <button key={opcion.id} onClick={() => { setFiltroFecha(opcion.id); if (opcion.id !== "custom") { setFechaInicio(""); setFechaFin(""); } }} className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${filtroFecha === opcion.id ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-slate-800 text-slate-600 border-slate-200"}`}>{opcion.label}</button>
                ))}
              </div>
              {filtroFecha === "custom" && (
                <div className="flex items-center gap-2 pt-2">
                  <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-300 text-slate-700" />
                  <span className="text-slate-400">→</span>
                  <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-300 text-slate-700" />
                </div>
              )}
            </div>

            {/* Nuevos Filtros Dinámicos n8n (Locales) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-200 dark:border-slate-700">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600"><FileText size={14} /><span>Tipo de Licitación</span></div>
                <select multiple value={filterTipos} onChange={(e) => setFilterTipos(Array.from(e.target.selectedOptions, option => option.value))} className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-300 text-slate-700 h-24">
                  <option value="Obras">Obras</option>
                  <option value="Servicios">Servicios</option>
                  <option value="Suministros">Suministros</option>
                  <option value="Concesión de obras">Concesión de obras</option>
                  <option value="Concesión de servicios">Concesión de servicios</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600"><Target size={14} /><span>Ubicación</span></div>
                <div className="flex flex-wrap gap-2">
                  {["Canarias", "Madrid", "Barcelona", "Nacional"].map(loc => (
                    <button key={loc} onClick={() => setFilterUbicacion(prev => prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc])} className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${filterUbicacion.includes(loc) ? "bg-indigo-600 text-white border-indigo-600" : "bg-white dark:bg-slate-800 text-slate-600 border-slate-200"}`}>{loc}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600"><Search size={14} /><span>Keywords (Filtros Únicos)</span></div>
                <input type="text" placeholder="Ej: software, limpieza..." value={filterFiltrosUnicos} onChange={(e) => setFilterFiltrosUnicos(e.target.value)} className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-300 text-slate-700 shadow-sm" />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/80 flex justify-end">
              <button
                onClick={handleManualRefresh}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                Sincronizar con n8n
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Tabla ── */}
      <div id="guide-table" className="flex-1 px-6 pb-6 overflow-hidden flex flex-col">
        <div className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-sm flex flex-col bg-white dark:bg-[#0f172a]">
          <div className="overflow-auto flex-1">
            <table className="w-full text-left table-fixed border-collapse">
              <thead>
                <tr className="dark:bg-[#1e293b] border-b border-slate-200 dark:border-slate-800/80">
                  {viewMode === "list" ? (
                    <>
                      <th className="pl-4 pr-2 py-4" style={{ width: "5%" }}>
                        <button onClick={toggleSelectAll} disabled={withEmailAndNotContacted.length === 0} className={`flex items-center justify-center w-full ${withEmailAndNotContacted.length === 0 ? "text-slate-200 cursor-not-allowed" : "text-slate-400"}`}>
                          {selectedIds.size > 0 && selectedIds.size === withEmailAndNotContacted.length ? <CheckSquare size={15} className="text-blue-500" /> : <Square size={15} />}
                        </button>
                      </th>
                      <th className="px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest" style={{ width: "25%" }}>Organización</th>
                      <th className="px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest" style={{ width: "40%" }}>Contacto / Licitación</th>
                      <th className="px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest" style={{ width: "12%" }}>Contacto Marketing</th>
                      <th className="px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest" style={{ width: "13%" }}>Email</th>
                      <th className="py-4" style={{ width: "5%" }} />
                    </>
                  ) : (
                    <>
                      <th className="pl-4 pr-2 py-4" style={{ width: "5%" }}><div className="flex items-center justify-center"><Square size={15} className="text-slate-300" /></div></th>
                      <th className="px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest" style={{ width: "18%" }}>Organización</th>
                      <th className="px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest" style={{ width: "47%" }}>Licitaciones Únicas</th>
                      <th className="px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest" style={{ width: "30%" }}>Contacto Marketing</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {isLoading && filteredData.length === 0 ? (
                  <tr><td colSpan={viewMode === "list" ? "6" : "4"} className="px-5 py-16 text-center text-slate-400"><RefreshCw className="animate-spin mx-auto mb-2" />Cargando adjudicaciones…</td></tr>
                ) : filteredData.length === 0 ? (
                  <tr><td colSpan={viewMode === "list" ? "6" : "4"} className="px-5 py-16 text-center text-slate-400"><p className="text-sm">Sin resultados</p></td></tr>
                ) : viewMode === "list" ? (
                  filteredData.map((item) => {
                    const hasEmail = item.email && item.email !== "-" && item.email !== null;
                    const isSelected = selectedIds.has(item.id);
                    const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG["NO_EMAIL"];
                    const contactedRecently = isRecentlyContacted(item, selectedSenderId);
                    const lastContactDetails = contactedRecently ? getLastMailContactDetails(item, selectedSenderId) : null;
                    const isSelectable = hasEmail && !contactedRecently;

                    return (
                      <tr key={item.id} className={`group transition-all ${isSelected ? "bg-blue-50/70 dark:bg-blue-900/10" : contactedRecently ? "bg-slate-50/50 opacity-70" : "hover:bg-slate-50 dark:hover:bg-[#1e293b]/40"}`}>
                        <td className={`pl-4 pr-2 py-4 ${isSelectable ? "cursor-pointer" : "cursor-not-allowed"}`} onClick={() => isSelectable && toggleSelect(item.id)}>
                          <div className="flex items-center justify-center">
                            {hasEmail ? (contactedRecently ? <Square size={15} className="text-slate-200" /> : isSelected ? <CheckSquare size={15} className="text-blue-500" /> : <Square size={15} className="text-slate-400 hover:text-blue-400" />) : <Square size={15} className="text-slate-200" />}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-[13px] text-slate-900 dark:text-slate-100 truncate" title={item.empresa}>{item.empresa}</p>
                            {contactedRecently && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold whitespace-nowrap" title={`Último envío: ${formatDate(lastContactDetails?.date)} (${lastContactDetails?.campaignTitle || 'Campaña'})`}>7 DÍAS</span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium tracking-tight mt-0.5">{item.nif || "NIF no disponible"}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-[12px] font-medium text-slate-700 dark:text-slate-300 line-clamp-2 leading-snug mb-1" title={item.licitacion}>{item.licitacion}</p>
                          <div className="flex items-center gap-2">
                            {item.url_licitacion && <a href={item.url_licitacion} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-500 hover:text-blue-600 transition-colors bg-blue-50 dark:bg-blue-900/40 px-1.5 py-0.5 rounded uppercase tracking-wider">Ver Licitación <ExternalLink size={10} /></a>}
                            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase tracking-wider">{item.fecha ? formatDate(item.fecha) : "-"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex flex-col items-center gap-1.5 grayscale opacity-50"><Users size={16} className="text-slate-400" /><p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">No disp.</p></div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2 mr-4">
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tighter">{cfg.label}</span>
                            </div>
                            {item.email && item.email !== "-" && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate max-w-[120px]" title={item.email}>{item.email}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="pr-4 py-4 text-right">
                          <button onClick={() => handleRetry(item.id)} disabled={retryingId === item.id} className={`p-2 rounded-lg transition-all ${retryingId === item.id ? "bg-blue-100 text-blue-600 animate-spin" : "hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-300 hover:text-blue-500"}`} title="Actualizar esta fila"><RefreshCw size={15} /></button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  groupedData.map((group) => {
                    
                    return (
                      <tr key={group.name} className="hover:bg-slate-50 dark:hover:bg-[#1e293b]/40">
                        <td className="pl-4 pr-2 py-4 text-center"><div className="w-5 h-5 rounded-lg border-2 border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-300">{group.uniqueTitles.size}</div></td>
                        <td className="px-4 py-4"><p className="font-semibold text-xs text-slate-900 dark:text-slate-100" title={group.name}>{group.name}</p><p className="text-[10px] text-slate-400 font-medium mt-0.5">{group.nif || "-"}</p></td>
                        <td className="px-4 py-4">
                          <div className="space-y-2">
                            {group.items.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="flex flex-col gap-0.5">
                                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1">{item.licitacion}</p>
                                <div className="flex items-center gap-2">
                                  {item.email && item.email !== "-" ? <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-1 rounded uppercase tracking-tighter">Email OK</span> : <span className="text-[9px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-1 rounded uppercase tracking-tighter">Sin Email</span>}
                                  <span className="text-[9px] text-slate-400">{formatDate(item.fecha)}</span>
                                </div>
                              </div>
                            ))}
                            {group.uniqueTitles.size > 3 && <p className="text-[10px] font-bold text-blue-500 italic">+ {group.uniqueTitles.size - 3} licitaciones más...</p>}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center opacity-30"><Users className="mx-auto" /></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal open={showCampaignModal} onOpenChange={setShowCampaignModal} title="Lanzar Campaña Automática" size="lg">
        <div className="p-6">
          <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30"><SendHorizonal className="text-white" size={24} /></div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">Campaña para {selectedIds.size} empresas</h3>
                <p className="text-blue-700 dark:text-blue-300 text-sm mt-1 leading-relaxed">Se disparará el **Flujo E (Campaña Mailing)** de n8n. Cada empresa recibirá un correo único basado en el Prompt de IA configurado.</p>
              </div>
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Remitente Confirmado:</label>
            <select value={selectedSenderId} onChange={(e) => setSelectedSenderId(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 text-slate-900 font-semibold shadow-sm focus:ring-2 focus:ring-blue-500/50 transition-all">
              {senders.map(s => <option key={s.id} value={s.id}>{s.displayName} ({s.email})</option>)}
            </select>
            <p className="text-xs text-slate-500 mt-2 italic px-1">Este email aparecerá como el remitente de todas las campañas enviadas en este lote.</p>
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
            <button onClick={() => setShowCampaignModal(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors">Cancelar</button>
            <button onClick={handleSendCampaign} disabled={isSendingCampaign} className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50">{isSendingCampaign ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />}Confirmar y Enviar</button>
          </div>
        </div>
      </Modal>

      <Modal open={showPromptsModal} onOpenChange={setShowPromptsModal}>
        <PromptAdjudicatariosForm setNotification={setNotification} />
      </Modal>

      <TutorialGuide show={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} steps={TUTORIAL_STEPS} />
    </div>
  );
};

export default EmailAdjudicatariosView;
