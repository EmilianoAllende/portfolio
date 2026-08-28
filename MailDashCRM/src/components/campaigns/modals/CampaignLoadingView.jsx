import React from "react";

const CampaignLoadingView = () => {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 max-w-md w-full text-center shadow-xl animate-scaleIn">
                <h2 className="text-xl font-bold mb-3 dark:text-white">Cargando tarea...</h2>
                <p className="text-slate-600 dark:text-slate-300">Por favor espera un momento.</p>
            </div>
        </div>
    );
};

export default CampaignLoadingView;
