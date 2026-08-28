import React, { useState, useEffect, useMemo } from "react";
import { Code, Power, Edit2, Trash2, Plus, Eye, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader } from "../../common/ui/card";
import { Button } from "../../common/ui/button";
import { Input } from "../../common/ui/input";
import { Textarea } from "../../common/ui/textarea";
import { promptsAPI } from "../api/apiClient";

const PromptsView = () => {
  const [prompts, setPrompts] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [promptModalType, setPromptModalType] = useState("entes");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    system_prompt: "",
    user_prompt: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    setLoading(true);
    try {
      const data = await promptsAPI.getAll();
      setPrompts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar prompts:", err);
      alert("Error al cargar los prompts");
    } finally {
      setLoading(false);
    }
  };

  // Filtrar prompts por tipo
  const promptsEntes = useMemo(
    () => prompts.filter((p) => p.tipo === "entes" || !p.tipo),
    [prompts]
  );
  const promptsAdjudicatarios = useMemo(
    () => prompts.filter((p) => p.tipo === "adjudicatarios"),
    [prompts]
  );

  const handleOpenEditModal = (prompt, tipo) => {
    setSelectedPrompt(prompt);
    setPromptModalType(tipo);
    setFormData({
      nombre: prompt.nombre,
      system_prompt: prompt.system_prompt,
      user_prompt: prompt.user_prompt
    });
    setOpenModal(true);
  };

  const handleOpenCreateModal = (tipo) => {
    setSelectedPrompt(null);
    setPromptModalType(tipo);
    setFormData({
      nombre: "",
      system_prompt: "",
      user_prompt: ""
    });
    setOpenModal(true);
  };

  const handleSavePrompt = async () => {
    if (!formData.nombre.trim() || !formData.system_prompt.trim() || !formData.user_prompt.trim()) {
      alert("Todos los campos son obligatorios");
      return;
    }

    setSaving(true);
    try {
      const dataToSend = {
        nombre: formData.nombre,
        system_prompt: formData.system_prompt,
        user_prompt: formData.user_prompt,
        tipo: promptModalType
      };

      if (selectedPrompt?.id) {
        // Editar
        await promptsAPI.update(selectedPrompt.id, dataToSend);
        alert("Prompt actualizado correctamente");
      } else {
        // Crear
        await promptsAPI.create(dataToSend);
        alert("Prompt creado correctamente");
      }
      
      await loadPrompts();
      setOpenModal(false);
      setFormData({ nombre: "", system_prompt: "", user_prompt: "" });
      setSelectedPrompt(null);
    } catch (err) {
      console.error("Error al guardar prompt:", err);
      alert("Error al guardar el prompt");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEstado = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === "activado" ? "desactivado" : "activado";
    try {
      await promptsAPI.toggleEstado(id, nuevoEstado);
      await loadPrompts();
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      alert("Error al cambiar el estado del prompt");
    }
  };

  const handleDeletePrompt = async (prompt, tipo) => {
    const promptsDelTipo = tipo === "entes" ? promptsEntes : promptsAdjudicatarios;
    if (promptsDelTipo.length <= 1) {
      alert("Debe existir al menos un prompt. No se puede eliminar el Ãºltimo.");
      return;
    }

    if (window.confirm("Â¿EstÃ¡s seguro de que deseas eliminar este prompt?")) {
      try {
        await promptsAPI.delete(prompt.id);
        alert("Prompt eliminado correctamente");
        await loadPrompts();
      } catch (err) {
        console.error("Error al eliminar:", err);
        alert("Error al eliminar el prompt");
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-none rounded border-0">
        {/* Header */}
        <CardHeader className="flex items-center justify-between px-4">
          <div>
            <h1 className="text-xl font-semibold">GestiÃ³n de plantillas de prompts</h1>
            <p className="text-sm text-gray-500">
              Configura y personaliza los prompts para las campaÃ±as de Email Marketing
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadPrompts}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            {loading ? "Cargando..." : "Recargar"}
          </Button>
        </CardHeader>
        <div className="border-t"></div>
        
        <CardContent className="pt-6">
          {/* Prompts para Entes Contratantes */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-md font-semibold flex items-center gap-2">
                <Code size={18} />
                Prompts para Entes Contratantes
              </h2>
              <Button size="sm" onClick={() => handleOpenCreateModal("entes")}>
                <Plus size={16} className="mr-1" /> Crear Prompt
              </Button>
            </div>
            
            {promptsEntes.length === 0 ? (
              <div className="text-center py-8 text-slate-500 border border-slate-200 rounded-lg">
                No hay prompts para entes. Crea uno para comenzar.
              </div>
            ) : (
              <div className="space-y-2 mb-6">
                {promptsEntes.map((prompt) => (
                  <div
                    key={prompt.id}
                    className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{prompt.nombre}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            prompt.estado === "activado"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {prompt.estado === "activado" ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                        <div className="text-sm text-slate-600 space-y-1">
                          <p className="line-clamp-1"><strong>System:</strong> {prompt.system_prompt || "N/A"}</p>
                          <p className="line-clamp-1"><strong>User:</strong> {prompt.user_prompt || "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPrompt(prompt);
                            setOpenViewModal(true);
                          }}
                          title="Ver"
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditModal(prompt, "entes")}
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleEstado(prompt.id, prompt.estado)}
                          title={prompt.estado === "activado" ? "Desactivar" : "Activar"}
                        >
                          <Power size={16} className={prompt.estado === "activado" ? "text-green-600" : "text-gray-400"} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePrompt(prompt, "entes")}
                          title="Eliminar"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t my-6"></div>

          {/* Prompts para Patrocinios/Adjudicatarios */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-md font-semibold flex items-center gap-2">
                <Code size={18} />
                Prompts para Patrocinios
              </h2>
              <Button size="sm" onClick={() => handleOpenCreateModal("adjudicatarios")}>
                <Plus size={16} className="mr-1" /> Crear Prompt
              </Button>
            </div>
            
            {promptsAdjudicatarios.length === 0 ? (
              <div className="text-center py-8 text-slate-500 border border-slate-200 rounded-lg">
                No hay prompts para patrocinios. Crea uno para comenzar.
              </div>
            ) : (
              <div className="space-y-2">
                {promptsAdjudicatarios.map((prompt) => (
                  <div
                    key={prompt.id}
                    className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{prompt.nombre}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            prompt.estado === "activado"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {prompt.estado === "activado" ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                        <div className="text-sm text-slate-600 space-y-1">
                          <p className="line-clamp-1"><strong>System:</strong> {prompt.system_prompt || "N/A"}</p>
                          <p className="line-clamp-1"><strong>User:</strong> {prompt.user_prompt || "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPrompt(prompt);
                            setOpenViewModal(true);
                          }}
                          title="Ver"
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditModal(prompt, "adjudicatarios")}
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleEstado(prompt.id, prompt.estado)}
                          title={prompt.estado === "activado" ? "Desactivar" : "Activar"}
                        >
                          <Power size={16} className={prompt.estado === "activado" ? "text-green-600" : "text-gray-400"} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePrompt(prompt, "adjudicatarios")}
                          title="Eliminar"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal Ver */}
      {openViewModal && selectedPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-96 overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{selectedPrompt.nombre}</h2>
                <button
                  onClick={() => setOpenViewModal(false)}
                  className="text-slate-500 hover:text-slate-700 text-2xl"
                >
                  Ã—
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm text-slate-600 mb-2">Tipo</h3>
                <p className="text-sm">{selectedPrompt.tipo || "entes"}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-600 mb-2">System Prompt</h3>
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded text-sm whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {selectedPrompt.system_prompt || "N/A"}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-600 mb-2">User Prompt</h3>
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded text-sm whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {selectedPrompt.user_prompt || "N/A"}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-600 mb-2">Estado</h3>
                <span className={`text-xs px-2 py-1 rounded font-medium inline-block ${
                  selectedPrompt.estado === "activado"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {selectedPrompt.estado === "activado" ? "Activo" : "Inactivo"}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-600 mb-2">Fechas</h3>
                <p className="text-xs text-slate-500">Creado: {new Date(selectedPrompt.creado_en).toLocaleString()}</p>
                <p className="text-xs text-slate-500">Actualizado: {new Date(selectedPrompt.actualizado_en).toLocaleString()}</p>
              </div>
              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" className="flex-1" onClick={() => setOpenViewModal(false)}>
                  Cerrar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Crear/Editar */}
      {openModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {selectedPrompt ? "Editar" : "Crear"} Prompt ({promptModalType})
                </h2>
                <button
                  onClick={() => {
                    setOpenModal(false);
                    setSelectedPrompt(null);
                    setFormData({ nombre: "", system_prompt: "", user_prompt: "" });
                  }}
                  className="text-slate-500 hover:text-slate-700 text-2xl"
                >
                  Ã—
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre</label>
                <Input
                  placeholder="Nombre del prompt"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">System Prompt</label>
                <Textarea
                  placeholder="Instrucciones del sistema para el agente..."
                  value={formData.system_prompt}
                  onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">User Prompt</label>
                <Textarea
                  placeholder="Prompt del usuario con variables ({{variable}})..."
                  value={formData.user_prompt}
                  onChange={(e) => setFormData({ ...formData, user_prompt: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => {
                    setOpenModal(false);
                    setSelectedPrompt(null);
                    setFormData({ nombre: "", system_prompt: "", user_prompt: "" });
                  }}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleSavePrompt}
                  disabled={saving}
                >
                  {saving ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PromptsView;
