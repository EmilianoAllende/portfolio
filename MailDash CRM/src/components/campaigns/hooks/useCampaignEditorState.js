import { useState, useEffect, useMemo } from "react";

export const useCampaignEditorState = (campaignTemplates, setConfirmProps, closeConfirm, onSaveTemplate, onDeleteTemplate, onAddTemplate, setNotification) => {
    const [selectedTplId, setSelectedTplId] = useState("");
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const selectedTpl = useMemo(
        () => campaignTemplates.find((t) => t.id === selectedTplId) || null,
        [campaignTemplates, selectedTplId]
    );

    const [editingTpl, setEditingTpl] = useState(() =>
        selectedTpl ? JSON.parse(JSON.stringify(selectedTpl)) : null
    );

    const getUserName = () => {
        let currentUser = "Desconocido";
        try {
            const storedUser = localStorage.getItem("currentUser");
            if (storedUser) {
                if (storedUser.startsWith("{")) {
                    const parsed = JSON.parse(storedUser);
                    currentUser = parsed.usuario || parsed.username || parsed.name || "Usuario";
                } else {
                    currentUser = storedUser;
                }
            } else {
                currentUser = localStorage.getItem("usuario") || localStorage.getItem("username") || "Desconocido";
            }
        } catch (e) {
            console.warn("No se pudo recuperar el usuario", e);
        }
        return currentUser;
    };

    useEffect(() => {
        if (selectedTpl) {
            setEditingTpl(JSON.parse(JSON.stringify(selectedTpl)));
            setHasUnsavedChanges(false);
        } else if (!selectedTplId) {
            setEditingTpl(null);
            setHasUnsavedChanges(false);
        }
    }, [selectedTpl, selectedTplId]);

    const checkUnsavedChanges = (onProceed) => {
        if (hasUnsavedChanges) {
            const userName = getUserName();
            setConfirmProps({
                show: true,
                title: "Cambios sin guardar",
                message: `${userName} hay cambios sin guardar, ¿quieres proceder a abandonar la plantilla actual? Perderás todo lo que no hayas guardado.`,
                confirmText: "SI",
                cancelText: "NO",
                type: "warning",
                onConfirm: () => {
                    setHasUnsavedChanges(false);
                    onProceed();
                    closeConfirm();
                },
                onCancel: () => closeConfirm()
            });
        } else {
            onProceed();
        }
    };

    const handleSelectTemplate = (id) => {
        if (id === selectedTplId) return;
        checkUnsavedChanges(() => setSelectedTplId(id));
    };

    const handleFieldChange = (path, value) => {
        if (!editingTpl) return;
        setHasUnsavedChanges(true);
        setEditingTpl((prev) => {
            if (!prev) return prev;
            const next = JSON.parse(JSON.stringify(prev));
            const segs = path.split(".");
            let obj = next;
            for (let i = 0; i < segs.length - 1; i++) {
                const k = segs[i];
                obj[k] = obj[k] || {};
                obj = obj[k];
            }
            obj[segs[segs.length - 1]] = value;
            return next;
        });
    };

    const handleDynamicContentChange = (typeId, field, value) => {
        if (!editingTpl) return;
        const next = JSON.parse(JSON.stringify(editingTpl));
        if (!next.builder) next.builder = {};
        if (!next.builder.dynamicContent) next.builder.dynamicContent = {};
        if (!next.builder.dynamicContent[typeId]) next.builder.dynamicContent[typeId] = {};
        next.builder.dynamicContent[typeId][field] = value;
        setEditingTpl(next);
        setHasUnsavedChanges(true);
    };

    const saveTemplate = () => {
        if (!editingTpl || !editingTpl.title || !editingTpl.id) return;
        const now = new Date().toISOString();
        const toSave = {
            ...editingTpl,
            updatedAt: now,
            createdAt: editingTpl.createdAt || now
        };
        onSaveTemplate?.(toSave);
        setHasUnsavedChanges(false);
        return toSave;
    };

    const deleteTemplate = () => {
        if (!editingTpl) return;
        onDeleteTemplate?.(editingTpl.id);
        setHasUnsavedChanges(false);
        setSelectedTplId("");
        setEditingTpl(null);
    };

    const addTemplate = () => {
        checkUnsavedChanges(() => {
            const currentUser = getUserName();
            const baseId = "custom_" + Date.now();
            const now = new Date().toISOString();
            const draft = {
                id: baseId,
                title: "Nueva campaña",
                placeholder: "Descripción breve...",
                mode: "builder",
                active: true,
                created_by: currentUser,
                author: currentUser,
                createdAt: now,
                updatedAt: now,
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
            setHasUnsavedChanges(true);
            setSelectedTplId(baseId);
        });
    };

    const handleUseTemplate = () => {
        if (!editingTpl) return;
        
        const currentUser = getUserName();
        const baseId = "custom_" + Date.now();
        const now = new Date().toISOString();
        
        const duplicatedTpl = JSON.parse(JSON.stringify(editingTpl));
        
        let newTitle = duplicatedTpl.title || "Plantilla";
        if (!newTitle.includes("(Copia)")) {
            newTitle = newTitle + " (Copia)";
        }
        
        duplicatedTpl.id = baseId;
        duplicatedTpl.title = newTitle;
        duplicatedTpl.created_by = currentUser;
        duplicatedTpl.author = currentUser;
        duplicatedTpl.createdAt = now;
        duplicatedTpl.updatedAt = now;
        duplicatedTpl.active = true;
        
        if (onAddTemplate) onAddTemplate(duplicatedTpl);
        setEditingTpl(duplicatedTpl);
        setHasUnsavedChanges(true);
        setSelectedTplId(baseId);
    };

    const handleApplyCta = (selectedCta) => {
        if (!selectedCta) return;
        setEditingTpl((prev) => {
            if (!prev) return prev;
            const next = JSON.parse(JSON.stringify(prev));
            next.builder = next.builder || {};
            next.builder.buttonText = selectedCta.buttonText || "";
            next.builder.buttonUrl = selectedCta.buttonUrl || "";
            next.builder.ctaId = selectedCta.id || null;
            return next;
        });
        setHasUnsavedChanges(true);
    };

    const handleClearCta = () => {
        const hadCtaApplied = Boolean(
            editingTpl?.builder?.ctaId ||
            editingTpl?.builder?.buttonText ||
            editingTpl?.builder?.buttonUrl
        );

        setEditingTpl((prev) => {
            if (!prev) return prev;
            const next = JSON.parse(JSON.stringify(prev));
            next.builder = next.builder || {};
            next.builder.buttonText = "";
            next.builder.buttonUrl = "";
            next.builder.ctaId = null;
            return next;
        });
        setHasUnsavedChanges(true);

        if (hadCtaApplied && setNotification) {
            setNotification({
                type: "success",
                title: "CTA removido",
                message: "Se limpió el CTA seleccionado.",
            });
        }
    };

    return {
        selectedTplId,
        editingTpl,
        hasUnsavedChanges,
        handleSelectTemplate,
        handleFieldChange,
        handleDynamicContentChange,
        saveTemplate,
        deleteTemplate,
        addTemplate,
        handleUseTemplate,
        handleApplyCta,
        handleClearCta
    };
};
