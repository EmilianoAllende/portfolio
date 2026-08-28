import { useState, useMemo } from "react";

const SESSION_FILTER_KEY = "campaigns_view_filter";

export const useCampaignViewState = (campaignTemplates, campanasActivas, onToggleCampaignStatus, setConfirmProps, closeConfirm) => {
    const [viewFilter, setViewFilter] = useState(
        () => sessionStorage.getItem(SESSION_FILTER_KEY) || "active"
    );

    const handleViewFilterChange = (newFilter) => {
        sessionStorage.setItem(SESSION_FILTER_KEY, newFilter);
        setViewFilter(newFilter);
    };

    const visibleTemplates = useMemo(() => {
        switch (viewFilter) {
            case "inactive": return campaignTemplates.filter(t => t.active === false);
            case "all":      return campaignTemplates;
            default:         return campaignTemplates.filter(t => t.active !== false);
        }
    }, [campaignTemplates, viewFilter]);

    const hasRecentSends = (template) => {
        if (!campanasActivas || campanasActivas.length === 0) return false;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        return campanasActivas.some(c => {
            const matches =
                c.campaignId === template.id ||
                c.templateId === template.id ||
                c.tipo === template.title ||
                c.campaignTitle === template.title;
            if (!matches) return false;

            const dateStr = c.fechaenvio || c.lastsent || c.createdat || c.created_at;
            if (!dateStr) return false;

            try {
                let sendDate;
                if (typeof dateStr === 'string' && /^\d{2}\/\d{2}\/\d{4}/.test(dateStr)) {
                    const parts = dateStr.split(/[/ :]/);
                    sendDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                } else {
                    sendDate = new Date(dateStr);
                }
                return !isNaN(sendDate.getTime()) && sendDate >= thirtyDaysAgo;
            } catch { return false; }
        });
    };

    const handleToggleStatus = (template) => {
        if (!template) return;
        const isCurrentlyActive = template.active !== false;
        const newState = !isCurrentlyActive;

        if (!newState && hasRecentSends(template)) {
            setConfirmProps({
                show: true,
                title: "Archivar campaña con actividad reciente",
                message: `"${template.title}" tuvo envíos en los últimos 30 días. ¿Seguro que quieres archivarla? Dejará de aparecer en los módulos de envío, pero el historial se conservará íntegro.`,
                confirmText: "Sí, archivar",
                cancelText: "Cancelar",
                type: "warning",
                onConfirm: () => {
                    onToggleCampaignStatus?.(template.id, false);
                    closeConfirm();
                },
                onCancel: () => closeConfirm(),
            });
        } else {
            onToggleCampaignStatus?.(template.id, newState);
        }
    };

    return {
        viewFilter,
        handleViewFilterChange,
        visibleTemplates,
        handleToggleStatus
    };
};
