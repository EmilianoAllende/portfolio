import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Send, Filter, Building2, MapPin, Sparkles, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { Button } from "../../common/ui/button";
import { Card, CardContent, CardHeader } from "../../common/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../common/ui/select";
import { promptsAPI } from "../api/apiClient";

// FunciÃ³n para detectar y generar error de red amigable
const getNetworkErrorMessage = (error) => {
  if (error?.code === "ERR_NETWORK" || error?.message === "Network Error") {
    return "âŒ Error de conexiÃ³n: El servidor n8n no estÃ¡ disponible. Por favor intenta en unos minutos.";
  }
  if (error?.response?.status === 404) {
    return "âŒ Error: El webhook no fue encontrado. Verifica la configuraciÃ³n.";
  }
  if (error?.response?.status >= 500) {
    return "âŒ Error del servidor: El servidor n8n estÃ¡ teniendo problemas. Por favor intenta mÃ¡s tarde.";
  }
  return "âŒ Error de conexiÃ³n. Por favor verifica tu conexiÃ³n a internet e intenta de nuevo.";
};

const SendPatrociniosEmailsButton = ({ patrocinios = [] }) => {
  const [step, setStep] = useState(null); // null, "redactar", "preview", "enviando"
  const [loading, setLoading] = useState(false);
  const [selectedTerritory, setSelectedTerritory] = useState("all");
  const [selectedPatrocinios, setSelectedPatrocinios] = useState(new Set());
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [preview, setPreview] = useState(null); // { asunto, cuerpo_html }
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingAsunto, setEditingAsunto] = useState("");
  const [editingCuerpo, setEditingCuerpo] = useState("");

  // Cargar prompts disponibles
  useEffect(() => {
    const loadPrompts = async () => {
      try {
        const data = await promptsAPI.getAll();
        console.log("ðŸ“‹ Todos los prompts cargados:", data);
        
        // Filtrar SOLO prompts de "adjudicatarios" y que estÃ©n activos
        const filteredPrompts = (data || []).filter(
          (p) => p.tipo === "adjudicatarios" && (p.estado === "activado" || p.estado === "activo")
        );
        
        console.log("âœ… Prompts de Adjudicatarios filtrados:", filteredPrompts);
        
        setPrompts(filteredPrompts);
        if (filteredPrompts.length > 0) {
          setSelectedPrompt(filteredPrompts[0].id);
          console.log(`ðŸŽ¯ Prompt seleccionado por defecto: ${filteredPrompts[0].nombre}`);
        } else {
          console.warn("âš ï¸ No se encontraron prompts de adjudicatarios activos");
        }
      } catch (error) {
        console.error("âŒ Error cargando prompts:", error);
      }
    };
    loadPrompts();
  }, []);

  const filterPatrocinios = useCallback((list, territory) => {
    return list.filter((p) => {
      // Filtro por territorio
      if (territory && territory !== "all") {
        const normalize = (str) =>
          (str || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/-/g, " ");

        const territorioPatrocinio = normalize(p.territorio || "");
        const territorioFiltro = normalize(territory);

        if (!territorioPatrocinio.includes(territorioFiltro)) return false;
      }

      return true;
    });
  }, []);

  const filteredRecipients = useMemo(() => {
    return filterPatrocinios(patrocinios, selectedTerritory).map((p) => ({
      id: p.licitacion_id || p.patrocinio_id || p.id,
      name: p.titulo || "Sin tÃ­tulo",
      territory: p.territorio || "Sin territorio",
      email_contacto: p.email_contacto || "",
      ...p,
    }));
  }, [filterPatrocinios, patrocinios, selectedTerritory]);

  const handleTogglePatrocinio = (patrocinioId) => {
    const newSelected = new Set(selectedPatrocinios);
    if (newSelected.has(patrocinioId)) {
      newSelected.delete(patrocinioId);
    } else {
      newSelected.add(patrocinioId);
    }
    setSelectedPatrocinios(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedPatrocinios.size === filteredRecipients.length && filteredRecipients.length > 0) {
      setSelectedPatrocinios(new Set());
    } else {
      setSelectedPatrocinios(new Set(filteredRecipients.map((p) => p.id)));
    }
  };

  // Generar preview del primer patrocinio seleccionado
  const handleGenerarPreview = async () => {
    setLoading(true);
    setError("");
    try {
      const selectedPatrociniosList = patrocinios.filter((p) =>
        selectedPatrocinios.has(p.licitacion_id || p.patrocinio_id || p.id)
      );

      if (!selectedPatrociniosList.length) {
        setError("Debes seleccionar al menos un patrocinio");
        setLoading(false);
        return;
      }

      // Llamar a preview para el PRIMER patrocinio
      const firstPatrocinio = selectedPatrociniosList[0];
      const response = await fetch(
        "https://n8n.icc-e.org/webhook/preview-mail-patrocinios",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patrocinio: firstPatrocinio,
            promptId: selectedPrompt,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("ðŸ“¨ Respuesta del preview:", data);
        
        const previewData = Array.isArray(data) ? data[0] : data;
        
        console.log("âœ… Preview parseado:", previewData);
        
        setPreview({
          asunto: previewData?.asunto || "Sin asunto",
          cuerpo_html: previewData?.cuerpo_html || "Sin contenido",
        });
        setStep("preview");
      } else {
        setError("Error al generar preview del email");
      }
    } catch (error) {
      console.error("Error:", error);
      setError(getNetworkErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // Entrar en modo ediciÃ³n
  const handleEditarPreview = () => {
    setEditingAsunto(preview?.asunto || "");
    setEditingCuerpo(preview?.cuerpo_html || "");
    setIsEditing(true);
  };

  // Guardar cambios de ediciÃ³n
  const handleGuardarEdicion = () => {
    setPreview({
      asunto: editingAsunto,
      cuerpo_html: editingCuerpo,
    });
    setIsEditing(false);
  };

  // Cancelar ediciÃ³n
  const handleCancelarEdicion = () => {
    setIsEditing(false);
  };

  // Enviar emails a todos los patrocinios seleccionados
  const handleConfirmarEnvio = async () => {
    setLoading(true);
    setError("");
    setProgress({ current: 0, total: selectedPatrocinios.size });
    setStep("enviando");

    try {
      const selectedPatrociniosList = patrocinios.filter((p) =>
        selectedPatrocinios.has(p.licitacion_id || p.patrocinio_id || p.id)
      );

      const response = await fetch(
        "https://n8n.icc-e.org/webhook/enviar-mails-patrocinios-completo",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patrocinios: selectedPatrociniosList,
            asunto: preview.asunto,
            cuerpo_html: preview.cuerpo_html,
          }),
        }
      );

      if (response.ok) {
        // Simular progreso mientras se envÃ­an
        for (let i = 1; i <= selectedPatrocinios.size; i++) {
          await new Promise((resolve) => setTimeout(resolve, 300));
          setProgress({ current: i, total: selectedPatrocinios.size });
        }
        
        // Mostrar Ã©xito
        setTimeout(() => {
          setError("");
          setStep("enviando");
          setTimeout(() => {
            showSuccessMessage();
            closeModal();
          }, 1500);
        }, 300);
      } else {
        setError("Error al enviar los correos. Intenta de nuevo.");
        setStep("preview");
      }
    } catch (error) {
      console.error("Error:", error);
      setError(getNetworkErrorMessage(error));
      setStep("preview");
    } finally {
      setLoading(false);
    }
  };

  const showSuccessMessage = () => {
    alert(`âœ… Correos enviados exitosamente a ${selectedPatrocinios.size} patrocinios`);
  };

  const closeModal = () => {
    setStep(null);
    setSelectedPatrocinios(new Set());
    setSelectedTerritory("all");
    setPreview(null);
    setProgress({ current: 0, total: 0 });
    setError("");
  };

  const territories = [
    { value: "all", label: "Todos los territorios" },
    { value: "andalucia", label: "AndalucÃ­a" },
    { value: "almeria", label: "AlmerÃ­a" },
    { value: "cadiz", label: "CÃ¡diz" },
    { value: "cordoba", label: "CÃ³rdoba" },
    { value: "granada", label: "Granada" },
    { value: "huelva", label: "Huelva" },
    { value: "jaen", label: "JaÃ©n" },
    { value: "malaga", label: "MÃ¡laga" },
    { value: "sevilla", label: "Sevilla" },
    { value: "canarias", label: "Canarias" },
    { value: "las-palmas", label: "Las Palmas" },
    { value: "tenerife", label: "Tenerife" },
    { value: "comunidad-de-madrid", label: "Madrid" },
    { value: "catalunya", label: "CataluÃ±a" },
    { value: "barcelona", label: "Barcelona" },
  ];

  return (
    <>
      <Button
        onClick={() => setStep("redactar")}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        <Send size={16} className="mr-2" />
        Enviar Mails
      </Button>

      {step && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                {step === "redactar" && (
                  <>
                    <Sparkles size={20} />
                    Enviar Correos - SelecciÃ³n
                  </>
                )}
                {step === "preview" && (
                  <>
                    <Sparkles size={20} />
                    Vista Previa del Email
                  </>
                )}
                {step === "enviando" && (
                  <>
                    <Send size={20} />
                    Enviando Correos...
                  </>
                )}
              </h2>
              {step === "redactar" && (
                <p className="text-xs text-slate-500 mt-1">
                  Paso 1: Selecciona los patrocinios y el prompt para generar una vista previa
                </p>
              )}
              {step === "preview" && (
                <p className="text-xs text-slate-500 mt-1">
                  Paso 2: Verifica el email que serÃ¡ enviado a {selectedPatrocinios.size} patrocinios
                </p>
              )}
              {step === "enviando" && (
                <p className="text-xs text-slate-500 mt-1">
                  Paso 3: Enviando correos... Por favor, espera
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* PASO 1: SELECCIÃ“N */}
              {step === "redactar" && (
                <>
                  {/* SelecciÃ³n de Prompt */}
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 space-y-3">
                    <label className="text-sm font-medium">Selecciona un Prompt IA</label>
                    <Select value={selectedPrompt} onValueChange={setSelectedPrompt}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un prompt" />
                      </SelectTrigger>
                      <SelectContent>
                        {prompts.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {prompts.length === 0 && (
                      <p className="text-xs text-slate-500">
                        No hay prompts disponibles para patrocinios
                      </p>
                    )}
                  </div>

                  {/* Filtros */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-4">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <Filter size={16} />
                      Filtros de SegmentaciÃ³n
                    </h3>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <MapPin size={14} />
                        Territorio
                      </label>
                      <Select value={selectedTerritory} onValueChange={setSelectedTerritory}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {territories.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Patrocinios filtrados */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        <Building2 size={16} />
                        Patrocinios ({selectedPatrocinios.size}/{filteredRecipients.length})
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAll}
                        className="whitespace-nowrap"
                      >
                        {selectedPatrocinios.size === filteredRecipients.length &&
                        filteredRecipients.length > 0
                          ? "Deseleccionar"
                          : "Seleccionar"}
                        {" "}todo
                      </Button>
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-3">
                      {filteredRecipients.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                          <p>No hay patrocinios con los filtros seleccionados</p>
                        </div>
                      ) : (
                        filteredRecipients.map((patrocinio) => {
                          const isSelected = selectedPatrocinios.has(patrocinio.id);
                          return (
                            <label
                              key={patrocinio.id}
                              className="flex items-start gap-3 border rounded p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50"
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleTogglePatrocinio(patrocinio.id)}
                                className="mt-1"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium">{patrocinio.name}</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                  {patrocinio.territory}
                                </p>
                              </div>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Errores */}
                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex gap-2">
                      <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                    </div>
                  )}

                  {/* Botones */}
                  <div className="flex gap-3 justify-end border-t pt-4">
                    <Button variant="outline" onClick={closeModal}>
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleGenerarPreview}
                      disabled={loading || selectedPatrocinios.size === 0 || !selectedPrompt}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {loading ? "Generando vista previa..." : `Ver Preview (${selectedPatrocinios.size})`}
                    </Button>
                  </div>
                </>
              )}

              {/* PASO 2: VISTA PREVIA */}
              {step === "preview" && preview && (
                <>
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex gap-2">
                    <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-200">
                      Este email serÃ¡ enviado a <strong>{selectedPatrocinios.size} patrocinios</strong>. Verifica que el contenido sea correcto antes de confirmar.
                    </p>
                  </div>

                  {!isEditing ? (
                    <>
                      {/* VISTA PREVIA NORMAL */}
                      <div className="border rounded-lg overflow-hidden shadow-md bg-white dark:bg-slate-900">
                        {/* Email Header */}
                        <div className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">De:</span>
                            <span className="text-sm text-slate-700 dark:text-slate-300">proyectos@fundacionemprende.org</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Asunto:</span>
                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{preview.asunto}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Fecha:</span>
                            <span className="text-xs text-slate-600 dark:text-slate-400">{new Date().toLocaleDateString('es-ES')}</span>
                          </div>
                        </div>

                        {/* Email Content */}
                        <div className="bg-white p-6 max-h-96 overflow-y-auto">
                          <div
                            className="text-black"
                            dangerouslySetInnerHTML={{ __html: preview.cuerpo_html }}
                          />
                        </div>

                        {/* Email Footer */}
                        <div className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4">
                          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                            Este es un email automatizado. Por favor, no responda a este mensaje.
                          </p>
                        </div>
                      </div>

                      {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex gap-2">
                          <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                        </div>
                      )}

                      {/* Botones */}
                      <div className="flex gap-3 justify-end border-t pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setStep("redactar")}
                          disabled={loading}
                        >
                          â† Volver a Editar
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleEditarPreview}
                          disabled={loading}
                        >
                          âœï¸ Editar Email
                        </Button>
                        <Button
                          onClick={() => setShowConfirmDialog(true)}
                          disabled={loading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {loading ? "Iniciando envÃ­o..." : `Enviar a ${selectedPatrocinios.size} Patrocinios`}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* VISTA EDICIÃ“N */}
                      <div className="space-y-4 border rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold">Asunto:</label>
                          <input
                            type="text"
                            value={editingAsunto}
                            onChange={(e) => setEditingAsunto(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                            placeholder="Asunto del email"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-semibold">Contenido HTML:</label>
                          <textarea
                            value={editingCuerpo}
                            onChange={(e) => setEditingCuerpo(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-xs"
                            placeholder="Contenido HTML del email"
                            rows={12}
                          />
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                          <p className="text-xs text-blue-700 dark:text-blue-200">
                            ðŸ’¡ Puedes editar el asunto y el contenido HTML. Los cambios se aplicarÃ¡n cuando guardes.
                          </p>
                        </div>
                      </div>

                      {/* Botones de ediciÃ³n */}
                      <div className="flex gap-3 justify-end border-t pt-4">
                        <Button
                          variant="outline"
                          onClick={handleCancelarEdicion}
                          disabled={loading}
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleGuardarEdicion}
                          disabled={loading}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          ðŸ’¾ Guardar Cambios
                        </Button>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* PASO 3: ENVIANDO */}
              {step === "enviando" && (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3">
                      <Loader size={24} className="animate-spin text-blue-600" />
                      <div>
                        <p className="font-semibold">
                          Enviando... {progress.current}/{progress.total}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Por favor espera mientras se envÃ­an los correos
                        </p>
                      </div>
                    </div>

                    {/* Barra de progreso */}
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`,
                        }}
                      />
                    </div>

                    {/* Detalle de progreso */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                      <p className="text-sm text-blue-700 dark:text-blue-200">
                        {progress.current === progress.total && progress.total > 0 ? (
                          <>
                            <CheckCircle className="inline mr-2" size={16} />
                            Â¡Todos los correos han sido enviados correctamente!
                          </>
                        ) : (
                          <>
                            Se han enviado {progress.current} de {progress.total} correos
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Modal de ConfirmaciÃ³n */}
          {showConfirmDialog && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-amber-700">
                    <AlertCircle size={20} />
                    Confirmar EnvÃ­o de Emails
                  </h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 space-y-3">
                    <p className="text-sm">
                      <span className="font-semibold">Patrocinios:</span> {selectedPatrocinios.size}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Asunto:</span> {preview?.asunto}
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-200 mt-3">
                      âš ï¸ Esta acciÃ³n enviarÃ¡ los correos a todos los patrocinios seleccionados. No se puede deshacer.
                    </p>
                  </div>

                  <div className="flex gap-3 justify-end border-t pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowConfirmDialog(false)}
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => {
                        setShowConfirmDialog(false);
                        handleConfirmarEnvio();
                      }}
                      disabled={loading}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {loading ? "Enviando..." : "SÃ­, Enviar"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default SendPatrociniosEmailsButton;
