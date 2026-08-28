import React from 'react';
import { User, ChevronDown, AlertTriangle } from "lucide-react";

const PreviewEditView = ({
  selectedOrg,
  editableContent,
  handleContentChange,
  onConfirmAndSend,
  isSending,
  handleCancelClick,
  onShowHtmlPreview,
  isCallCenterMode,
  onSkipTask,
  isFastSendMode,
  onToggleFastSend,
  queueProgress = { current: 0, total: 0 },
  availableSenders = [], 
  selectedSenderId,
  onSenderChange
}) => {
  const displayName = React.useMemo(() => {
      // 1. Intenta usar 'nombre', si existe y NO es "indefinido", "undefined" o "ninguno"
      if (selectedOrg.nombre && 
          selectedOrg.nombre !== "indefinido" && 
          selectedOrg.nombre !== "undefined" &&
          selectedOrg.nombre !== "ninguno") {
          return selectedOrg.nombre;
      }
      // 2. Intenta usar 'nombres_org', si existe y NO es "indefinido", "undefined" o "ninguno"
      if (selectedOrg.nombres_org && 
          selectedOrg.nombres_org !== "indefinido" && 
          selectedOrg.nombres_org !== "undefined" &&
          selectedOrg.nombres_org !== "ninguno") {
          return selectedOrg.nombres_org.replace(/[[\]"]/g, ''); // Quita [" "] si existen
      }
      // 3. Intenta usar 'organizacion', si existe y NO es "indefinido", "undefined" o "ninguno"
      if (selectedOrg.organizacion && 
          selectedOrg.organizacion !== "indefinido" && 
          selectedOrg.organizacion !== "undefined" &&
          selectedOrg.organizacion !== "ninguno") {
          return selectedOrg.organizacion;
      }
      // 4. Como último recurso, usa el ID
      return selectedOrg.id;
  }, [selectedOrg]);


  return (
    <>
      <div className="mb-8">
        <div className="flex items-start justify-between mb-3">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Revisa y envía la campaña
          </h2>
          
          {/* Badge de progreso arriba a la derecha */}
          {queueProgress && queueProgress.total > 0 && (
            <div className="flex flex-col items-end gap-1">
              <span className="px-4 py-2 text-base font-bold bg-blue-600 text-white rounded-lg shadow-lg">
                📧 {queueProgress.current} / {queueProgress.total}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Emails en cola
              </span>
            </div>
          )}
        </div>
        
        {/* BARRA DE INFORMACIÓN DE ENVÍO */}
        <div className="flex flex-col md:flex-row gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
            
            {/* Info Destinatario */}
            <div className="flex-1">
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Para (Destinatario)</span>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{displayName}</span>
                    <span className="px-2 py-0.5 text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full font-mono">
                        {selectedOrg.id}
                    </span>
                </div>
            </div>

            {/* Selector de Remitente (NUEVO) */}
            <div className="flex-1 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700 pt-3 md:pt-0 md:pl-4">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <User size={12}/> De (Remitente)
                </label>
                
                {availableSenders && availableSenders.length > 0 ? (
                    <div className="relative">
                        <select
                            value={selectedSenderId || ""}
                            onChange={(e) => onSenderChange && onSenderChange(e.target.value)}
                            disabled={isSending}
                            className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 pr-8 transition-colors hover:border-blue-400 cursor-pointer shadow-sm"
                        >
                            {availableSenders.map(sender => (
                                <option key={sender.id} value={sender.id}>
                                    {sender.label} ({sender.email})
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                ) : (
                    <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg text-xs border border-amber-200 dark:border-amber-800">
                        <AlertTriangle size={14} />
                        <span>No hay remitentes configurados. Se usará el predeterminado.</span>
                    </div>
                )}
            </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Asunto
          </label>
          <input
            type="text"
            name="subject"
            value={editableContent.subject}
            onChange={handleContentChange}
            autoComplete="off"
            className="block w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Cuerpo del mensaje
          </label>
          <textarea
            name="body"
            rows="10"
            value={editableContent.body}
            onChange={handleContentChange}
            autoComplete="off"
            className="block w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
          />
        </div>

        {/* Sección informativa del botón (solo lectura) */}
        {editableContent.button?.text && editableContent.button?.url && (
          <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
            <div className="bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-700">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    🔘 Botón:
                  </span>
                  <span className="inline-block bg-slate-800 dark:bg-slate-700 text-white px-3 py-1 rounded text-xs font-semibold">
                    {editableContent.button.text}
                  </span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">
                  {editableContent.button.url}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mx-auto mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={onShowHtmlPreview}
          className="px-5 py-2.5 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200 active:scale-95"
          >
          👁️ Previsualizar
        </button>

        {isCallCenterMode && (
            <button
              onClick={() => {
                console.log("1. Botón 'Saltar' presionado en PreviewEditView.");
                onSkipTask();
              }}
              className="px-4 py-2 text-sm font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
              title="Posponer esta tarea y pasar a la siguiente"
            >
              Saltar (Posponer)
            </button>
        )}

        {isCallCenterMode && (
            <button
              onClick={() => {
                console.log("🚀 Activando Envío Rápido");
                onToggleFastSend();
              }}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                isFastSendMode
                  ? "bg-red-600 text-white border border-red-700 hover:bg-red-700 shadow-lg shadow-red-500/50"
                  : "bg-orange-500 text-white border border-orange-600 hover:bg-orange-600 shadow-lg shadow-orange-500/50"
              }`}
              title="Enviar automáticamente los restantes sin revisión"
            >
              {isFastSendMode ? "⚡ Envío Rápido ACTIVO" : "⚡ Envío Rápido"}
            </button>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleCancelClick}
            disabled={isSending}
            className="px-5 py-2.5 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirmAndSend(editableContent)}
            disabled={isSending}
            className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-xl shadow-lg shadow-green-200 dark:shadow-green-900/30 transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {isFastSendMode ? "Enviando restantes..." : "Enviando..."}
              </>
            ) : (
              <>
                {isFastSendMode ? "Enviar (Modo Rápido)" : "Confirmar y Enviar"}
                <span className="text-lg">✓</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default PreviewEditView;
