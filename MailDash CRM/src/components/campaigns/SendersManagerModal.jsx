import React, { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import apiClient from "../../api/apiClient";
import SendersForm from "./SendersForm";
import SendersList from "./SendersList";

// LISTA CERRADA DE EMAILS PERMITIDOS
const ALLOWED_EMAILS = [
    "impulsainnovacion@canariasahora.com",
    "proyectos@fundacionemprende.org",
    "ac.analytics@mmi-e.com"
];

const SendersManagerModal = ({ isOpen, onClose, onUpdate }) => {
    const [senders, setSenders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Estado para controlar si estamos editando
    const [editingId, setEditingId] = useState(null);

    // Estado del formulario
    const [formData, setFormData] = useState({
        label: "",
        displayName: "",
        email: ALLOWED_EMAILS[0], // Por defecto el primero
        footerText: ""
    });

    useEffect(() => {
        if (isOpen) {
            loadSenders();
        }
    }, [isOpen]);

    const loadSenders = async () => {
        setIsLoading(true);
        try {
            const data = await apiClient.getSenders();
            const normalized = (Array.isArray(data) ? data : []).map(s => ({
                id: s.id,
                label: s.label,
                displayName: s.display_name || s.displayName,
                email: s.email,
                footerText: s.footer_text || s.footerText
            }));
            setSenders(normalized);
        } catch (err) {
            console.error("Error al cargar remitentes", err);
            setError("No se pudieron cargar los remitentes.");
        } finally {
            setIsLoading(false);
        }
    };

    // Cargar datos en el formulario para editar
    const handleEditClick = (sender) => {
        setEditingId(sender.id);
        setFormData({
            label: sender.label,
            displayName: sender.displayName,
            email: sender.email,
            footerText: sender.footerText
        });
        setError(null);
    };

    // Cancelar edición y limpiar form
    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({
            label: "",
            displayName: "",
            email: ALLOWED_EMAILS[0],
            footerText: ""
        });
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const payload = {
                ...formData,
                id: editingId
            };

            await apiClient.saveSender(payload);

            handleCancelEdit();
            await loadSenders();
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error(err);
            setError("Error al guardar el remitente.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Seguro que quieres eliminar este remitente?")) return;
        setIsLoading(true);
        try {
            await apiClient.deleteSender(id);
            if (editingId === id) handleCancelEdit();
            await loadSenders();
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error(err);
            setError("Error al eliminar.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                        Gestión de Remitentes
                    </h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                        <X size={24} />
                    </button>
                </div>

                {/* Body con Scroll */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {error && (
                        <div className="p-3 bg-red-100 text-red-700 rounded-lg flex items-center gap-2 text-sm">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    {/* Formulario de Creación / Edición */}
                    <SendersForm
                        formData={formData}
                        setFormData={setFormData}
                        editingId={editingId}
                        isLoading={isLoading}
                        ALLOWED_EMAILS={ALLOWED_EMAILS}
                        handleSubmit={handleSubmit}
                        handleCancelEdit={handleCancelEdit}
                    />

                    {/* Lista de Existentes */}
                    <SendersList
                        senders={senders}
                        editingId={editingId}
                        handleEditClick={handleEditClick}
                        handleDelete={handleDelete}
                    />

                </div>
            </div>
        </div>
    );
};

export default SendersManagerModal;
