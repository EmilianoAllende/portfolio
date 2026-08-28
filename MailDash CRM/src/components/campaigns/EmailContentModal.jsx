import React from "react";
import { X } from "lucide-react";

// --- MODAL PARA VER EL CONTENIDO DEL EMAIL ---
const EmailContentModal = ({ show, onClose, emailData }) => {
    if (!show || !emailData) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                            📧 Correo Enviado
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {emailData.subject || "Sin asunto"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        <X size={20} className="text-slate-500 dark:text-slate-400" />
                    </button>
                </div>

                {/* Content - Iframe para aislar estilos */}
                <div className="flex-1 overflow-hidden bg-white relative">
                    <iframe
                        title="Email Preview"
                        srcDoc={emailData.body || emailData.html || "<p>No se pudo cargar el contenido.</p>"}
                        className="w-full h-full border-none"
                        sandbox="allow-same-origin"
                    />
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmailContentModal;
