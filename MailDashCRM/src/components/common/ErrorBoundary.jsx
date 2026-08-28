import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Actualiza el estado para que el siguiente renderizado muestre la UI alternativa
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // También puedes registrar el error en un servicio de reporte de errores
        console.error("ErrorBoundary atrapó un error: ", error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        // Si no estamos usando React Router, forzar la recarga limpiando el hash o params es lo más seguro
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            // Puedes renderizar cualquier UI alternativa
            return (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] w-full bg-slate-50 dark:bg-slate-900 p-6 text-center">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl max-w-lg w-full border border-slate-200 dark:border-slate-700 flex flex-col items-center">
                        <div className="h-16 w-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-6">
                            <AlertTriangle size={32} />
                        </div>

                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                            ¡Oops! Algo salió mal.
                        </h2>

                        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md">
                            La aplicación ha encontrado un error inesperado. Hemos registrado el problema para solucionarlo.
                        </p>

                        {/* Opcional: Mostrar detalles técnicos solo en desarrollo o para administradores, 
                            por ahora mantenemos la UI limpia para el usuario final */}

                        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                            <button
                                onClick={this.handleReload}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm"
                            >
                                <RefreshCw size={18} />
                                Recargar Página
                            </button>

                            <button
                                onClick={this.handleGoHome}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-medium transition-colors border border-slate-200 dark:border-slate-600"
                            >
                                <Home size={18} />
                                Volver al Inicio
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
