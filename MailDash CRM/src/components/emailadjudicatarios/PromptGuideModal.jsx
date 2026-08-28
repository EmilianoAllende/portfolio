import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, BookOpen, Copy, Check, Lightbulb, FileText, Zap, Maximize2, Minimize2 } from "lucide-react";

const PromptGuideModal = ({ isOpen, onClose }) => {
  const [copiedTemplate, setCopiedTemplate] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const copyTemplate = (template, id) => {
    navigator.clipboard.writeText(template);
    setCopiedTemplate(id);
    setTimeout(() => setCopiedTemplate(null), 2000);
  };

  const templates = {
    adjudicatarios: {
      title: "Plantilla: Email a Adjudicatarios",
      system: `Eres un agente experto en desarrollo de negocio B2B especializado en licitaciones públicas.

OBJETIVO: Redactar emails personalizados para empresas adjudicatarias de licitaciones recientes.

CRITERIOS DE ÉXITO:
- Email profesional y conciso (máximo 150 palabras)
- Tono consultivo, no comercial agresivo
- Menciona la licitación específica ganada
- Propuesta de valor clara y relevante

RESTRICCIONES:
- No usar lenguaje genérico o plantillas obvias
- No hacer promesas imposibles de cumplir
- Si falta información clave, marcar como [REQUIERE_REVISIÓN]`,
      user: `Redacta un email para {{organizationName}} que ganó la licitación: "{{tenderTitle}}".

CONTEXTO:
- Empresa: {{organizationName}}
- NIF: {{nif}}
- Licitación ganada: {{tenderTitle}}
- Fecha adjudicación: {{awardDate}}

FORMATO DE SALIDA:
{
  "subject": "Asunto del email (máx 60 caracteres)",
  "body": "Cuerpo del email en párrafos",
  "call_to_action": "Llamada a la acción específica",
  "confidence": "alta|media|baja"
}

VERIFICACIÓN:
☐ Email menciona la licitación específica
☐ Propuesta de valor es clara y relevante
☐ Tono es profesional y consultivo
☐ Longitud no excede 150 palabras`
    },
    general: {
      title: "Plantilla: Estructura General",
      system: `Eres un {{rol_especifico}}.

OBJETIVO: {{objetivo_en_una_linea}}

CRITERIOS DE ÉXITO:
- {{criterio_1}}
- {{criterio_2}}
- {{criterio_3}}

RESTRICCIONES:
- {{restriccion_1}}
- {{restriccion_2}}
- Cuando no estés seguro: {{regla_incertidumbre}}`,
      user: `## INSTRUCCIONES
{{que_debe_hacer}}

## INPUTS
{{datos_o_contexto}}

## RESTRICCIONES
{{alcance_y_exclusiones}}

## FORMATO DE SALIDA
{{estructura_esperada}}

## VERIFICACIÓN
☐ {{check_1}}
☐ {{check_2}}
☐ {{check_3}}`
    }
  };

  const bestPractices = [
    {
      icon: Lightbulb,
      title: "Define Criterios de Éxito",
      description: "No pidas resultados 'buenos'. Especifica qué significa 'hecho' con criterios medibles.",
      example: "✓ 'Incluye solo hechos del documento'\n✗ 'Sé preciso'"
    },
    {
      icon: FileText,
      title: "Usa Contrato de Salida",
      description: "Define formato, longitud, tono y secciones requeridas. Hazlo testeable.",
      example: "Formato JSON, máx 150 palabras, tono profesional"
    },
    {
      icon: Zap,
      title: "Separa Instrucciones de Inputs",
      description: "Usa bloques etiquetados: INSTRUCCIONES, INPUTS, RESTRICCIONES, FORMATO.",
      example: "Estructura de 4 bloques mejora procesamiento"
    },
    {
      icon: BookOpen,
      title: "Ejemplos > Adjetivos",
      description: "Un ejemplo de salida vale más que 'sé conciso y profesional'.",
      example: "Muestra 1-3 ejemplos cuando el formato importa"
    }
  ];

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backdropFilter: "blur(8px)", background: "rgba(0,0,0,0.7)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`${isFullscreen ? 'w-full h-full' : 'w-full max-w-6xl h-[95vh] m-4'} overflow-hidden ${isFullscreen ? 'rounded-none' : 'rounded-2xl'} shadow-2xl ring-1 ring-white/10 flex flex-col bg-slate-900 transition-all duration-300`}>
        {/* Header */}
        <div className="relative flex-shrink-0">
          <div
            className="h-1 w-full"
            style={{ background: "linear-gradient(90deg,#3b82f6,#8b5cf6,#06b6d4)" }}
          />
          <div className="p-6 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="p-2 rounded-xl bg-blue-500/15 border border-blue-500/25 flex-shrink-0">
                <BookOpen size={20} className="text-blue-400" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-slate-100">Guía de Prompt Engineering</h2>
                <p className="text-sm text-slate-400 mt-1">Mejores prácticas 2026-2027</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
              >
                {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
          {/* Best Practices */}
          <section>
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
              Principios Fundamentales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bestPractices.map((practice, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 flex-shrink-0">
                      <practice.icon size={16} className="text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-slate-200 mb-1">
                        {practice.title}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed mb-2">
                        {practice.description}
                      </p>
                      <pre className="text-[10px] text-slate-500 bg-slate-900/60 p-2 rounded border border-slate-700/40 overflow-x-auto">
                        {practice.example}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Templates */}
          <section>
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
              Plantillas Copiables
            </h3>
            <div className="space-y-4">
              {Object.entries(templates).map(([key, template]) => (
                <div
                  key={key}
                  className="rounded-xl bg-slate-800/60 border border-slate-700/60 overflow-hidden"
                >
                  <div className="px-4 py-3 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-200">
                      {template.title}
                    </h4>
                  </div>
                  <div className="p-4 space-y-3">
                    {/* System Prompt */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                          System Prompt
                        </label>
                        <button
                          onClick={() => copyTemplate(template.system, `${key}-system`)}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-slate-100 transition-colors"
                        >
                          {copiedTemplate === `${key}-system` ? (
                            <>
                              <Check size={12} className="text-emerald-400" />
                              Copiado
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              Copiar
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-lg border border-slate-700/40 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                        {template.system}
                      </pre>
                    </div>

                    {/* User Prompt */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
                          User Prompt
                        </label>
                        <button
                          onClick={() => copyTemplate(template.user, `${key}-user`)}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-slate-100 transition-colors"
                        >
                          {copiedTemplate === `${key}-user` ? (
                            <>
                              <Check size={12} className="text-emerald-400" />
                              Copiado
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              Copiar
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-lg border border-slate-700/40 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                        {template.user}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Footer Note */}
          <div className="p-4 rounded-xl bg-blue-900/20 border border-blue-800/40">
            <p className="text-xs text-blue-300 leading-relaxed">
              <strong>Fuente:</strong> Basado en mejores prácticas de prompt engineering 2026-2027 
              (<a href="https://promptbuilder.cc/blog/prompt-engineering-best-practices-2026" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-200">promptbuilder.cc</a>).
              Contenido adaptado para cumplir con restricciones de licencia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default PromptGuideModal;
