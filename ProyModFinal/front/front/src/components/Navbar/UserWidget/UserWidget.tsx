"use client";

import { useState } from "react";
import { useAuthStore } from "../../../stores/authStore";
import { useRouter } from "next/navigation";
import { routes } from "@/app/routes";
import { ChevronDown, LogOut, User, LifeBuoy, UserCircle2 } from "lucide-react"; // Importamos un ícono de usuario genérico
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { useRef } from "react";

export const UserWidget = () => {
  const user = useAuthStore((state) => state.user);
  const { logout } = useAuthStore();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Hook para cerrar el dropdown si se hace clic afuera
  const dropdownRef = useRef<HTMLDivElement>(null);
  useOutsideClick(dropdownRef, () => setIsOpen(false));

  const handleLogout = async () => {
    await logout();
    router.push(routes.public.login);
  };

  if (!user) return null;
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-white"
      >
        {/* VISTA DESKTOP: Muestra nombre y rol */}
        <div className="hidden lg:flex flex-col items-start leading-tight">
          <span className="font-semibold text-sm">{user.name}</span>
          <span className="text-xs text-gray-300">{user.roles.join(', ')}</span>
        </div>

        {/* VISTA MÓVIL: Muestra solo un ícono de usuario */}
        <div className="block lg:hidden p-2 rounded-md hover:bg-[#6e5cc4] cursor-pointer">
          <UserCircle2 size={22} />
        </div>
        
        {/* Flecha (solo visible en desktop) */}
        <div className="hidden lg:block p-1 rounded-lg">
          <ChevronDown size={20} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Menú Dropdown (sin cambios en su contenido) */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
          <ul className="py-1 text-sm text-gray-700">
            {/* Opciones del menú */}
            <li>
              <button
                onClick={() => { setIsOpen(false); router.push(routes.user.profile); }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-3"
              >
                <User size={16} /> Mi perfil
              </button>
            </li>
            <li>
              <button
                onClick={() => { setIsOpen(false); router.push(routes.user.support); }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-3"
              >
                <LifeBuoy size={16} /> Soporte
              </button>
            </li>
            <li className="border-t border-gray-100 mt-1 pt-1">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-3"
              >
                <LogOut size={16} /> Cerrar sesión
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};