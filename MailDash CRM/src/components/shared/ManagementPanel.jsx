import React, { useState, useMemo } from 'react';
import { Activity, Clock, RefreshCw, XCircle, CheckCircle } from 'lucide-react';

const ManagementPanel = ({ 
  logs = [], 
  organizations = [], 
  onRefreshLogs 
}) => {
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [selectedOrgForHistory, setSelectedOrgForHistory] = useState(null);

  // Filtrar logs para mostrar
  const displayedLogs = useMemo(() => {
    return showAllLogs ? logs : logs.slice(0, 5);
  }, [logs, showAllLogs]);

  // Obtener historial de notificaciones para la organización seleccionada
  const notificationHistory = useMemo(() => {
    if (!selectedOrgForHistory) return [];
    // Aquí iría la lógica para obtener el historial real desde el backend
    return [
      { id: 1, fecha: '2026-01-05 10:30', tipo: 'email_enviado', mensaje: 'Email de campaña enviado correctamente' },
      { id: 2, fecha: '2026-01-04 15:45', tipo: 'email_abierto', mensaje: 'Email abierto por el destinatario' },
      { id: 3, fecha: '2026-01-03 09:15', tipo: 'clic_detectado', mensaje: 'Clic en enlace del email' },
    ];
  }, [selectedOrgForHistory]);

  const getLogIcon = (tipo) => {
    switch (tipo) {
      case 'success':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'error':
        return <XCircle size={16} className="text-red-600" />;
      case 'warning':
        return <Activity size={16} className="text-yellow-600" />;
      default:
        return <Activity size={16} className="text-blue-600" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Panel de Gestión</h3>
      
      <div className="space-y-6">
        {/* Logs de Procesamiento */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity size={20} className="text-blue-600" />
              Logs de Procesamiento
            </h4>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAllLogs(!showAllLogs)}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {showAllLogs ? 'Ver menos' : 'Ver todos'}
              </button>
              <button
                onClick={onRefreshLogs}
                className="p-1 text-slate-600 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                title="Refrescar logs"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/30 rounded-lg p-4 max-h-[300px] overflow-y-auto space-y-2">
            {displayedLogs.length === 0 ? (
              <div className="text-center text-slate-500 dark:text-slate-400 py-4">
                No hay logs disponibles
              </div>
            ) : (
              displayedLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-sm p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                  <div className="mt-0.5">
                    {getLogIcon(log.tipo)}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-slate-500 dark:text-slate-400">{log.timestamp}</div>
                    <div className="text-slate-900 dark:text-white">{log.mensaje}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Historial de Notificaciones */}
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        <h4 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <Clock size={20} className="text-purple-600" />
          Historial de Notificaciones por Organización
        </h4>
        <div className="bg-slate-50 dark:bg-slate-900/30 rounded-lg p-4">
          {/* Selector de organización */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Selecciona una organización:
            </label>
            <select
              value={selectedOrgForHistory?.id || ''}
              onChange={(e) => {
                const org = organizations.find(o => o.id === parseInt(e.target.value));
                setSelectedOrgForHistory(org);
              }}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">-- Seleccionar organización --</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.nombre}</option>
              ))}
            </select>
          </div>

          {/* Historial */}
          {!selectedOrgForHistory ? (
            <div className="text-center text-slate-500 dark:text-slate-400 py-8">
              Selecciona una organización para ver su historial de notificaciones
            </div>
          ) : (
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {notificationHistory.length === 0 ? (
                <div className="text-center text-slate-500 dark:text-slate-400 py-4">
                  No hay notificaciones para esta organización
                </div>
              ) : (
                notificationHistory.map((notif) => (
                  <div key={notif.id} className="p-3 bg-white dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{notif.fecha}</span>
                      <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {notif.tipo.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-sm text-slate-900 dark:text-white">{notif.mensaje}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagementPanel;
