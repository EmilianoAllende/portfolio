import React from "react";

const FastSendProgressView = ({
    currentSender,
    fastSendStats,
    showFastSendDebug,
    onCancelQueue,
    setConfirmProps,
    closeConfirm
}) => {
    const debugSender = currentSender || {
        id: "(sin_id)",
        displayName: "(sin_nombre)",
        email: "(sin_email)"
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-12 max-w-md w-full text-center shadow-xl animate-scaleIn">
                <div className="mb-6">
                    <div className="relative w-20 h-20 mx-auto">
                        <div className="absolute inset-0 border-4 border-orange-200 dark:border-orange-900 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-orange-600 dark:border-orange-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                </div>
                <h2 className="text-2xl font-bold mb-2 dark:text-white">⚡ Envío Rápido en Progreso</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Enviando campañas sin revisión individual</p>
                
                <div className="bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-800/20 rounded-lg p-6 border-2 border-orange-300 dark:border-orange-600">
                    <p className="text-5xl font-bold text-orange-600 dark:text-orange-400 mb-2">{fastSendStats.sent} / {fastSendStats.total}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{fastSendStats.total - fastSendStats.sent} restantes</p>
                </div>
                
                <button 
                    onClick={() => {
                        setConfirmProps({
                            show: true,
                            title: "Cancelar Envío Rápido",
                            message: "¿Estás seguro de que quieres cancelar y descartar el resto de la cola de envíos?",
                            confirmText: "Sí, detener envío",
                            cancelText: "No, seguir enviando",
                            type: "danger",
                            onConfirm: () => {
                                if (onCancelQueue) onCancelQueue();
                                closeConfirm();
                            }
                        });
                    }}
                    className="mt-6 w-full py-3 px-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-bold rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                >
                    Detener y Cancelar Cola
                </button>
                
                {showFastSendDebug && (
                    <div className="mt-4 text-left rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/60 p-3">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">DEBUG · Remitente activo en envío rápido</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate">Nombre: {debugSender.displayName || "(vacío)"}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate">Email: {debugSender.email || "(vacío)"}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate">ID: {debugSender.id?.toString?.() || "(vacío)"}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FastSendProgressView;
