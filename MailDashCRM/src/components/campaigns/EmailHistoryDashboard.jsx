import React, { useState, useEffect, useMemo } from "react";
import { Search, Eye, X, RefreshCw, Mail, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
import apiClient from "../../api/apiClient";

// --- MODAL PARA VER EL CONTENIDO DEL EMAIL (Redimensionable) ---
const EmailContentModal = ({ show, onClose, emailData }) => {
  if (!show || !emailData) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div 
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl flex flex-col resize-both overflow-auto"
        style={{
           width: '800px',
           height: '600px',
           minWidth: '400px',
           minHeight: '300px',
           maxWidth: '95vw',
           maxHeight: '90vh'
        }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 cursor-default shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Mail size={18} /> {emailData.subject || "Sin asunto"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Enviado a: <span className="font-medium text-slate-700 dark:text-slate-300">{emailData.recipient_email || "Desconocido"}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0">
            <X size={20} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <div className="flex-1 bg-white relative p-4 min-h-0">
           <iframe
            title="Email Preview"
            srcDoc={emailData.body || "<p>Sin contenido</p>"}
            className="w-full h-full border border-slate-200 rounded-lg shadow-inner bg-white"
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
};

const EmailHistoryDashboard = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  
  // --- NUEVOS ESTADOS PARA PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await apiClient.getGlobalEmailHistory();
      
      let finalData = [];
      if (Array.isArray(res)) {
         finalData = res;
      } else if (res && Array.isArray(res.data)) {
         finalData = res.data;
      } else if (res && res.history) {
         finalData = Array.isArray(res.history) ? res.history : [res.history];
      } else if (res && typeof res === 'object' && Object.keys(res).length > 0 && !Array.isArray(res)) {
         finalData = [res];
      }

      setHistory(finalData);
    } catch (error) {
      console.error("❌ Error cargando historial desde el webhook:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // --- EFECTO: Volver a la página 1 si el usuario busca o cambia el orden ---
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortConfig, itemsPerPage]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown size={14} className="text-slate-400 opacity-50 ml-1 inline-block" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp size={14} className="text-blue-600 ml-1 inline-block" /> 
      : <ArrowDown size={14} className="text-blue-600 ml-1 inline-block" />;
  };

  // 1. Filtrar y ordenar todos los datos
  const sortedAndFilteredHistory = useMemo(() => {
    let processed = history.filter(item => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const org = (item.organization || "").toLowerCase();
      const camp = (item.campaign_name || "").toLowerCase();
      const sent = (item.sent_by || "").toLowerCase();
      const email = (item.recipient_email || "").toLowerCase();
      
      return org.includes(term) || camp.includes(term) || sent.includes(term) || email.includes(term);
    });

    processed.sort((a, b) => {
      let valA = a[sortConfig.key] || "";
      let valB = b[sortConfig.key] || "";

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return processed;
  }, [history, searchTerm, sortConfig]);

  // 2. Calcular los datos paginados (Cortar el array según la página actual)
  const totalPages = Math.ceil(sortedAndFilteredHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedAndFilteredHistory.slice(startIndex, endIndex);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Mail className="text-blue-600" /> Historial Global de Envíos
          </h2>
          <p className="text-slate-500 text-sm mt-1">Registro de todas las campañas enviadas desde el sistema.</p>
        </div>
        <button 
          onClick={fetchHistory}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 shadow-sm transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin text-blue-600" : "text-slate-500"} />
          Actualizar
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
        
        {/* Barra superior de herramientas */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row justify-between gap-4 items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar por cliente, campaña, email o usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <span>Mostrar:</span>
            <select 
              value={itemsPerPage} 
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 py-1 px-2 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400">
              <tr>
                <th 
                  className="px-6 py-4 font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors select-none"
                  onClick={() => handleSort('date')}
                >
                  Fecha <SortIcon columnKey="date" />
                </th>
                <th 
                  className="px-6 py-4 font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors select-none"
                  onClick={() => handleSort('campaign_name')}
                >
                  Campaña <SortIcon columnKey="campaign_name" />
                </th>
                <th 
                  className="px-6 py-4 font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors select-none"
                  onClick={() => handleSort('organization')}
                >
                  Organización / Destinatario <SortIcon columnKey="organization" />
                </th>
                <th 
                  className="px-6 py-4 font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors select-none"
                  onClick={() => handleSort('sent_by')}
                >
                  Enviado por <SortIcon columnKey="sent_by" />
                </th>
                <th className="px-6 py-4 font-medium text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                       <RefreshCw className="animate-spin text-blue-500" size={24} />
                       <span>Cargando historial desde la base de datos...</span>
                    </div>
                  </td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <Mail size={32} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-lg font-medium text-slate-600">No se encontraron correos</p>
                    <p className="text-sm mt-1">Intenta ajustando los términos de búsqueda o verifica que el flujo esté activo en n8n.</p>
                  </td>
                </tr>
              ) : (
                currentData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-mono text-xs">{item.date}</td>
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200 truncate max-w-[250px]" title={item.campaign_name}>
                      {item.campaign_name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{item.organization}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{item.recipient_email}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs font-medium border border-slate-200 dark:border-slate-600">
                        {item.sent_by}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => setSelectedEmail(item)}
                        className="inline-flex items-center justify-center p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100 hover:shadow-sm"
                        title="Ver contenido del correo"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- CONTROLES DE PAGINACIÓN --- */}
        {!loading && sortedAndFilteredHistory.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/50">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Mostrando <span className="font-medium text-slate-800 dark:text-slate-200">{startIndex + 1}</span> a <span className="font-medium text-slate-800 dark:text-slate-200">{Math.min(endIndex, sortedAndFilteredHistory.length)}</span> de <span className="font-medium text-slate-800 dark:text-slate-200">{sortedAndFilteredHistory.length}</span> resultados
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Página anterior"
              >
                <ChevronLeft size={20} />
              </button>
              
              <span className="text-sm text-slate-600 dark:text-slate-300 px-2">
                Página <span className="font-medium">{currentPage}</span> de <span className="font-medium">{totalPages}</span>
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Página siguiente"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

      </div>

      <EmailContentModal 
        show={!!selectedEmail} 
        onClose={() => setSelectedEmail(null)} 
        emailData={selectedEmail} 
      />
    </div>
  );
};

export default EmailHistoryDashboard;
