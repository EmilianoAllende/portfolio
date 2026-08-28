export const statusStyles = {
    pendiente: {
        label: "pendiente",
        badge: "border border-[color:var(--amber-bg)] bg-[var(--amber-bg)] text-[var(--amber)]",
    },
    enviado: {
        label: "enviado",
        badge: "border border-[color:var(--green-bg)] bg-[var(--green-bg)] text-[var(--green)]",
    },
    descartado: {
        label: "descartado",
        badge: "border border-[color:var(--red-bg)] bg-[var(--red-bg)] text-[var(--red)]",
    },
    error: {
        label: "error",
        badge: "border border-[color:var(--red-bg)] bg-[var(--red-bg)] text-[var(--red)]",
    },
    otro: {
        label: "otro",
        badge: "border border-[var(--border)] bg-[var(--bg3)] text-[var(--text2)]",
    },
};

export const tabClassName = "inline-flex items-center gap-2 rounded-full border px-3 py-[7px] text-[11px] font-medium transition-colors duration-150";

export function statusBadgeClassName(status, revision) {
    const config = statusStyles[status] || statusStyles.otro;
    let extra = "";
    if (status === "pendiente" && revision === "confirmado") {
        extra = " ring-2 ring-blue-400";
    }
    return `rounded-sm px-2 py-[2px] font-mono text-[9px] uppercase tracking-[0.16em] ${config.badge}${extra}`;
}

export function filterTabClassName(tone, isActive) {
    const tones = {
        default: `${tabClassName} border-[var(--border)] bg-[var(--bg)] text-[var(--text2)]`,
        pending: `${tabClassName} border-[color:var(--amber-bg)] bg-[var(--amber-bg)] text-[var(--amber)]`,
        accent: `${tabClassName} border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--accent)]`,
        sent: `${tabClassName} border-[color:var(--green-bg)] bg-[var(--green-bg)] text-[var(--green)]`,
        discarded: `${tabClassName} border-[color:var(--red-bg)] bg-[var(--red-bg)] text-[var(--red)]`,
    };

    return `${tones[tone] || tones.default} ${isActive ? "ring-1 ring-[var(--accent)] ring-offset-1 ring-offset-[var(--bg)]" : "opacity-85 hover:opacity-100"}`;
}

export function getFilterSectionTitle(activeFilter, total) {
    if (activeFilter === "pending") return `pendientes · ${total}`;
    if (activeFilter === "unconfirmed") return `sin confirmar · ${total}`;
    if (activeFilter === "confirmed") return `confirmados · ${total}`;
    if (activeFilter === "sent") return `enviados · ${total}`;
    if (activeFilter === "discarded") return `descartados · ${total}`;
    return `bandeja · ${total}`;
}

export function getStatusSummary(item) {
    if (!item) {
        return {
            headline: "Sin estado disponible",
            hint: "",
            nextStep: "sin acción",
        };
    }

    if (item.envio === "pendiente") {
        return {
            headline: `Pendiente de revisión. Si no cambias nada, saldrá el ${item.scheduledSendLabel || "próximo día hábil"}.`,
            hint: "Puedes editar el correo, confirmar el envío o descartarlo antes de la próxima corrida.",
            nextStep: "revisar y confirmar",
        };
    }

    if (item.envio === "descartado") {
        return {
            headline: "Este correo fue descartado manualmente.",
            hint: "Puedes reactivarlo para que vuelva a pendiente o eliminarlo definitivamente de la bandeja.",
            nextStep: "reactivar o eliminar",
        };
    }

    if (item.envio === "enviado") {
        return {
            headline: "Este correo ya fue enviado.",
            hint: "La edición y el descarte quedan bloqueados; solo puedes eliminarlo de la bandeja si ya no quieres verlo.",
            nextStep: "consulta cerrada",
        };
    }

    return {
        headline: "Estado no categorizado.",
        hint: "Revisa el registro antes de tomar una acción manual.",
        nextStep: "revisar estado",
    };
}

export function getSnippet(value) {
    if (!value) return "";
    return String(value).replace(/\s+/g, " ").slice(0, 260);
}
