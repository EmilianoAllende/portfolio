import React, { useState, useEffect } from "react";
import { Star, Filter, RefreshCw, Eye, Edit2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "../../common/ui/card";
import { Button } from "../../common/ui/button";
import { Input } from "../../common/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../common/ui/table";
import { entesAPI, patrociniosAPI, adjudicatariosAPI } from "../api/apiClient";
import SendPatrociniosEmailsButton from "./SendPatrociniosEmailsButton";

const PatrociniosView = () => {
  const [patrocinios, setPatrocinios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPatrocinio, setSelectedPatrocinio] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [entesOptions, setEntesOptions] = useState([]);
  const [adjudicatarios, setAdjudicatarios] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    estado: "all",
  });
  
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    loadPatrocinios();
    loadEntes();
    loadAdjudicatarios();
  }, []);

  const loadPatrocinios = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await patrociniosAPI.getAll();
      setPatrocinios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar patrocinios:", err);
      setError("No se pudieron cargar los patrocinios. Verifica la configuraciÃ³n de n8n.");
    } finally {
      setLoading(false);
    }
  };

  const loadEntes = async () => {
    try {
      const data = await entesAPI.getAll();
      const map = new Map();
      if (Array.isArray(data)) {
        data.forEach((item) => {
          const id = item.ente_uuid || item.id_ente || item.id;
          const nombre = item.nombre || "";
          if (!id && !nombre) return;
          const key = id || nombre;
          if (!map.has(key)) {
            map.set(key, { id, nombre });
          }
        });
      }
      setEntesOptions(Array.from(map.values()));
    } catch (err) {
      console.error("Error al cargar entes:", err);
      setError("No se pudieron cargar los entes.");
    }
  };

  const loadAdjudicatarios = async () => {
    try {
      const data = await adjudicatariosAPI.getAll();
      setAdjudicatarios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar adjudicatarios:", err);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const filteredPatrocinios = patrocinios.filter((patrocinio) => {
    const searchValue = filters.search.toLowerCase();
    const matchesSearch = 
      patrocinio.observaciones?.toLowerCase().includes(searchValue) ||
      patrocinio.territorio?.toLowerCase().includes(searchValue) ||
      getAdjudicatarioLabel(patrocinio).toLowerCase().includes(searchValue);
    
    if (filters.estado !== "all" && patrocinio.estado !== filters.estado) {
      return false;
    }
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredPatrocinios.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPatrocinios = filteredPatrocinios.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Combinar entes y adjudicatarios en un solo listado
  const adjudicatarioOptions = [
    ...entesOptions.map(e => ({ ...e, tipo: 'ente' })),
    ...adjudicatarios.map(a => ({ ...a, tipo: 'adjudicatario' }))
  ];

  const handleViewPatrocinio = (patrocinio) => {
    setSelectedPatrocinio(patrocinio);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPatrocinio(null);
  };

  const handleOpenEditModal = (patrocinio) => {
    setSelectedPatrocinio(patrocinio);
    setFormData({
      ...patrocinio,
      licitacion_id: patrocinio.licitacion_id || patrocinio.id,
      adjudicatario_id: patrocinio.adjudicatario_id || "",
      adjudicatario_texto: patrocinio.adjudicatario_texto || patrocinio.adjudicatario_nombre || ""
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setFormData({});
  };

  const handleOpenNewModal = () => {
    setFormData({
      adjudicatario_id: "",
      adjudicatario_texto: "",
      titulo: "",
      descripcion: "",
      tipo: "",
      estado: "pendiente",
      monto: 0,
      territorio: "",
      fecha_inicio: "",
      fecha_fin: "",
      cpv: "",
      enlace_detalle: ""
    });
    setSelectedPatrocinio(null);
    setShowEditModal(true);
  };

  const handleCreatePatrocinio = async () => {
    try {
      setSaving(true);
      await patrociniosAPI.create(formData);
      // Delay de 1 segundo antes de recargar
      await new Promise(resolve => setTimeout(resolve, 1000));
      await loadPatrocinios();
      handleCloseEditModal();
    } catch (err) {
      console.error("Error al crear patrocinio:", err);
      setError("No se pudo crear el patrocinio.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePatrocinio = async (patrocinio) => {
    if (!window.confirm(`Â¿EstÃ¡s seguro de eliminar "${patrocinio.titulo}"?`)) {
      return;
    }
    try {
      setLoading(true);
      const licitacionId = patrocinio.licitacion_id || patrocinio.id;
      await patrociniosAPI.delete(licitacionId);
      await loadPatrocinios();
    } catch (err) {
      console.error("Error al eliminar patrocinio:", err);
      setError("No se pudo eliminar el patrocinio.");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePatrocinio = async () => {
    try {
      setSaving(true);
      const licitacionId = selectedPatrocinio.licitacion_id || selectedPatrocinio.id;
      await patrociniosAPI.update(licitacionId, formData);
      // Delay de 1 segundo antes de recargar para que se vean los cambios
      await new Promise(resolve => setTimeout(resolve, 1000));
      await loadPatrocinios();
      handleCloseEditModal();
    } catch (err) {
      console.error("Error al guardar patrocinio:", err);
      setError("No se pudo guardar el patrocinio.");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatMonto = (monto) => {
    if (!monto) return "-";
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(monto);
  };

  const getAdjudicatarioLabel = (patrocinio) => {
    // Si tiene adjudicatario_id, buscar el nombre en la lista de adjudicatarios
    if (patrocinio.adjudicatario_id) {
      const adjudicatario = adjudicatarios.find(
        (adj) => adj.id === patrocinio.adjudicatario_id
      );
      if (adjudicatario?.nombre) {
        return adjudicatario.nombre;
      }
    }
    
    // Fallback a los campos de texto
    return (
      patrocinio.adjudicatario_texto ||
      patrocinio.adjudicatario_nombre ||
      patrocinio.nombre ||
      "-"
    );
  };

  const getEstadoBadge = (estado) => {
    const config = {
      pendiente: {
        label: "Pendiente",
        className: "bg-gray-100 text-gray-600",
      },
      redactado: {
        label: "Redactado",
        className: "bg-yellow-100 text-yellow-700",
      },
      enviado: {
        label: "Enviado",
        className: "bg-green-100 text-green-700",
      },
    };
    return config[estado?.toLowerCase()] || config["pendiente"];
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
                placeholder="Buscar patrocinios..."
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

      {/* Lista de Patrocinios */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star size={20} />
              <h2 className="text-lg font-semibold">Licitaciones Patrocinadas</h2>
              <span className="text-sm text-slate-500">
                ({filteredPatrocinios.length} {filteredPatrocinios.length === 1 ? "patrocinio" : "patrocinios"})
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadPatrocinios}>
                <RefreshCw size={16} className="mr-2" />
                Recargar
              </Button>
              <SendPatrociniosEmailsButton patrocinios={patrocinios} />
              <Button onClick={handleOpenNewModal}>+ Nuevo Patrocinio</Button>
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
          ) : filteredPatrocinios.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              {patrocinios.length === 0 
                ? "No hay patrocinios cargados. Agrega un nuevo patrocinio para comenzar." 
                : "No se encontraron patrocinios con los filtros aplicados."}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-700">
                      <TableHead className="font-semibold">LicitaciÃ³n</TableHead>
                      <TableHead className="font-semibold">Adjudicatario</TableHead>
                      <TableHead className="font-semibold">Monto</TableHead>
                      <TableHead className="font-semibold">Fecha Fin</TableHead>
                      <TableHead className="font-semibold">Estado</TableHead>
                      <TableHead className="font-semibold">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPatrocinios.map((patrocinio) => {
                      const estadoConfig = getEstadoBadge(patrocinio.estado);
                      return (
                        <TableRow
                          key={patrocinio.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Star size={16} className="text-yellow-500 fill-yellow-500" />
                              <span className="font-medium text-blue-600">{patrocinio.titulo || "Sin tÃ­tulo"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600">
                            <div>
                              <div className="font-medium">{getAdjudicatarioLabel(patrocinio)}</div>
                              {patrocinio.email_contacto && (
                                <div className="text-xs text-slate-400">{patrocinio.email_contacto}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{formatMonto(patrocinio.monto)}</TableCell>
                          <TableCell className="text-slate-600">{formatDate(patrocinio.fecha_fin)}</TableCell>
                          <TableCell>
                            <span className={`text-xs px-2 py-1 rounded font-medium ${estadoConfig.className}`}>
                              {estadoConfig.label}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewPatrocinio(patrocinio)}
                                title="Ver detalles"
                              >
                                <Eye size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEditModal(patrocinio)}
                                title="Editar"
                              >
                                <Edit2 size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeletePatrocinio(patrocinio)}
                                title="Eliminar"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

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

          {/* Modal Detalle */}
          {showModal && selectedPatrocinio && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-2xl mx-4 max-h-96 overflow-y-auto">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star size={20} className="text-yellow-500 fill-yellow-500" />
                      <h2 className="text-xl font-semibold">{selectedPatrocinio.titulo || "Patrocinio"}</h2>
                    </div>
                    <button
                      onClick={handleCloseModal}
                      className="text-slate-500 hover:text-slate-700 text-2xl"
                    >
                      Ã—
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-sm text-slate-600">Tipo</h3>
                      <p>{selectedPatrocinio.tipo || "-"}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-slate-600">CPV</h3>
                      <p>{selectedPatrocinio.cpv || "-"}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-slate-600">Monto</h3>
                      <p className="font-medium">{formatMonto(selectedPatrocinio.monto)}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-slate-600">Territorio</h3>
                      <p>{selectedPatrocinio.territorio}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-slate-600">PerÃ­odo</h3>
                    <p>{formatDate(selectedPatrocinio.fecha_inicio)} - {formatDate(selectedPatrocinio.fecha_fin)}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-slate-600">Estado</h3>
                    <span className={`text-xs px-2 py-1 rounded font-medium inline-block ${getEstadoBadge(selectedPatrocinio.estado).className}`}>
                      {getEstadoBadge(selectedPatrocinio.estado).label}
                    </span>
                  </div>
                  {selectedPatrocinio.descripcion && (
                    <div>
                      <h3 className="font-semibold text-sm text-slate-600">DescripciÃ³n</h3>
                      <p className="text-sm">{selectedPatrocinio.descripcion}</p>
                    </div>
                  )}
                  {getAdjudicatarioLabel(selectedPatrocinio) !== "-" && (
                    <div>
                      <h3 className="font-semibold text-sm text-slate-600">Adjudicatario</h3>
                      <p>{getAdjudicatarioLabel(selectedPatrocinio)}</p>
                    </div>
                  )}
                  {selectedPatrocinio.email_contacto && (
                    <div>
                      <h3 className="font-semibold text-sm text-slate-600">Email Contacto</h3>
                      <p>{selectedPatrocinio.email_contacto}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t">
                    <Button variant="outline" className="flex-1" onClick={handleCloseModal}>
                      Cerrar
                    </Button>
                    <Button className="flex-1" onClick={() => handleOpenEditModal(selectedPatrocinio)}>Editar Patrocinio</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Modal Editar */}
          {showEditModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-2xl mx-4 max-h-96 overflow-y-auto">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">{selectedPatrocinio ? "Editar Patrocinio" : "Nuevo Patrocinio"}</h2>
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
                    <label className="block text-sm font-medium mb-1">Ente / Adjudicatario</label>
                    <select
                      value={formData.adjudicatario_id || formData.adjudicatario_texto || ""}
                      onChange={(e) => {
                        const selected = adjudicatarioOptions.find(
                          (opt) => String(opt.id || opt.nombre) === e.target.value
                        );
                        if (selected) {
                          setFormData({
                            ...formData,
                            adjudicatario_id: selected.id || "",
                            adjudicatario_texto: selected.nombre || "",
                          });
                        } else {
                          setFormData({
                            ...formData,
                            adjudicatario_id: "",
                            adjudicatario_texto: "",
                          });
                        }
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                    >
                      <option value="">Seleccionar adjudicatario o ente</option>
                      <optgroup label="Adjudicatarios">
                        {adjudicatarioOptions
                          .filter(opt => opt.tipo === 'adjudicatario')
                          .map((opt) => (
                            <option key={`adj-${opt.id}`} value={String(opt.id)}>
                              {opt.nombre || opt.id}
                            </option>
                        ))}
                      </optgroup>
                      <optgroup label="Entes">
                        {adjudicatarioOptions
                          .filter(opt => opt.tipo === 'ente')
                          .map((opt) => (
                            <option key={`ente-${opt.id || opt.nombre}`} value={String(opt.id || opt.nombre)}>
                              {opt.nombre || opt.id}
                            </option>
                        ))}
                      </optgroup>
                    </select>
                    <p className="text-xs text-slate-500 mt-1">
                      Si no existe, completa el nombre manualmente abajo.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Adjudicatario (texto)</label>
                    <Input
                      value={formData.adjudicatario_texto || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          adjudicatario_texto: e.target.value,
                          adjudicatario_id: "",
                        })
                      }
                      placeholder="Nombre del adjudicatario/ente"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">TÃ­tulo</label>
                    <Input
                      value={formData.titulo || ""}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                      placeholder="TÃ­tulo de la licitaciÃ³n"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo</label>
                    <Input
                      value={formData.tipo || ""}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                      placeholder="Tipo de licitaciÃ³n"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Monto</label>
                    <Input
                      type="number"
                      value={formData.monto || ""}
                      onChange={(e) => setFormData({ ...formData, monto: parseFloat(e.target.value) })}
                      placeholder="Monto"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Territorio</label>
                    <Input
                      value={formData.territorio || ""}
                      onChange={(e) => setFormData({ ...formData, territorio: e.target.value })}
                      placeholder="Territorio"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Fecha Inicio</label>
                      <Input
                        type="date"
                        value={formData.fecha_inicio ? formData.fecha_inicio.split('T')[0] : ""}
                        onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Fecha Fin</label>
                      <Input
                        type="date"
                        value={formData.fecha_fin ? formData.fecha_fin.split('T')[0] : ""}
                        onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">CPV</label>
                    <Input
                      value={formData.cpv || ""}
                      onChange={(e) => setFormData({ ...formData, cpv: e.target.value })}
                      placeholder="CÃ³digo CPV (ej: 79955000)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Enlace Detalle</label>
                    <Input
                      value={formData.enlace_detalle || ""}
                      onChange={(e) => setFormData({ ...formData, enlace_detalle: e.target.value })}
                      placeholder="URL del detalle"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Estado</label>
                    <select
                      value={formData.estado || ""}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="redactado">Redactado</option>
                      <option value="enviado">Enviado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">DescripciÃ³n</label>
                    <textarea
                      value={formData.descripcion || ""}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      placeholder="DescripciÃ³n"
                      rows="3"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                    />
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button variant="outline" className="flex-1" onClick={handleCloseEditModal} disabled={saving}>
                      Cancelar
                    </Button>
                    <Button 
                      className="flex-1" 
                      onClick={selectedPatrocinio ? handleSavePatrocinio : handleCreatePatrocinio} 
                      disabled={saving}
                    >
                      {saving ? "Guardando..." : selectedPatrocinio ? "Guardar" : "Crear"}
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

export default PatrociniosView;
