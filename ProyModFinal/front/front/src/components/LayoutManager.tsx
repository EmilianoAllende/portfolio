"use client";

import { useRef, useState, useEffect } from "react";
import Navbar from "@/components/Navbar/Navbar";
import SideBar from "@/components/SideBar";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import BreadcrumbClient from "@/components/UI/Breadcrumb";

interface LayoutManagerProps {
  children: React.ReactNode;
  showBreadcrumb?: boolean | React.ReactNode;
  showContainer?: boolean;
}

export default function LayoutManager({
  children,
  showBreadcrumb = true,
  showContainer = true,
}: LayoutManagerProps) {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isMobileOverlay, setIsMobileOverlay] = useState(false);

  const sidebarRef = useRef<HTMLDivElement>(null);

  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  useEffect(() => {
    const handleResize = () => {
      // Por defecto, la sidebar está colapsada en móvil y expandida en desktop.
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // El overlay oscuro solo aparece en móvil cuando la sidebar está abierta
    const isMobile = window.innerWidth < 1024;
    setIsMobileOverlay(!isSidebarCollapsed && isMobile);
  }, [isSidebarCollapsed]);

  useOutsideClick(sidebarRef, () => {
    // Si haces clic afuera en móvil, la sidebar se cierra
    if (window.innerWidth < 1024 && !isSidebarCollapsed) {
      setSidebarCollapsed(true);
    }
  });

  return (
    <>
      {/* Overlay para el modo móvil */}
      {isMobileOverlay && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden"></div>
      )}
      
      {/* El ExcludedWrapper no es necesario si la sidebar es global */}
      <SideBar
        ref={sidebarRef}
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={toggleSidebar}
      />

      {/* --- CONTENEDOR PRINCIPAL DEL CONTENIDO --- */}
      <div
        className={`relative min-h-screen transition-all duration-300 ${
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <Navbar toggleSidebar={toggleSidebar} />
        
        {/* El resto del contenido */}
        {showBreadcrumb || showContainer ? (
          <div className="pt-4 px-4 sm:px-6 lg:px-8">
            {showBreadcrumb && (
              <div className="mb-4">
                {typeof showBreadcrumb === "boolean" ? (
                  <BreadcrumbClient />
                ) : (
                  showBreadcrumb
                )}
              </div>
            )}
            {showContainer ? (
              <main className="w-full bg-white rounded-lg shadow-md p-4 md:p-6 min-h-[75vh]">
                {children}
              </main>
            ) : (
              children
            )}
          </div>
        ) : (
          children
        )}
      </div>
    </>
  );
}