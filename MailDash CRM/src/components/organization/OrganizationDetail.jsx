import React, { useState, useEffect } from "react";
import apiClient from "../../api/apiClient"; // Asegúrate de importar el cliente API
import { PlusCircle, X, Save, Calendar, User, FileText } from "lucide-react";

import DetailHeader from "./DetailHeader";
import ContactInfo from "./ContactInfo";
import ActivityAndTopics from "./ActivityAndTopics";
import CommercialObservations from "./CommercialObservations";
import DetailActions from "./DetailActions";
import StatusBadge from "../common/StatusBadge";

// --- COMPONENTE MODAL INTERNO PARA REGISTRO MANUAL ---
const ManualLogModal = ({ show, onClose, onSave, isSaving }) => {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0], // Hoy por defecto
        user: "",
        campaign_title: "",
        notes: ""
    });

    // Recuperar usuario actual del localStorage para autocompletar
    useEffect(() => {
        if (show) {
            try {
                const storedUser = localStorage.getItem("currentUser");
                let username = "";
                if (storedUser) {
                    if (storedUser.startsWith("{")) {
                        const parsed = JSON.parse(storedUser);
                        username = parsed.usuario || parsed.username || parsed.name || "";
                    } else {
                        username = storedUser;
                    }
                }
                setFormData(prev => ({ ...prev, user: username }));
            } catch (e) {
                console.warn("Error recuperando usuario", e);
            }
        }
    }, [show]);

    if (!show) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700 animate-scaleIn">
                <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <PlusCircle size={20} className="text-blue-600" />
                        Agregar Actividad Manual
                    </h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* FECHA */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Fecha de la actividad
                        </label>
                        <div className="relative">
                            <Calendar size={16} className="absolute left-3 top-3 text-slate-400" />
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* USUARIO */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Usuario Responsable
                        </label>
                        <div className="relative">
                            <User size={16} className="absolute left-3 top-3 text-slate-400" />
                            <input
                                type="text"
                                required
                                placeholder="Ej: juan.perez"
                                value={formData.user}
                                onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                                className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* TÍTULO DE CAMPAÑA / ACCIÓN */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Nombre de Campaña / Acción
                        </label>
                        <div className="relative">
                            <FileText size={16} className="absolute left-3 top-3 text-slate-400" />
                            <input
                                type="text"
                                required
                                placeholder="Ej: Llamada telefónica / Campaña Navidad"
                                value={formData.campaign_title}
                                onChange={(e) => setFormData({ ...formData, campaign_title: e.target.value })}
                                className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                        >
                            {isSaving ? "Guardando..." : (
                                <>
                                    <Save size={16} /> Guardar Registro
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---

const OrganizationDetail = ({
    selectedOrg,
    setSelectedOrg,
    openEditModal,
    setShowCampaignModal,
    selectedCampaignId,
    onSelectCampaignRequired,
    onBack,
    setNotification,
    onRefresh,
    setConfirmProps,
    closeConfirm,
    scrollToContactado,
}) => {
    const [shouldFocusContactado, setShouldFocusContactado] = useState(false);
    const [showManualLogModal, setShowManualLogModal] = useState(false);
    const [isSavingLog, setIsSavingLog] = useState(false);

    // Detectar si viene del click en tabla y auto-abrir edición
    useEffect(() => {
        if (scrollToContactado) {
            setShouldFocusContactado(true);
            setTimeout(() => setShouldFocusContactado(false), 100);
        }
    }, [scrollToContactado]);

    if (!selectedOrg) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <p>Selecciona una organización de la lista para ver sus detalles.</p>
                </div>
            </div>
        );
    }

    // --- MANEJO DEL GUARDADO MANUAL ---
    const handleSaveManualLog = async (data) => {
        setIsSavingLog(true);
        try {
            await apiClient.addManualLog(selectedOrg.id, data);
            
            setNotification({
                type: "success",
                title: "Historial Actualizado",
                message: "Se ha agregado el registro manual correctamente."
            });
            setShowManualLogModal(false);
            
            // Refrescar datos para ver el cambio
            if (onRefresh) await onRefresh();
            
        } catch (error) {
            console.error("Error guardando log manual:", error);
            setNotification({
                type: "error",
                title: "Error",
                message: "No se pudo guardar el registro manual."
            });
        } finally {
            setIsSavingLog(false);
        }
    };

    let metadata = {};
    try {
        if (
            typeof selectedOrg.metadata === "string" &&
            selectedOrg.metadata !== "indefinido"
        ) {
            metadata = JSON.parse(selectedOrg.metadata);
        }
    } catch (e) {
        console.error("Error al parsear metadata:", e);
    }

    const orgInfo = metadata.organizacion || {};

    return (
        <div className="space-y-6 max-h-auto overflow-y-auto pr-2 p-4 relative">
            <DetailHeader
                selectedOrg={selectedOrg}
                orgInfo={orgInfo}
                StatusBadge={StatusBadge}
                onBack={onBack}
            />
            
            <ContactInfo selectedOrg={selectedOrg} orgInfo={orgInfo} />

            {/* BOTÓN FLOTANTE O EN SECCIÓN PARA AGREGAR HISTORIAL */}
            <div className="w-full flex justify-end px-2 -mb-4 z-10 relative">
                <button 
                    onClick={() => setShowManualLogModal(true)}
                    className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors border border-blue-200"
                >
                    <PlusCircle size={14} />
                    Agregar Evento Pasado
                </button>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                <ActivityAndTopics selectedOrg={selectedOrg} orgInfo={orgInfo} />

                <CommercialObservations 
                    selectedOrg={selectedOrg} 
                    setSelectedOrg={setSelectedOrg}
                    setNotification={setNotification}
                    onRefresh={onRefresh}
                    setConfirmProps={setConfirmProps}
                    closeConfirm={closeConfirm}
                    shouldFocusContactado={shouldFocusContactado}
                />
            </div>

            <DetailActions
                selectedOrg={selectedOrg}
                openEditModal={openEditModal}
                setShowCampaignModal={setShowCampaignModal}
                selectedCampaignId={selectedCampaignId}
                onSelectCampaignRequired={onSelectCampaignRequired}
            />

            {/* MODAL DE CARGA MANUAL */}
            <ManualLogModal 
                show={showManualLogModal}
                onClose={() => setShowManualLogModal(false)}
                onSave={handleSaveManualLog}
                isSaving={isSavingLog}
            />
        </div>
    );
};

export default OrganizationDetail;
