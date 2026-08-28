import React, { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import apiClient from "../../api/apiClient";
import CtasForm from "./CtasForm";
import CtasList from "./CtasList";

const EMPTY_FORM = {
    label: "",
    category: "",
    buttonText: "",
    buttonUrl: "",
};

const CtasManagerModal = ({
    isOpen,
    onClose,
    onUpdate,
    setNotification,
    setConfirmProps,
    closeConfirm,
}) => {
    const [ctas, setCtas] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);

    const loadCtas = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await apiClient.getCtas();
            setCtas(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error cargando CTAs", err);
            setCtas([]);
            setNotification?.({
                type: "error",
                title: "Error de CTAs",
                message: "No se pudo cargar la biblioteca de CTAs.",
            });
        } finally {
            setIsLoading(false);
        }
    }, [setNotification]);

    useEffect(() => {
        if (isOpen) loadCtas();
    }, [isOpen, loadCtas]);

    const handleEditClick = (cta) => {
        setEditingId(cta.id);
        setFormData({
            label: cta.label || "",
            category: cta.category || "",
            buttonText: cta.buttonText || "",
            buttonUrl: cta.buttonUrl || "",
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData(EMPTY_FORM);
    };

    const runSave = async () => {
        setIsLoading(true);
        try {
            const isEdit = !!editingId;
            await apiClient.saveCta({
                id: editingId,
                ...formData,
            });
            handleCancelEdit();
            await loadCtas();
            onUpdate?.();
            setNotification?.({
                type: "success",
                title: isEdit ? "CTA actualizado" : "CTA creado",
                message: isEdit
                    ? "El CTA se actualizó correctamente."
                    : "El CTA se guardó correctamente.",
            });
        } catch (err) {
            console.error(err);
            setNotification?.({
                type: "error",
                title: "Error al guardar",
                message: "No se pudo guardar el CTA.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const isEdit = !!editingId;
        setConfirmProps?.({
            show: true,
            title: isEdit ? "Confirmar actualización" : "Confirmar guardado",
            message: isEdit
                ? "¿Quieres actualizar este CTA?"
                : "¿Quieres guardar este nuevo CTA?",
            confirmText: isEdit ? "Actualizar" : "Guardar",
            cancelText: "Cancelar",
            type: "info",
            onConfirm: async () => {
                closeConfirm?.();
                await runSave();
            },
        });
    };

    const runDelete = async (id) => {
        setIsLoading(true);
        try {
            await apiClient.deleteCta(id);
            if (editingId === id) handleCancelEdit();
            await loadCtas();
            onUpdate?.();
            setNotification?.({
                type: "success",
                title: "CTA eliminado",
                message: "El CTA se eliminó correctamente.",
            });
        } catch (err) {
            console.error(err);
            setNotification?.({
                type: "error",
                title: "Error al eliminar",
                message: "No se pudo eliminar el CTA.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const selected = ctas.find((cta) => cta.id === id);
        setConfirmProps?.({
            show: true,
            title: "Confirmar eliminación",
            message: `¿Seguro que quieres eliminar el CTA "${selected?.label || "sin etiqueta"}"?`,
            confirmText: "Eliminar",
            cancelText: "Cancelar",
            type: "danger",
            onConfirm: async () => {
                closeConfirm?.();
                await runDelete(id);
            },
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                        Biblioteca de CTAs
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    <CtasForm
                        formData={formData}
                        setFormData={setFormData}
                        editingId={editingId}
                        isLoading={isLoading}
                        handleSubmit={handleSubmit}
                        handleCancelEdit={handleCancelEdit}
                    />

                    <CtasList
                        ctas={ctas}
                        editingId={editingId}
                        handleEditClick={handleEditClick}
                        handleDelete={handleDelete}
                    />
                </div>
            </div>
        </div>
    );
};

export default CtasManagerModal;
