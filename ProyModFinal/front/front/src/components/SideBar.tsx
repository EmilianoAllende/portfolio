"use client";

import Image from "next/image";
import Link from "next/link";
import {
  PanelRight,
  Store,
  ChartColumnIncreasing,
  Sliders,
  Wallet,
  ChevronDown,
  ChevronRight,
  MapPin,
  Phone,
} from "lucide-react";
import logo from "@/../public/logoNivo.jpeg";
import { forwardRef, useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import { routes } from "@/app/routes";
import { useAuthStore } from "@/stores/authStore";
import { isClient } from "@/app/helpers/authHelper";
import { Inbox } from "./UI/Inbox";
import { useCompany } from "@/hooks/useCompany";

// --- Props y Tipos ---
interface SideBarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

interface MenuItemProps {
  item: any;
  isCollapsed: boolean;
  pathname: string;
  openSubmenu: string | null;
  toggleSubmenu: (id: string) => void;
}

// --- Sub-componente para cada item del menú (para limpieza) ---
const SidebarMenuItem: React.FC<MenuItemProps> = ({
  item,
  isCollapsed,
  pathname,
  openSubmenu,
  toggleSubmenu,
}) => {
  const isActive =
    item.href === pathname ||
    item.submenu?.some((sub: any) => sub.href === pathname);

  if (item.submenu) {
    return (
      <li>
        <button
          onClick={() => toggleSubmenu(item.id)}
          className={`group flex items-center p-2 w-full rounded-lg transition-colors ${
            isCollapsed ? "justify-center" : ""
          } ${
            isActive
              ? "bg-white/20"
              : "hover:bg-white/10 text-gray-200 hover:text-white cursor-pointer"
          }`}
        >
          <item.icon className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && (
            <>
              <span className="ms-3 flex-1 text-left whitespace-nowrap">
                {item.label}
              </span>
              {openSubmenu === item.id ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </>
          )}
        </button>
        {!isCollapsed && openSubmenu === item.id && (
          <ul className="pt-2 pl-6 space-y-1">
            {item.submenu.map((subItem: any) => (
              <li key={subItem.href}>
                <Link
                  href={subItem.href}
                  className={`block rounded-md py-1.5 px-3 text-sm transition-colors ${
                    pathname === subItem.href
                      ? "font-semibold text-white"
                      : "text-gray-300 hover:text-white hover:bg-white/5 cursor-pointer"
                  }`}
                >
                  {subItem.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li>
      <Link
        href={item.href || "#"}
        className={`flex items-center rounded-lg transition group p-2 ${
          isCollapsed ? "justify-center" : ""
        } ${
          isActive
            ? "bg-white/20 font-bold text-white"
            : "hover:bg-white/10 text-gray-200 hover:text-white"
        }`}
      >
        <item.icon className="h-5 w-5 flex-shrink-0" />
        {!isCollapsed && (
          <span className="ms-3 whitespace-nowrap">{item.label}</span>
        )}
      </Link>
    </li>
  );
};

// --- Componente Principal ---
const SideBar = forwardRef<HTMLDivElement, SideBarProps>(
  ({ isCollapsed, toggleCollapse }, ref) => {
    const pathname = usePathname();
    const { user, isInitialized } = useAuthStore();
    const { company } = useCompany();
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

    const menuConfig = useMemo(
      () => [
        {
          id: "mensajeria",
          label: "Mensajería",
          icon: Inbox,
          href: routes.user.chat,
          roles: ["ADMIN", "SUPERADMIN", "CASHIER"],
        },
        {
          id: "tienda",
          label: "Tienda",
          icon: Store,
          href: routes.shop.categories,
          roles: ["ADMIN", "SUPERADMIN", "CASHIER"],
        },
        {
          id: "mis-ventas",
          label: "Mis Ventas",
          icon: ChartColumnIncreasing,
          href: routes.user.reportsemployee,
          roles: ["CASHIER"],
        },
        {
          id: "editar",
          label: "Editar Listas",
          icon: Sliders,
          roles: ["ADMIN", "SUPERADMIN"],
          submenu: [
            { label: "Categorías", href: routes.manager.add.tablecategory },
            {
              label: "Subcategorías",
              href: routes.manager.add.tablesubcategory,
            },
            { label: "Marcas", href: routes.manager.add.tablebrand },
            { label: "Colores", href: routes.manager.add.tablecolor },
            { label: "Medidas", href: routes.manager.add.tablesize },
            { label: "Productos", href: routes.manager.add.tableproduct },
          ],
        },
        {
          id: "caja",
          label: "Caja",
          icon: Wallet,
          roles: ["ADMIN", "SUPERADMIN"],
          submenu: [
            { label: "Vista general", href: routes.manager.cashier.overview },
            { label: "Nuevo Arqueo", href: routes.manager.cashier.audits },
            { label: "Crear Corte", href: routes.manager.cashier.cuts },
          ],
        },
        {
          id: "gestion",
          label: "Gestión de negocio",
          icon: ChartColumnIncreasing,
          roles: ["ADMIN", "SUPERADMIN"],
          submenu: [
            { label: "Reportes", href: routes.user.reports },
            {
              label: "Crear empleado",
              href: routes.manager.settings.createEmployee,
            },
            { label: "Precios", href: routes.manager.settings.prices },
            // { label: "Embarques", href: routes.manager.settings.shipping },
          ],
        },
      ],
      []
    );

    const availableMenuItems = useMemo(() => {
      if (!user) return [];
      return menuConfig.filter((item) =>
        item.roles.some((role) => user.roles.includes(role))
      );
    }, [user, menuConfig]);

    if (!isInitialized || !user || isClient(user)) return null;

    const toggleSubmenu = (id: string) => {
      setOpenSubmenu((prev) => (prev === id ? null : id));
    };

    return (
      <aside
        ref={ref}
        className={`fixed top-0 left-0 z-40 h-screen bg-primary text-white flex flex-col transition-transform duration-300 ease-in-out
          ${
            isCollapsed
              ? "-translate-x-full lg:translate-x-0 lg:w-20"
              : "translate-x-0 w-64"
          }`}
        aria-label="Sidebar"
      >
        {/* --- HEADER --- */}
        <div className="flex h-16 items-center justify-between border-b border-white/20 px-4">
          {/* Contenedor del Logo */}
          {/* 'min-w-0' es un truco para que flexbox maneje bien el texto con 'truncate' si fuera necesario */}
            <Image
              src={logo}
              alt="logo"
              className="h-8 w-8 flex-shrink-0 rounded-lg"
            />
            {/* El texto solo se muestra si NO está colapsado */}
            {!isCollapsed && (
              <span className="truncate text-xl font-bold">NIVO</span>
            )}

          {/* Botón para colapsar (solo en desktop) */}
          {/* Se añade 'flex-shrink-0' también aquí para ser explícitos */}
          <button
            onClick={toggleCollapse}
            className="hidden flex-shrink-0 rounded-lg p-1 transition hover:bg-white/10 lg:block cursor-pointer"
          >
            <PanelRight className="h-5 w-5" />
          </button>
        </div>

        {!isCollapsed && company && (
          <div className="p-4 border-b border-white/20 text-sm space-y-2 flex-shrink-0">
            <h2 className="text-base font-semibold text-white">
              {company.name}
            </h2>
            <div className="flex items-center gap-2 text-white">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>{company.address}</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <span>{company.phone_number}</span>
            </div>
          </div>
        )}

        {/* --- NAVEGACIÓN PRINCIPAL --- */}
        <nav className="flex-grow overflow-y-auto overflow-x-hidden p-2">
          <ul className="space-y-1 font-medium">
            {availableMenuItems.map((item) => (
              <SidebarMenuItem
                key={item.id}
                item={item}
                isCollapsed={isCollapsed}
                pathname={pathname}
                openSubmenu={openSubmenu}
                toggleSubmenu={toggleSubmenu}
              />
            ))}
          </ul>
        </nav>
      </aside>
    );
  }
);

SideBar.displayName = "SideBar";
export default SideBar;
