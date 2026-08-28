import React, { useState, useEffect } from "react";
import { Building2, Filter, RefreshCw, Calendar, Activity, Eye, Edit2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "../../common/ui/card";
import { Button } from "../../common/ui/button";
import { Input } from "../../common/ui/input";
import { entesAPI } from "../api/apiClient";
import SendEntesEmailsButton from "./SendEntesEmailsButton";

const EntesView = () => {
  const [entes, setEntes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEnte, setSelectedEnte] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    estado: "all",
  });
  
  const ITEMS_PER_PAGE = 6;

  // FunciÃ³n para normalizar texto (sin acentos ni mayÃºsculas)
  const normalizeText = (text) => {
    if (!text) return "";
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  // Cargar entes al montar el componente
  useEffect(() => {
    loadEntes();
  }, []);

  const loadEntes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await entesAPI.getAll();
      
      // Agrupar licitaciones por ente_uuid
      const groupedByEnte = {};
      if (Array.isArray(data)) {
        data.forEach((item) => {
          const enteId = item.ente_uuid || "sin-id";
          if (!groupedByEnte[enteId]) {
            groupedByEnte[enteId] = {
              ente_uuid: item.ente_uuid,
              id_ente: item.id_ente,
              nombre: item.nombre || "Sin nombre",
              direccion: item.direccion,
              telefono: item.telefono,
              email_contacto: item.email_contacto,
              sitio_web: item.sitio_web,
              tags: item.tags || [],
              total_licitaciones: 0,
              licitaciones: [],
            };
          }
          // Solo agregar licitaciones si tienen UUID (no son nulas)
          if (item.licitacion_uuid) {
            groupedByEnte[enteId].licitaciones.push({
              licitacion_uuid: item.licitacion_uuid,
              titulo: item.titulo,
              descripcion: item.descripcion,
              tipo: item.tipo,
              monto: item.monto,
              fecha_inicio: item.fecha_inicio,
              fecha_fin: item.fecha_fin,
              territorio: item.territorio,
              cpv: item.cpv,
              adjudicatario: item.adjudicatario,
              fecha_adjudicacion: item.fecha_adjudicacion,
              enlace_detalle: item.enlace_detalle,
              estado: item.estado_adj,
              creado_en: item.creado_en,
              actualizado_en: item.actualizado_en,
            });
            groupedByEnte[enteId].total_licitaciones += 1;
          }
        });
      }
      
      // Convertir a array
      const entesArray = Object.values(groupedByEnte);
      setEntes(entesArray);
    } catch (err) {
      console.error("Error al cargar entes:", err);
      setError("No se pudieron cargar los entes. Verifica la configuraciÃ³n de n8n.");
    } finally {
      setLoading(false);
    }
  };

  // Filtrar entes segÃºn los filtros activos
  const filteredEntes = entes.filter((ente) => {
    const matchesSearch = normalizeText(ente.nombre).includes(normalizeText(filters.search));
    
    // Si hay licitaciones, verificar estado
    if (filters.estado !== "all" && ente.licitaciones?.length > 0) {
      const hasMatchingState = ente.licitaciones.some(
        (lic) => lic.estado === filters.estado
      );
      return matchesSearch && hasMatchingState;
    }
    
    return matchesSearch;
  });

  // PaginaciÃ³n
  const totalPages = Math.ceil(filteredEntes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEntes = filteredEntes.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset pÃ¡gina cuando cambian los filtros
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // FunciÃ³n para calcular dÃ­as restantes
  const calcularDiasRestantes = (fecha) => {
    if (!fecha) return null;
    const fechaFin = new Date(fecha);
    if (Number.isNaN(fechaFin.getTime())) return null;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const diasRestantes = Math.ceil((fechaFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return Number.isNaN(diasRestantes) ? null : diasRestantes;
  };

  const getFechaFin = (lic) => {
    return lic?.fecha_fin || null;
  };

  // Abre el modal con detalles del ente
  const handleViewEnte = (ente) => {
    setSelectedEnte(ente);
    setShowModal(true);
  };

  // Cierra el modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEnte(null);
  };

  // Abrir modal de ediciÃ³n
  const handleOpenEditModal = (ente) => {
    setSelectedEnte(ente);
    setFormData({
      id: ente.ente_uuid || ente.id,
      id_ente: ente.id_ente || "",
      nombre: ente.nombre || "",
      direccion: ente.direccion || "",
      telefono: ente.telefono || "",
      email_contacto: ente.email_contacto || "",
      sitio_web: ente.sitio_web || "",
      tags: ente.tags || []
    });
    setShowEditModal(true);
  };

  // Abrir modal de nuevo ente
  const handleOpenNewModal = () => {
    setFormData({
      id_ente: "",
      nombre: "",
      direccion: "",
      telefono: "",
      email_contacto: "",
      sitio_web: "",
      tags: []
    });
    setSelectedEnte(null);
    setShowEditModal(true);
  };

  // Cerrar modal de ediciÃ³n
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setFormData({});
    setSelectedEnte(null);
  };

  // Crear ente
  const handleCreateEnte = async () => {
    try {
      setSaving(true);
      await entesAPI.create(formData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await loadEntes();
      handleCloseEditModal();
    } catch (err) {
      console.error("Error al crear ente:", err);
      setError("No se pudo crear el ente.");
    } finally {
      setSaving(false);
    }
  };

  // Guardar ediciÃ³n de ente
  const handleSaveEnte = async () => {
    try {
      setSaving(true);
      const enteId = selectedEnte.ente_uuid || selectedEnte.id;
      await entesAPI.update(enteId, formData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await loadEntes();
      handleCloseEditModal();
    } catch (err) {
      console.error("Error al guardar ente:", err);
      setError("No se pudo guardar el ente.");
    } finally {
      setSaving(false);
    }
  };

  // Eliminar ente
  const handleDeleteEnte = async (ente) => {
    if (!window.confirm(`Â¿EstÃ¡s seguro de eliminar el ente "${ente.nombre}"?`)) {
      return;
    }
    try {
      setLoading(true);
      const enteId = ente.ente_uuid || ente.id;
      await entesAPI.delete(enteId);
      await loadEntes();
    } catch (err) {
      console.error("Error al eliminar ente:", err);
      setError("No se pudo eliminar el ente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} />
            <h2 className="text-lg font-semibold">Filtros</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Buscar</label>
              <Input
                placeholder="Buscar entes..."
                value={filters.search}
                onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Estado</label>
              <select
                value={filters.estado}
                onChange={(e) => handleFilterChange({ ...filters, estado: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
              >
                <option value="all">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="redactado">Redactado</option>
                <option value="enviado">Enviado</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Entes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 size={20} />
              <h2 className="text-lg font-semibold">Entes Contratantes</h2>
              <span className="text-sm text-slate-500">
                ({filteredEntes.length} {filteredEntes.length === 1 ? "ente" : "entes"})
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadEntes}>
                <RefreshCw size={16} className="mr-2" />
                Recargar
              </Button>
              <SendEntesEmailsButton entes={filteredEntes} />
              <Button onClick={handleOpenNewModal}>+ Nuevo Ente</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-300 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="text-center py-8">Cargando...</div>
          ) : filteredEntes.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              {entes.length === 0 
                ? "No hay entes cargados. Agrega un nuevo ente para comenzar." 
                : "No se encontraron entes con los filtros aplicados."}
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedEntes.map((ente, index) => (
                <div
                  key={`${ente.nombre}-${index}`}
                  className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  onClick={() => handleViewEnte(ente)}
                  style={{
                    borderLeft: selectedEnte?.nombre === ente.nombre ? "4px solid #3B82F6" : "4px solid transparent",
                  }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <h3 className="font-semibold text-lg">{ente.nombre}</h3>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        ente.licitaciones?.some(l => l.estado === "enviado") 
                          ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                          : ente.licitaciones?.some(l => l.estado === "redactado")
                          ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      }`}>
                        {ente.licitaciones?.some(l => l.estado === "enviado") 
                          ? "Enviado"
                          : ente.licitaciones?.some(l => l.estado === "redactado")
                          ? "Redactado"
                          : "Pendiente"}
                      </span>
                    </div>
                  </div>

                  {/* Info Ente */}
                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-3">
                    <div className="flex items-center gap-1">
                      <Building2 size={16} />
                      {ente.territorio || "Sin territorio"}
                    </div>
                    <div className="flex items-center gap-1">
                      <Activity size={16} />
                      {ente.total_licitaciones} licitaciones
                    </div>
                  </div>

                  {/* Licitaciones */}
                  {ente.licitaciones && ente.licitaciones.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {ente.licitaciones.slice(0, 3).map((lic, licIndex) => {
                        const fechaFin = getFechaFin(lic);
                        const diasRestantes = calcularDiasRestantes(fechaFin);
                        return (
                          <div
                            key={`${ente.ente_uuid}-lic-${licIndex}`}
                            className="flex justify-between items-center bg-slate-100 dark:bg-slate-700 rounded p-2 text-sm"
                          >
                            <div className="flex flex-col flex-1">
                              <span className="font-medium text-slate-900 dark:text-slate-100">
                                {lic.titulo?.substring(0, 50) || "Sin tÃ­tulo"}...
                              </span>
                              <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                <Calendar size={12} />
                                {fechaFin ? new Date(fechaFin).toLocaleDateString("es-ES") : "Sin fecha"} Â· {parseFloat(lic.monto || 0).toLocaleString("es-ES", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })} â‚¬
                              </span>
                            </div>
                            <div className="flex flex-col items-end gap-1 ml-2">
                              <span className="text-xs px-2 py-1 rounded bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 whitespace-nowrap">
                                {diasRestantes == null ? "Sin fecha" : diasRestantes <= 0 ? "Hoy" : `${diasRestantes} dÃ­as`}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      {ente.licitaciones.length > 3 && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                          +{ente.licitaciones.length - 3} licitaciones mÃ¡s
                        </p>
                      )}
                    </div>
                  )}

                  {/* Botones */}
                  <div className="flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-600">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewEnte(ente);
                      }}
                    >
                      <Eye size={16} className="mr-1" /> Ver
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditModal(ente);
                      }}
                    >
                      <Edit2 size={16} className="mr-1" /> Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEnte(ente);
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}

              {/* PaginaciÃ³n */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    â† Anterior
                  </Button>
                  <span className="text-sm text-slate-600 dark:text-slate-400 min-w-20 text-center">
                    PÃ¡gina {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente â†’
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {/* Modal Detalle del Ente */}
          {showModal && selectedEnte && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-2xl mx-4 max-h-96 overflow-y-auto">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">{selectedEnte.nombre}</h2>
                    <button
                      onClick={handleCloseModal}
                      className="text-slate-500 hover:text-slate-700 text-2xl"
                    >
                      Ã—
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* InformaciÃ³n del Ente */}
                  {selectedEnte.id_ente && (
                    <div>
                      <h3 className="font-semibold text-sm text-slate-600">ID Ente</h3>
                      <p>{selectedEnte.id_ente}</p>
                    </div>
                  )}
                  {selectedEnte.direccion && (
                    <div>
                      <h3 className="font-semibold text-sm text-slate-600">DirecciÃ³n</h3>
                      <p>{selectedEnte.direccion}</p>
                    </div>
                  )}
                  {selectedEnte.email_contacto && (
                    <div>
                      <h3 className="font-semibold text-sm text-slate-600">Email</h3>
                      <p>{selectedEnte.email_contacto}</p>
                    </div>
                  )}
                  {selectedEnte.telefono && (
                    <div>
                      <h3 className="font-semibold text-sm text-slate-600">TelÃ©fono</h3>
                      <p>{selectedEnte.telefono}</p>
                    </div>
                  )}
                  {selectedEnte.sitio_web && (
                    <div>
                      <h3 className="font-semibold text-sm text-slate-600">Sitio Web</h3>
                      <a href={selectedEnte.sitio_web} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {selectedEnte.sitio_web}
                      </a>
                    </div>
                  )}
                  {selectedEnte.tags && selectedEnte.tags.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-sm text-slate-600">Tags</h3>
                      <div className="flex gap-2 flex-wrap">
                        {selectedEnte.tags.map((tag, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Licitaciones */}
                  {selectedEnte.licitaciones && selectedEnte.licitaciones.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-sm text-slate-600 mb-2">
                        Licitaciones ({selectedEnte.licitaciones.length})
                      </h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {selectedEnte.licitaciones.map((lic, idx) => {
                          const fechaFin = getFechaFin(lic);
                          const diasRestantes = calcularDiasRestantes(fechaFin);
                          return (
                            <div
                              key={`modal-lic-${idx}`}
                              className="p-3 border border-slate-200 dark:border-slate-700 rounded text-sm"
                            >
                              <div className="flex justify-between items-start mb-1">
                                <p className="font-medium">{lic.titulo || "Sin tÃ­tulo"}</p>
                                <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
                                  lic.estado === "enviado"
                                    ? "bg-green-100 text-green-800"
                                    : lic.estado === "redactado"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}>
                                  {lic.estado || "pendiente"}
                                </span>
                              </div>
                              {lic.descripcion && (
                                <p className="text-slate-600 text-xs mb-2">{lic.descripcion.substring(0, 100)}...</p>
                              )}
                              <p className="text-slate-600 text-xs">
                                <Calendar size={12} className="inline mr-1" />
                                {fechaFin ? new Date(fechaFin).toLocaleDateString("es-ES") : "Sin fecha"} Â· {parseFloat(lic.monto || 0).toLocaleString("es-ES", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })} â‚¬ Â· {diasRestantes == null ? "Sin fecha" : diasRestantes <= 0 ? "Hoy" : `${diasRestantes} dÃ­as`}
                              </p>
                              {lic.enlace_detalle && (
                                <a href={lic.enlace_detalle} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                                  Ver detalle
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t">
                    <Button variant="outline" className="flex-1" onClick={handleCloseModal}>
                      Cerrar
                    </Button>
                    <Button className="flex-1" onClick={() => { handleCloseModal(); handleOpenEditModal(selectedEnte); }}>Editar Ente</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Modal Editar/Crear Ente */}
          {showEditModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-2xl mx-4 max-h-96 overflow-y-auto">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">{selectedEnte ? "Editar Ente" : "Nuevo Ente"}</h2>
                    <button
                      onClick={handleCloseEditModal}
                      className="text-slate-500 hover:text-slate-700 text-2xl"
                    >
                      Ã—
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">ID Ente (opcional)</label>
                    <Input
                      value={formData.id_ente || ""}
                      onChange={(e) => setFormData({ ...formData, id_ente: e.target.value })}
                      placeholder="ID del ente"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nombre *</label>
                    <Input
                      value={formData.nombre || ""}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      placeholder="Nombre del ente"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">DirecciÃ³n</label>
                    <Input
                      value={formData.direccion || ""}
                      onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                      placeholder="DirecciÃ³n"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">TelÃ©fono</label>
                      <Input
                        value={formData.telefono || ""}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        placeholder="TelÃ©fono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <Input
                        type="email"
                        value={formData.email_contacto || ""}
                        onChange={(e) => setFormData({ ...formData, email_contacto: e.target.value })}
                        placeholder="email@ejemplo.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Sitio Web</label>
                    <Input
                      value={formData.sitio_web || ""}
                      onChange={(e) => setFormData({ ...formData, sitio_web: e.target.value })}
                      placeholder="https://ejemplo.com"
                    />
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button variant="outline" className="flex-1" onClick={handleCloseEditModal} disabled={saving}>
                      Cancelar
                    </Button>
                    <Button 
                      className="flex-1" 
                      onClick={selectedEnte ? handleSaveEnte : handleCreateEnte} 
                      disabled={saving || !formData.nombre}
                    >
                      {saving ? "Guardando..." : selectedEnte ? "Guardar" : "Crear"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EntesView;
