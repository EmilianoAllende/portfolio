import { useCallback, useEffect, useMemo, useState } from "react";
import apiClient from "../../../api/apiClient";
import {
    normalizeMediaFollowupResponse,
    normalizeSender,
    DEFAULT_MEDIA_FOLLOWUP_SENDER_ID,
    FALLBACK_MEDIA_FOLLOWUP_SENDER,
} from "../utils/normalizationUtils";
import { formatDateTime, getScheduledFollowupDate } from "../utils/dateUtils";
import { getStatusSummary } from "../utils/statusUtils";

const IS_LOCALHOST = typeof window !== "undefined" && window.location.hostname === "localhost";

export function useMediaFollowup({
    setNotification,
    setConfirmProps,
    closeConfirm,
    availableSenders = [],
    isLoadingSenders = false,
    onRefreshSenders,
    organizaciones = [],
    saveContact,
    isSaving,
}) {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [openPressModal, setOpenPressModal] = useState(false);
    const [openEditorModal, setOpenEditorModal] = useState(false);
    const [openEmailEditModal, setOpenEmailEditModal] = useState(false);
    const [isUpdatingEnvio, setIsUpdatingEnvio] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [regenerateError, setRegenerateError] = useState(null);
    const [activeFilter, setActiveFilter] = useState("pending");
    const [searchQuery, setSearchQuery] = useState("");
    const [devTimezone, setDevTimezone] = useState(null);

    useEffect(() => {
        if (availableSenders.length > 0 || isLoadingSenders || typeof onRefreshSenders !== "function") return;
        onRefreshSenders();
    }, [availableSenders.length, isLoadingSenders, onRefreshSenders]);

    const loadMediaFollowup = useCallback(async (preferredSelectedId = null) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.getMediaFollowupEmails();
            const normalized = normalizeMediaFollowupResponse(response);
            setItems(normalized);
            setSelectedId((current) => {
                const candidateId = preferredSelectedId || current;
                if (candidateId && normalized.some((item) => item.id === candidateId)) return candidateId;
                return normalized[0]?.id || null;
            });
        } catch (requestError) {
            console.error("Error cargando seguimiento de medios:", requestError);
            setError("No se pudieron cargar los correos del flujo de seguimiento de medios.");
            setNotification?.({ type: "error", title: "Seguimiento de medios", message: "No se pudieron cargar los correos pendientes desde n8n." });
        } finally {
            setIsLoading(false);
        }
    }, [setNotification]);

    useEffect(() => {
        let active = true;
        const load = async () => { if (active) await loadMediaFollowup(); };
        load();
        return () => { active = false; };
    }, [loadMediaFollowup]);

    const stats = useMemo(() => ({
        total: items.length,
        pendientes: items.filter((i) => i.envio === "pendiente").length,
        sinConfirmar: items.filter((i) => i.envio === "pendiente" && i.revision !== "confirmado").length,
        confirmados: items.filter((i) => i.envio === "pendiente" && i.revision === "confirmado").length,
        enviados: items.filter((i) => i.envio === "enviado").length,
        descartados: items.filter((i) => i.envio === "descartado").length,
    }), [items]);

    const filteredItems = useMemo(() => {
        let base = items;
        if (activeFilter === "pending") base = items.filter((i) => i.envio === "pendiente");
        else if (activeFilter === "unconfirmed") base = items.filter((i) => i.envio === "pendiente" && i.revision !== "confirmado");
        else if (activeFilter === "confirmed") base = items.filter((i) => i.envio === "pendiente" && i.revision === "confirmado");
        else if (activeFilter === "sent") base = items.filter((i) => i.envio === "enviado");
        else if (activeFilter === "discarded") base = items.filter((i) => i.envio === "descartado");

        const q = searchQuery.trim().toLowerCase();
        if (!q) return base;
        return base.filter((i) =>
            [i.organizacion, i.emailCliente, i.subject, i.pressSubject]
                .filter(Boolean).join(" ").toLowerCase().includes(q)
        );
    }, [activeFilter, items, searchQuery]);

    const selectedItem = useMemo(
        () => filteredItems.find((i) => i.id === selectedId) || filteredItems[0] || null,
        [filteredItems, selectedId]
    );

    const selectedSender = useMemo(() => {
        const raw = selectedItem?.emailEnvioRaw;
        if (raw?.senderName && raw?.senderEmail) {
            return { id: raw.senderId || DEFAULT_MEDIA_FOLLOWUP_SENDER_ID, displayName: raw.senderName, email: raw.senderEmail, footerText: raw.senderName };
        }
        const senderId = raw?.senderId || DEFAULT_MEDIA_FOLLOWUP_SENDER_ID;
        const normalized = availableSenders.map(normalizeSender);
        return normalized.find((s) => s.id === senderId)
            || normalized.find((s) => s.id === DEFAULT_MEDIA_FOLLOWUP_SENDER_ID)
            || FALLBACK_MEDIA_FOLLOWUP_SENDER;
    }, [availableSenders, selectedItem]);

    useEffect(() => {
        if (filteredItems.length === 0) {
            if (selectedId !== null) setSelectedId(null);
            return;
        }
        if (!filteredItems.some((i) => i.id === selectedId)) setSelectedId(filteredItems[0].id);
    }, [filteredItems, selectedId]);

    const scheduledSendLabel = useMemo(() => {
        if (!IS_LOCALHOST || !devTimezone || !selectedItem) return selectedItem?.scheduledSendLabel ?? null;
        return formatDateTime(getScheduledFollowupDate(selectedItem.scheduleTimestamp), { timezone: devTimezone });
    }, [selectedItem, devTimezone]);

    const scheduleTimestampLabel = useMemo(() => {
        if (!IS_LOCALHOST || !devTimezone || !selectedItem) return selectedItem?.scheduleTimestampLabel ?? null;
        return formatDateTime(selectedItem.scheduleTimestamp, { timezone: devTimezone });
    }, [selectedItem, devTimezone]);

    const requestConfirmation = useCallback(({ title, message, confirmText = "Confirmar", type = "info" }) => {
        if (!setConfirmProps) return Promise.resolve(window.confirm(message));
        return new Promise((resolve) => {
            setConfirmProps({
                title, message, confirmText, type,
                onConfirm: () => { closeConfirm?.(); resolve(true); },
                onCancel: () => { closeConfirm?.(); resolve(false); },
            });
        });
    }, [closeConfirm, setConfirmProps]);

    const handleSaveEmailModal = async (formData) => {
        if (!selectedItem) return;
        setIsUpdatingEnvio(true);
        const senderInfo = availableSenders.map(normalizeSender).find((s) => s.id === formData.senderId) || FALLBACK_MEDIA_FOLLOWUP_SENDER;
        const nextEmailEnvio = {
            ...(selectedItem.emailEnvioRaw || {}),
            subject: formData.subject,
            body: formData.body,
            senderId: formData.senderId,
            senderName: senderInfo.displayName,
            senderEmail: senderInfo.email,
            envio: selectedItem.envio,
        };
        try {
            await apiClient.updateMediaFollowupEmail({ id: selectedItem.id, email_envio: nextEmailEnvio });
            await loadMediaFollowup(selectedItem.id);
            setOpenEmailEditModal(false);
            setNotification?.({ type: "success", title: "Correo actualizado", message: "Se guardaron los cambios del asunto, el cuerpo y el remitente." });
        } catch (requestError) {
            console.error("Error guardando cambios del email:", requestError);
            setNotification?.({ type: "error", title: "No se pudo guardar", message: "No se pudieron persistir los cambios del correo." });
        } finally {
            setIsUpdatingEnvio(false);
        }
    };

    const handleSelectItem = (nextId) => { if (nextId !== selectedId) setSelectedId(nextId); };
    const handleFilterChange = (nextFilter) => { if (nextFilter !== activeFilter) setActiveFilter(nextFilter); };

    const handleUnconfirmEnvio = async () => {
        if (!selectedItem || selectedItem.revision !== "confirmado") return;
        const confirmed = await requestConfirmation({ title: "Desconfirmar envío", message: "¿Seguro quieres quitar la confirmación de este correo?", confirmText: "Desconfirmar", type: "warning" });
        if (!confirmed) return;
        setIsUpdatingEnvio(true);
        const nextEmailEnvio = { ...(selectedItem.emailEnvioRaw || {}), subject: selectedItem.subject, body: selectedItem.body, envio: selectedItem.envio, revision: "" };
        try {
            await apiClient.updateMediaFollowupEmail({ id: selectedItem.id, email_envio: nextEmailEnvio });
            await loadMediaFollowup(selectedItem.id);
            setNotification?.({ type: "info", title: "Correo desconfirmado", message: "La confirmación fue eliminada y el correo sigue como pendiente." });
        } catch {
            setNotification?.({ type: "error", title: "No se pudo desconfirmar", message: "No se pudo quitar la confirmación de este correo." });
        } finally {
            setIsUpdatingEnvio(false);
        }
    };

    const handleChangeEnvio = async (nextEnvio) => {
        if (!selectedItem) return;

        if (nextEnvio === "enviado" && selectedItem.envio === "pendiente") {
            const confirmed = await requestConfirmation({ title: "Confirmar envío", message: "¿Seguro quieres marcar este correo como confirmado para revisión?", confirmText: "Confirmar revisión", type: "info" });
            if (!confirmed) return;
            setIsUpdatingEnvio(true);
            try {
                await apiClient.updateMediaFollowupEmail({ id: selectedItem.id, email_envio: { ...(selectedItem.emailEnvioRaw || {}), subject: selectedItem.subject, body: selectedItem.body, envio: "pendiente", revision: "confirmado" } });
                await loadMediaFollowup(selectedItem.id);
                setNotification?.({ type: "info", title: "Correo marcado como confirmado", message: "El correo quedó como pendiente y confirmado para revisión." });
            } catch (requestError) {
                console.error("Error actualizando el estado de envio:", requestError);
                setNotification?.({ type: "error", title: "No se pudo actualizar el estado", message: "No se pudieron persistir los cambios de envio en el flujo edit-email." });
            } finally {
                setIsUpdatingEnvio(false);
            }
            return;
        }

        let resolvedNextEnvio = nextEnvio;
        let title = "Actualizar estado del email";
        let message = "¿Seguro quieres actualizar el estado de envío de este email?";
        let confirmText = "Confirmar";
        let type = "info";

        if (nextEnvio === "descartado") {
            title = "Descartar email"; message = "¿Seguro quieres marcar este email como descartado?"; confirmText = "Descartar"; type = "danger";
        } else if (nextEnvio === "enviado" && selectedItem.envio === "descartado") {
            resolvedNextEnvio = "pendiente"; title = "Reactivar envío"; message = "Se enviará el próximo día hábil a las 7am. ¿Seguro quieres realizar esta acción?"; confirmText = "Sí";
        }

        const confirmed = await requestConfirmation({ title, message, confirmText, type });
        if (!confirmed) return;

        setIsUpdatingEnvio(true);
        try {
            await apiClient.updateMediaFollowupEmail({ id: selectedItem.id, email_envio: { ...(selectedItem.emailEnvioRaw || {}), subject: selectedItem.subject, body: selectedItem.body, envio: resolvedNextEnvio, revision: "" } });
            await loadMediaFollowup(selectedItem.id);
            setNotification?.({
                type: resolvedNextEnvio === "enviado" ? "success" : resolvedNextEnvio === "pendiente" ? "info" : "warning",
                title: resolvedNextEnvio === "enviado" ? "Correo marcado como enviado" : resolvedNextEnvio === "pendiente" ? "Correo reactivado" : "Correo descartado",
                message: resolvedNextEnvio === "enviado"
                    ? "La bandeja se actualizó desde base de datos y el correo quedó como enviado."
                    : resolvedNextEnvio === "pendiente"
                        ? "El correo volvió a pendiente y se enviará en la próxima corrida hábil de las 7am."
                        : "La bandeja se actualizó desde base de datos y el correo quedó como descartado.",
            });
        } catch (requestError) {
            console.error("Error actualizando el estado de envio:", requestError);
            setNotification?.({ type: "error", title: "No se pudo actualizar el estado", message: "No se pudieron persistir los cambios de envio en el flujo edit-email." });
        } finally {
            setIsUpdatingEnvio(false);
        }
    };

    // Limpiar el error de regeneración cuando el usuario cambia de ítem
    useEffect(() => { setRegenerateError(null); }, [selectedId]);

    const handleRegenerateEmail = useCallback(async () => {
        if (!selectedItem) return;
        setIsRegenerating(true);
        setRegenerateError(null);
        try {
            const response = await apiClient.generatePreview({
                campaignId: "custom_1776338853355",
                organization: selectedItem.cliente,
            });
            const raw = response?.data;
            let parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
            if (!parsed?.subject || !parsed?.body) throw new Error("La respuesta de n8n no contiene asunto o cuerpo.");
            await apiClient.updateMediaFollowupEmail({
                id: selectedItem.id,
                email_envio: {
                    ...(selectedItem.emailEnvioRaw || {}),
                    subject: parsed.subject,
                    body: parsed.body,
                    envio: "pendiente",
                    revision: "",
                    regenerated_at: new Date().toISOString(),
                },
            });
            await loadMediaFollowup(selectedItem.id);
            setNotification?.({ type: "success", title: "Correo regenerado", message: "Se generó un nuevo correo basado en la nota de prensa actualizada." });
        } catch (err) {
            setRegenerateError(err?.message || "Error desconocido al regenerar el correo.");
        } finally {
            setIsRegenerating(false);
        }
    }, [selectedItem, loadMediaFollowup, setNotification]);

    const handleDeleteEmail = async () => {
        if (!selectedItem) return;
        const confirmed = await requestConfirmation({ title: "Eliminar email", message: "¿Seguro quieres eliminar este email de la bandeja?", confirmText: "Eliminar", type: "danger" });
        if (!confirmed) return;
        setIsUpdatingEnvio(true);
        try {
            await apiClient.updateMediaFollowupEmail({ id: selectedItem.id, email_envio: { ...(selectedItem.emailEnvioRaw || {}), subject: selectedItem.subject, body: selectedItem.body, envio: "eliminado", deleted_at: new Date().toISOString() } });
            await loadMediaFollowup();
            setNotification?.({ type: "success", title: "Email eliminado", message: "El email se quitó de la bandeja de seguimiento de medios." });
        } catch (requestError) {
            console.error("Error eliminando el email de seguimiento:", requestError);
            setNotification?.({ type: "error", title: "No se pudo eliminar", message: "No se pudo eliminar el email desde el flujo edit-email." });
        } finally {
            setIsUpdatingEnvio(false);
        }
    };

    const filterButtons = [
        { key: "all", label: "Todos", count: stats.total, tone: "default" },
        { key: "pending", label: "Pendientes", count: stats.pendientes, tone: "pending" },
        { key: "unconfirmed", label: "Sin confirmar", count: stats.sinConfirmar, tone: "default" },
        { key: "confirmed", label: "Confirmados", count: stats.confirmados, tone: "accent" },
        { key: "sent", label: "Enviados", count: stats.enviados, tone: "sent" },
        { key: "discarded", label: "Descartados", count: stats.descartados, tone: "discarded" },
    ];

    return {
        isLoading, error, activeFilter, selectedId,
        searchQuery, setSearchQuery,
        filteredItems, selectedItem, selectedSender,
        selectedStatusSummary: selectedItem ? getStatusSummary(selectedItem) : null,
        scheduledSendLabel, scheduleTimestampLabel,
        filterButtons, devTimezone, setDevTimezone,
        openPressModal, setOpenPressModal,
        openEditorModal, setOpenEditorModal,
        openEmailEditModal, setOpenEmailEditModal,
        isUpdatingEnvio,
        canEdit: Boolean(selectedItem) && selectedItem.envio !== "enviado",
        canSend: Boolean(selectedItem) && selectedItem.envio !== "enviado",
        canDiscard: Boolean(selectedItem) && selectedItem.envio !== "descartado" && selectedItem.envio !== "enviado",
        canDelete: Boolean(selectedItem) && (selectedItem.envio === "descartado" || selectedItem.envio === "enviado"),
        canCopy: Boolean(selectedItem),
        handleSelectItem, handleFilterChange, handleChangeEnvio,
        handleDeleteEmail, handleSaveEmailModal, handleUnconfirmEnvio,
        isRegenerating, regenerateError, setRegenerateError, handleRegenerateEmail,
        loadMediaFollowup,
        setNotification, organizaciones, saveContact, isSaving, availableSenders,
    };
}
