import React, { useState, useEffect } from "react";
import { adjudicatariosAPI } from "../../api/adjudicatariosClient";
import { CheckCircle, AlertCircle, Loader2, Bot, Sparkles, BookOpen } from "lucide-react";
import PromptGuideModal from "./PromptGuideModal";

/* ── Animación Skeleton Loader ── */
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-700/40 rounded-lg ${className}`} />
);

/* ── Estilos base compartidos para los textarea con efecto glassmorphismo ── */
const textareaBase =
  `w-full p-4 rounded-2xl border text-sm leading-relaxed resize-none min-h-[130px] outline-none
  transition-all duration-300 ease-out
  bg-slate-800/60 backdrop-blur-sm
  border-slate-700/60 text-slate-200 placeholder-slate-600
  focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20 focus:bg-slate-800/90
  hover:border-slate-600/80`;

const PromptAdjudicatariosForm = ({ setNotification }) => {
  const [promptData, setPromptData] = useState({ id: null, system_prompt: "", user_prompt: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    loadPrompt();
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (showGuide) {
      document.body.classList.add('prompt-guide-open');
    } else {
      document.body.classList.remove('prompt-guide-open');
    }
    return () => document.body.classList.remove('prompt-guide-open');
  }, [showGuide]);

  const loadPrompt = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adjudicatariosAPI.getPrompt();
      if (data) {
        setPromptData({ id: data.id, system_prompt: data.system_prompt || "", user_prompt: data.user_prompt || "" });
      } else {
        setError("Prompt base no encontrado para Adjudicatarios en la BD.");
      }
    } catch (err) {
      console.error("Error al cargar prompt:", err);
      setError("Error de conexión al cargar el prompt.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!promptData.id) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await adjudicatariosAPI.updatePrompt(promptData.id, promptData.system_prompt, promptData.user_prompt);
      setSuccess(true);
      if (setNotification) setNotification({ type: "success", message: "Prompt guardado correctamente." });
      setTimeout(() => setSuccess(false), 3500);
    } catch (err) {
      console.error("Error al guardar:", err);
      setError("Error al guardar el prompt.");
      if (setNotification) setNotification({ type: "error", message: "Error al guardar el prompt." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={`
        relative flex flex-col gap-6 p-7
        bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900
        overflow-hidden
        transition-all duration-500 ease-out
        ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
      `}
    >
      {/* Fondo decorativo con gradiente sutil */}
      <div
        className="pointer-events-none absolute top-0 left-0 w-full h-1"
        style={{ background: "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)" }}
      />
      <div
        className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-5 blur-3xl"
        style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="flex-shrink-0 p-2.5 rounded-xl bg-blue-500/15 border border-blue-500/25">
            <Bot size={20} className="text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
              Configurar Prompt de IA
              <Sparkles size={14} className="text-blue-400 animate-pulse" />
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Instrucciones exclusivas para la redacción de correos a adjudicatarios.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowGuide(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600/20 to-violet-600/20 hover:from-blue-600/30 hover:to-violet-600/30 text-blue-300 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-200 active:scale-95 flex-shrink-0 animate-pulse hover:animate-none"
          title="Ver guía de mejores prácticas"
        >
          <BookOpen size={14} />
          <span className="whitespace-nowrap">Prompt Engineering</span>
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-900/30 border border-red-700/50 text-red-300 text-sm animate-fadeIn">
          <AlertCircle size={15} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Success banner */}
      {success && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-900/30 border border-emerald-700/50 text-emerald-300 text-sm">
          <CheckCircle size={15} className="flex-shrink-0" />
          Prompt guardado correctamente.
        </div>
      )}

      {/* Fields */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-32" />
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-32" />
        </div>
      ) : promptData.id ? (
        <div className="space-y-5">
          {/* System Prompt */}
          <div className="group">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2.5 transition-colors duration-200 group-focus-within:text-blue-400">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500" />
              System Prompt
            </label>
            <textarea
              className={textareaBase}
              value={promptData.system_prompt}
              onChange={(e) => setPromptData({ ...promptData, system_prompt: e.target.value })}
              placeholder="Ej: Eres un asistente experto en ventas corporativas..."
              rows={5}
            />
          </div>

          {/* User Prompt */}
          <div className="group">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2.5 transition-colors duration-200 group-focus-within:text-violet-400">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-violet-500" />
              User Prompt
            </label>
            <textarea
              className={`${textareaBase} focus:border-violet-500/70 focus:ring-violet-500/20`}
              value={promptData.user_prompt}
              onChange={(e) => setPromptData({ ...promptData, user_prompt: e.target.value })}
              placeholder="Ej: Redacta un correo para {{organizationName}}..."
              rows={5}
            />
            <p className="mt-1.5 text-xs text-slate-600">
              Puedes usar variables como <code className="font-mono text-blue-400 bg-slate-800 px-1 py-0.5 rounded">{"{{organizationName}}"}</code>
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-800" />

          {/* Save button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving || !promptData.id}
              className={`
                relative overflow-hidden group flex items-center gap-2.5
                px-6 py-2.5 rounded-xl font-semibold text-sm text-white
                transition-all duration-200 ease-out
                focus:outline-none focus:ring-2 focus:ring-blue-500/40
                disabled:opacity-40 disabled:cursor-not-allowed
                ${saving
                  ? "bg-blue-700 cursor-wait"
                  : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 active:scale-[0.97] shadow-[0_0_20px_rgba(59,130,246,0.35)] hover:shadow-[0_0_28px_rgba(59,130,246,0.55)]"
                }
              `}
            >
              {/* Shimmer overlay on hover */}
              <span
                className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)" }}
              />
              {saving ? (
                <Loader2 size={15} className="animate-spin" />
              ) : success ? (
                <CheckCircle size={15} className="text-emerald-300" />
              ) : null}
              {saving ? "Guardando…" : "Guardar Cambios"}
            </button>
          </div>
        </div>
      ) : null}

      {/* Modal de Guía */}
      <PromptGuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
    </div>
  );
};

export default PromptAdjudicatariosForm;
