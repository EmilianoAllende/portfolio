"use client";

import { useState } from "react";
import { CartDropdown } from "../CartDropdown";
import { UserWidget } from "./UserWidget/UserWidget";
import SearchBar from "../SearchBar";
import { Menu, Search, X } from "lucide-react";
import { Bell } from "../UI/Bell";

type NavbarProps = {
  toggleSidebar: () => void;
};

export default function Navbar({ toggleSidebar }: NavbarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 w-full h-16 bg-secondary text-white shadow-md">
        <div className="flex h-full items-center justify-between px-4">
          
          {/* --- VISTA DESKTOP (lg y superior) --- */}
          <div className="hidden lg:flex items-center w-full">
            {/* Búsqueda a la izquierda */}
            <div className="w-1/3">
              <SearchBar />
            </div>
            {/* Espacio central (puedes poner un logo si quieres) */}
            <div className="flex-grow"></div>
            {/* Acciones a la derecha */}
            <div className="flex items-center gap-6">
              <Bell />
              <CartDropdown />
              <UserWidget />
            </div>
          </div>

          {/* --- VISTA MÓVIL (inferior a lg) --- */}
          <div className="flex lg:hidden items-center justify-between w-full">
            {/* Botón para abrir la Sidebar principal */}
            <button
              onClick={toggleSidebar}
              className="text-white hover:bg-[#6e5cc4] p-2 rounded-md -ml-2 cursor-pointer"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            {/* Barra de íconos de acción a la derecha */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="text-white hover:bg-[#6e5cc4] p-2 rounded-md cursor-pointer"
              >
                <Search className="h-5 w-5" />
              </button>
              <Bell />
              <CartDropdown />
              <UserWidget />
            </div>
          </div>
        </div>
      </header>

      {/* Overlay de Búsqueda (sin cambios, ya funciona bien) */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/70 backdrop-blur-sm">
          <div className="bg-white p-4">
            <div className="flex items-center gap-4">
              <div className="flex-grow">
                <SearchBar />
              </div>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}