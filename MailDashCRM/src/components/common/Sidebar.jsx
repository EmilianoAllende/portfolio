import React, { useState } from "react";
import {
    Users,
    Mail,
    Building,
    FilePenLine,
    Database,
    LogOut,
    ShieldCheck,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    History,
    BarChart3,
    Send,
    Gavel,
    UserCircle,
    Mails,
    Newspaper,
    Inbox
} from "lucide-react";
import { GiBeaver } from "react-icons/gi";
import ThemeSwitcher from "./ThemeSwitcher";

const PlatypusIcon = ({ className, size = 18 }) => (
    <GiBeaver className={className} size={size} />
);

const Sidebar = ({
    activeView,
    setActiveView,
    selectedOrg,
    onLogout,
    currentUser,
    isCollapsed,
    onToggle,
}) => {
    const [isMailDash CRMOpen, setIsMailDash CRMOpen] = useState(true);

    // Solo mostramos Admin y Métricas Usuario a administradores y superadministradores
    const isAdminOrSuper = currentUser?.rol === "admin" || currentUser?.rol === "superadmin";

    const notasCanTabs = [
        { id: "listado", label: "Gestión", icon: Users },
        { id: "editor", label: "Editor", icon: FilePenLine },
        { id: "campanas", label: "Campañas", icon: Mail },
        { id: "historial", label: "Historial", icon: History },
        { id: "dashboard", label: "Panel", icon: Building },
        { id: "email_history", label: "Auditoría Correos", icon: Mails },
    ];

    if (isAdminOrSuper) {
        notasCanTabs.push({ id: "user_analytics", label: "Métricas Usuario", icon: BarChart3 });
        notasCanTabs.push({ id: "media_followup", label: "Seguimiento de Medios", icon: Newspaper });
        notasCanTabs.push({ id: "admin_org_create", label: "Crear Organización", icon: Building });
    }

    const emailMarketingTab = {
        id: "emailmarketing",
        label: "Email Marketing EC",
        icon: Send,
    };

    const emailAdjudicatariosTab = {
        id: "email_adjudicatarios",
        label: "Email Adjudicatarios",
        icon: Gavel,
    };

    const aMarkoTab = {
        id: "amarko",
        label: "IA Marko",
        icon: PlatypusIcon,
    };

    const adminTab = { id: "admin", label: "Gestión de Usuarios", icon: ShieldCheck };

    const zimbraTab = {
        id: "zimbra",
        label: "Bandeja Zimbra",
        icon: Inbox,
    };

    const standaloneTabs = [aMarkoTab, emailMarketingTab, emailAdjudicatariosTab, zimbraTab];
    if (isAdminOrSuper) {
        standaloneTabs.push(adminTab);
    }

    const isMailDash CRMActive = notasCanTabs.some((tab) => tab.id === activeView);

    const renderTabButton = (tab) => {
        const isDisabled = tab.id === "editor" && !selectedOrg;
        const isActive = activeView === tab.id;

        return (
            <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                disabled={isDisabled}
                className={`flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ease-in-out
                ${isCollapsed ? "justify-center" : ""}
                ${isActive
                        ? "bg-blue-600 text-white"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }
                ${isDisabled
                        ? "opacity-40 cursor-not-allowed"
                        : ""
                    }`}
                title={isCollapsed ? tab.label : undefined}>
                <tab.icon size={18} className="flex-shrink-0" />
                {!isCollapsed && (
                    <span className="overflow-hidden whitespace-nowrap">{tab.label}</span>
                )}
            </button>
        );
    };

    return (
        <aside
            className={`relative flex-shrink-0 flex flex-col bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 ease-in-out ${isCollapsed ? "w-20" : "w-64"
                }`}>
            {/* --- Botón para colapsar --- */}
            <button
                onClick={onToggle}
                className="absolute top-16 -right-3 z-10 p-1 bg-slate-100 dark:bg-slate-700 rounded-full shadow-md border border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                aria-label={
                    isCollapsed ? "Expandir barra lateral" : "Colapsar barra lateral"
                }>
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            {/* Logo/Título de la App */}
            <div className="h-16 flex items-center justify-center px-4 border-b border-slate-200 dark:border-slate-700">
                <Database
                    size={20}
                    className="text-blue-600 dark:text-blue-400 flex-shrink-0"
                />
                {/* --- Título condicional --- */}
                {!isCollapsed && (
                    <h1 className="ml-2 text-xl font-bold text-slate-900 dark:text-slate-100 overflow-hidden whitespace-nowrap">
                        Marketing MMI
                    </h1>
                )}
            </div>

            {/* Contenedor de Navegación */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {!isCollapsed && (
                    <button
                        onClick={() => setIsMailDash CRMOpen((prev) => !prev)}
                        className={`flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ease-in-out
                        ${isMailDash CRMActive
                                ? "bg-blue-600 text-white"
                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                            }`}>
                        <Database size={18} className="flex-shrink-0" />
                        <span className="flex-1 text-left overflow-hidden whitespace-nowrap">MailDash CRM</span>
                        {isMailDash CRMOpen ? (
                            <ChevronUp size={16} className="flex-shrink-0" />
                        ) : (
                            <ChevronDown size={16} className="flex-shrink-0" />
                        )}
                    </button>
                )}

                {isCollapsed && notasCanTabs.map((tab) => renderTabButton(tab))}

                {!isCollapsed && isMailDash CRMOpen && (
                    <div className="pl-3 space-y-1 border-l border-slate-200 dark:border-slate-700 ml-3">
                        {notasCanTabs.map((tab) => renderTabButton(tab))}
                    </div>
                )}

                {standaloneTabs.map((tab) => renderTabButton(tab))}
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                <ThemeSwitcher isCollapsed={isCollapsed} />
                <button
                    onClick={() => setActiveView("perfil")}
                    className={`flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ease-in-out
                    ${isCollapsed && "justify-center"}
                    ${activeView === "perfil"
                            ? "bg-blue-600 text-white"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                    title={isCollapsed ? "Mi Perfil" : undefined}>
                    <UserCircle size={18} className="flex-shrink-0" />
                    {!isCollapsed && (
                        <span className="overflow-hidden whitespace-nowrap">
                            Mi Perfil
                        </span>
                    )}
                </button>
                <button
                    onClick={onLogout}
                    className={`flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400  hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-400 transition-colors duration-150 ease-in-out
                    ${isCollapsed && "justify-center"}`}
                    title={isCollapsed ? "Cerrar Sesión" : undefined}>
                    <LogOut size={16} className="flex-shrink-0" />
                    {!isCollapsed && (
                        <span className="overflow-hidden whitespace-nowrap">
                            Cerrar Sesión
                        </span>
                    )}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
