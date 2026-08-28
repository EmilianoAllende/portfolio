import React, { useEffect, useState } from 'react';
import { Loader2 } from "lucide-react";

export const FrequencyLoaderOverlay = ({
    isInitialLoading,
    isManualLoading,
    currentUser
}) => {
    const [showInitial, setShowInitial] = useState(false);
    const [showManual, setShowManual] = useState(false);

    useEffect(() => {
        if (isInitialLoading) {
            setShowInitial(true);
        } else {
            setShowInitial(false);
        }
    }, [isInitialLoading]);

    useEffect(() => {
        if (isManualLoading) {
            setShowManual(true);
            const timer = setTimeout(() => setShowManual(false), 5000);
            return () => clearTimeout(timer);
        } else {
            setShowManual(false);
        }
    }, [isManualLoading]);

    return (
        <>
            {/* INICIAL LOAD (Global con blur) */}
            {showInitial && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/20 backdrop-blur-[2px] transition-all duration-300">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-sm w-full mx-4 border border-gray-100 dark:border-gray-700 text-center animate-in fade-in zoom-in duration-300">
                        <Loader2 className="w-12 h-12 text-blue-600 mx-auto animate-spin mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Hola {currentUser?.display_name || currentUser?.nombre || currentUser?.email || "usuario"}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-base mb-6">
                            Los datos de frecuencia se están actualizando, por favor aguarda unos segundos.
                        </p>
                        <button
                            onClick={() => setShowInitial(false)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors border-none outline-none"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            )}

            {/* MANUAL LOAD (Toast que se cierra solo) */}
            {showManual && (
                <div className="fixed bottom-6 right-6 z-[100] bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                    <p className="text-sm font-medium">Los datos se están actualizando, por favor aguarda unos segundos.</p>
                </div>
            )}
        </>
    );
};

export default FrequencyLoaderOverlay;
