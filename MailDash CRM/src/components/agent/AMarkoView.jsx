import React, { useState } from "react";
import { GiBeaver } from "react-icons/gi";
import {
    CheckCircle2,
    Activity,
    Send,
    WandSparkles,
    Wrench,
    MessageSquare,
} from "lucide-react";

const QUICK_ACTIONS = [
    { label: "Ir a Gestión", command: "ir a gestión" },
    { label: "Abrir Editor", command: "abrir editor" },
    { label: "Ir a Campañas", command: "ir a campañas" },
    { label: "Ir a Historial", command: "ir a historial" },
    { label: "Ir a Email Marketing", command: "ir a email marketing" },
    { label: "Actualizar organizaciones", command: "actualizar organizaciones" },
];

const INITIAL_MESSAGE =
    "Hola, soy A-Marko. Estoy en modo orquestador y puedo ejecutar acciones sobre MailDash CRM. Escribe 'ayuda' para ver comandos disponibles.";

const getCurrentTime = () =>
    new Date().toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
    });

const AMarkoView = ({ onNavigate, onRefreshOrganizations, selectedOrg }) => {
    const [input, setInput] = useState("");
    const [activeTab, setActiveTab] = useState("chat");
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            text: INITIAL_MESSAGE,
        },
    ]);
    const [executedActions, setExecutedActions] = useState(0);
    const [chatHistory, setChatHistory] = useState([
        {
            role: "assistant",
            text: INITIAL_MESSAGE,
            at: getCurrentTime(),
        },
    ]);

    const executeActionFromText = (rawText) => {
        const text = rawText.toLowerCase().trim();

        const runNavigate = (view, label) => {
            onNavigate?.(view);
            return {
                reply: `Listo. Te llevo a ${label}.`,
                action: `Navegar a ${label}`,
            };
        };

        if (text.includes("ayuda") || text.includes("help")) {
            return {
                reply:
                    "Comandos: ir a gestión, abrir editor, ir a campañas, ir a historial, ir a panel, ir a métricas, ir a email marketing, actualizar organizaciones.",
                action: "Mostrar ayuda",
            };
        }

        if (
            text.includes("actualizar") ||
            text.includes("refrescar") ||
            text.includes("recargar")
        ) {
            onRefreshOrganizations?.();
            return {
                reply: "Perfecto. Inicié la actualización de organizaciones.",
                action: "Actualizar organizaciones",
            };
        }

        if (text.includes("editor")) {
            if (!selectedOrg) {
                return {
                    reply:
                        "Para abrir Editor necesitas seleccionar exactamente 1 organización en Gestión.",
                    action: null,
                };
            }
            onNavigate?.("editor");
            return {
                reply: `Abriendo Editor para ${selectedOrg.organizacion || selectedOrg.id}.`,
                action: "Abrir editor",
            };
        }

        if (text.includes("gest") || text.includes("listado")) {
            return runNavigate("listado", "Gestión");
        }

        if (text.includes("campa")) {
            return runNavigate("campanas", "Campañas");
        }

        if (text.includes("historial")) {
            return runNavigate("historial", "Historial");
        }

        if (text.includes("panel") || text.includes("dashboard")) {
            return runNavigate("dashboard", "Panel");
        }

        if (text.includes("métrica") || text.includes("metrica") || text.includes("usuario")) {
            return runNavigate("user_analytics", "Métricas Usuario");
        }

        if (text.includes("email")) {
            return runNavigate("emailmarketing", "Email Marketing EC");
        }

        if (text.includes("crear campaña") || text.includes("crear campana")) {
            return {
                reply:
                    "Preview: comando 'crear campaña{}' recibido. La ejecución real de creación de campaña se conectará en el siguiente paso.",
                action: "Crear campaña (preview)",
            };
        }

        if (
            text.includes("seleccionar organizaciones") ||
            text.includes("seleccionar organización") ||
            text.includes("seleccionar organizacion")
        ) {
            onNavigate?.("listado");
            return {
                reply:
                    "Preview: te llevo a Gestión para seleccionar organizaciones. Próximo paso: orquestar selección múltiple automática para envíos.",
                action: "Seleccionar organizaciones para envíos (preview)",
            };
        }

        if (
            text.includes("enviar campañas") ||
            text.includes("enviar campa") ||
            text.includes("enviar campaña") ||
            text.includes("enviar campana")
        ) {
            onNavigate?.("campanas");
            return {
                reply:
                    "Preview: abrí Campañas. Próximo paso: conectar ejecución real de envío desde A-Marko.",
                action: "Enviar campañas (preview)",
            };
        }

        if (text.includes("detalle")) {
            onNavigate?.("listado");
            return {
                reply:
                    "Preview: acción de detalle preparada. Próximo paso: abrir automáticamente el detalle de la organización seleccionada.",
                action: "Abrir detalle (preview)",
            };
        }

        if (text.includes("actualizar historial")) {
            onNavigate?.("historial");
            return {
                reply: "Preview: te llevo a Historial para revisar resultados de campañas.",
                action: "Actualizar historial (preview)",
            };
        }

        if (text.includes("métricas") || text.includes("metricas")) {
            onNavigate?.("user_analytics");
            return {
                reply: "Preview: abrí Métricas de Usuario para seguimiento operativo.",
                action: "Abrir métricas (preview)",
            };
        }

        return {
            reply: "No entendí la acción. Prueba con 'ayuda'.",
            action: null,
        };
    };

    const sendMessage = (messageText) => {
        const cleanText = messageText.trim();
        if (!cleanText) return;

        const userAt = getCurrentTime();

        setMessages((prev) => [...prev, { role: "user", text: cleanText }]);
        setChatHistory((prev) => [...prev, { role: "user", text: cleanText, at: userAt }]);

        const { reply, action } = executeActionFromText(cleanText);

        const assistantAt = getCurrentTime();

        setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
        setChatHistory((prev) => [
            ...prev,
            { role: "assistant", text: reply, at: assistantAt },
        ]);

        if (action) {
            setExecutedActions((prev) => prev + 1);
        }
        setInput("");
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        sendMessage(input);
    };

    const handleQuickActionSelect = (event) => {
        const command = event.target.value;
        if (!command) return;
        sendMessage(command);
        event.target.value = "";
    };

    const totalExchanges = Math.floor(messages.length / 2);

    return (
        <div className="flex flex-col h-full p-6 bg-slate-100 dark:bg-slate-900">
            <div className="mb-6 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                            <GiBeaver className="text-2xl text-slate-700 dark:text-slate-200" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">IA Marko</h1>
                                <span className="text-[10px] px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 uppercase tracking-wide font-semibold">
                                    IA Marko
                                </span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400">Asistente agéntico para operar MailDash CRM con comandos.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium">
                            <CheckCircle2 size={15} /> Operativo
                        </span>
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm">
                            <WandSparkles size={14} />
                            Contexto: {selectedOrg ? (selectedOrg.organizacion || selectedOrg.id) : "ninguno"}
                        </span>
                    </div>
                </div>

                <div className="mt-4 flex gap-2">
                    <button
                        onClick={() => setActiveTab("chat")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeTab === "chat"
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
                        }`}>
                        Chat
                    </button>
                    <button
                        onClick={() => setActiveTab("operacion")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeTab === "operacion"
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
                        }`}>
                        Métricas y Operación
                    </button>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                {activeTab === "chat" && (
                    <section className="h-full max-w-6xl w-full mx-auto bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 min-h-0 flex flex-col">
                    <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4 text-center">Chat</h2>

                    <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-4">
                        <div className="lg:col-span-3 min-h-0 flex flex-col">
                            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                                {messages.map((message, index) => (
                                    <div
                                        key={`${message.role}-${index}`}
                                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                                        <div
                                            className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                                                message.role === "user"
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                                            }`}>
                                            {message.text}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
                                <input
                                    value={input}
                                    onChange={(event) => setInput(event.target.value)}
                                    placeholder="Instruye al agente... (ej: seleccionar organizaciones para envíos)"
                                    className="flex-1 px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                                    <Send size={15} /> Enviar
                                </button>
                            </form>
                        </div>

                        <aside className="min-h-0 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-3">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
                                Acciones rápidas
                            </h3>
                            <select
                                onChange={handleQuickActionSelect}
                                defaultValue=""
                                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm">
                                <option value="">Selecciona una acción...</option>
                                {QUICK_ACTIONS.map((action) => (
                                    <option key={action.command} value={action.command}>
                                        {action.label}
                                    </option>
                                ))}
                            </select>
                        </aside>
                    </div>
                    </section>
                )}

                {activeTab === "operacion" && (
                <section className="h-full bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 min-h-0 flex flex-col">
                    <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">Métricas y Operación</h2>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="rounded-md border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-900/40">
                            <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Estado</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                                <Activity size={14} className="text-green-500" /> En línea
                            </p>
                        </div>
                        <div className="rounded-md border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-900/40">
                            <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Interacciones</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{totalExchanges}</p>
                        </div>
                        <div className="rounded-md border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-900/40">
                            <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Acciones</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{executedActions}</p>
                        </div>
                    </div>

                    <div className="space-y-4 overflow-y-auto">
                        <div className="rounded-md border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-900/40">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2">
                                <Wrench size={14} />
                                Herramientas activas
                            </h3>
                            <ul className="text-xs text-slate-700 dark:text-slate-200 space-y-1">
                                <li>• Navegación de vistas</li>
                                <li>• Refresco de organizaciones</li>
                                <li>• Editor contextual por organización</li>
                                <li>• Ejecución preview de flujos</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2">
                                <MessageSquare size={14} />
                                Historial de chats
                            </h3>
                            <div className="max-h-72 overflow-y-auto rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 divide-y divide-slate-200 dark:divide-slate-700">
                                {chatHistory.slice(-20).map((entry, index) => (
                                    <div key={`${entry.role}-${index}`} className="p-3">
                                        <p className="text-xs text-slate-800 dark:text-slate-100">
                                            <span className="font-semibold">
                                                {entry.role === "user" ? "Tú" : "A-Marko"}:
                                            </span>{" "}
                                            {entry.text}
                                        </p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                            {entry.at}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 p-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 text-xs text-slate-600 dark:text-slate-300">
                        Tip operativo: para abrir editor, primero selecciona exactamente una organización en Gestión.
                    </div>
                </section>
                )}
            </div>
        </div>
    );
};

export default AMarkoView;
