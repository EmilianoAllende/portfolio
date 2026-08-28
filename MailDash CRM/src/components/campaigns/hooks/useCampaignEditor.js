import React from "react";
import { SENDER_OPTIONS } from "../constants";

export const useCampaignEditor = ({
    campaignTemplates = [],
    onSaveTemplate,
    onDeleteTemplate,
    onAddTemplate,
    onSelectTemplateForSend,
    setConfirmProps,
    closeConfirm,
}) => {
    const [selectedTplId, setSelectedTplId] = React.useState(
        campaignTemplates[0]?.id || ""
    );
    
    // Derived state for the selected template object
    const selectedTpl = React.useMemo(
        () => campaignTemplates.find((t) => t.id === selectedTplId) || null,
        [campaignTemplates, selectedTplId]
    );

    // State for the template being edited (draft)
    const [editingTpl, setEditingTpl] = React.useState(() =>
        selectedTpl ? JSON.parse(JSON.stringify(selectedTpl)) : null
    );

    // State for the active organization type tab
    const [activeOrgType, setActiveOrgType] = React.useState("AYUNTAMIENTO");

    // Sync editingTpl when selectedTpl changes
    React.useEffect(() => {
        setEditingTpl(selectedTpl ? JSON.parse(JSON.stringify(selectedTpl)) : null);
    }, [selectedTpl]);

    // Auto-select first template if none selected, or clear if empty
    React.useEffect(() => {
        if (!selectedTplId && campaignTemplates.length > 0) {
            setSelectedTplId(campaignTemplates[0].id);
        } else if (campaignTemplates.length === 0) {
            setSelectedTplId("");
        }
    }, [campaignTemplates, selectedTplId]);

    const handleFieldChange = (path, value) => {
        if (!editingTpl) return;
        const next = JSON.parse(JSON.stringify(editingTpl));
        const segs = path.split(".");
        let obj = next;
        for (let i = 0; i < segs.length - 1; i++) {
            const k = segs[i];
            obj[k] = obj[k] || {};
            obj = obj[k];
        }
        obj[segs[segs.length - 1]] = value;
        setEditingTpl(next);
    };

    const handleDynamicContentChange = (typeId, field, value) => {
        if (!editingTpl) return;
        const next = JSON.parse(JSON.stringify(editingTpl));
        // Ensure structure exists
        if (!next.builder) next.builder = {};
        if (!next.builder.dynamicContent) next.builder.dynamicContent = {};
        if (!next.builder.dynamicContent[typeId]) next.builder.dynamicContent[typeId] = {};
        // Save value
        next.builder.dynamicContent[typeId][field] = value;
        setEditingTpl(next);
    };

    const saveTemplate = () => {
        if (!editingTpl) return;
        if (!editingTpl.title || !editingTpl.id) return;
        onSaveTemplate?.(editingTpl);
    };

    const deleteTemplate = () => {
        if (!editingTpl) return;
        onDeleteTemplate?.(editingTpl.id);
        setSelectedTplId("");
        setEditingTpl(null);
    };

    const addTemplate = () => {
        // 1. Recover logged-in user (Robust logic)
        let currentUser = "Desconocido";
        try {
            const storedUser = localStorage.getItem("currentUser");
            if (storedUser) {
                // If it's a JSON object
                if (storedUser.startsWith("{")) {
                    const parsed = JSON.parse(storedUser);
                    currentUser = parsed.usuario || parsed.username || parsed.name || "Usuario";
                } else {
                    // If simple string
                    currentUser = storedUser;
                }
            } else {
                // Fallback to simple keys
                currentUser = localStorage.getItem("usuario") || localStorage.getItem("username") || "Desconocido";
            }
        } catch (e) {
            console.warn("No se pudo recuperar el usuario al crear template", e);
        }

        const baseId = "custom_" + Date.now();
        
        const draft = {
            id: baseId,
            title: "Nueva campaña",
            placeholder: "Descripción breve...",
            mode: "builder",
            created_by: currentUser,
            author: currentUser,
            rawPrompt: "",
            builder: {
                campaignType: "personalizada",
                instructions: "",
                examplesGood: "",
                examplesBad: "",
                useMetadata: true,
                senderName: "",
                buttonText: "",
                buttonUrl: "",
            },
        };

        if (onAddTemplate) onAddTemplate(draft);
        setEditingTpl(draft);
        setSelectedTplId(baseId);
    };

    const handleSaveClick = () => {
        if (!editingTpl) return;
        setConfirmProps({
            show: true,
            title: "Guardar Cambios",
            message: `¿Seguro que quieres guardar los cambios en la plantilla "${editingTpl.title}"?`,
            confirmText: "Sí, guardar",
            cancelText: "No, volver",
            type: "info",
            onConfirm: () => {
                saveTemplate();
                closeConfirm();
            },
        });
    };

    const handleDeleteClick = () => {
        if (!editingTpl) return;
        setConfirmProps({
            show: true,
            title: "Eliminar Plantilla",
            message: `¿Seguro que quieres eliminar la plantilla "${editingTpl.title}"? Esta acción no se puede deshacer.`,
            confirmText: "Sí, eliminar",
            cancelText: "No, volver",
            type: "danger",
            onConfirm: () => {
                deleteTemplate();
                closeConfirm();
            },
        });
    };

    const handleUseClick = () => {
        if (!editingTpl) return;
        setConfirmProps({
            show: true,
            title: "Seleccionar Plantilla",
            message: `¿Quieres seleccionar "${editingTpl.title}" para tu próximo envío?`,
            confirmText: "Sí, seleccionar",
            cancelText: "No, volver",
            type: "info",
            onConfirm: () => {
                onSelectTemplateForSend?.(editingTpl.id);
                closeConfirm();
            },
        });
    };

    return {
        selectedTplId,
        setSelectedTplId,
        editingTpl,
        setEditingTpl,
        activeOrgType,
        setActiveOrgType,
        handleFieldChange,
        handleDynamicContentChange,
        handleAddTemplate: addTemplate,
        handleSaveClick,
        handleDeleteClick,
        handleUseClick
    };
};
