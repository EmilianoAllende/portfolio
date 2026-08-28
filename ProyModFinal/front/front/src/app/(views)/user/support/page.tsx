"use client";

import React, { useState } from "react";

const SupportPage = () => {
  const [activeTab, setActiveTab] = useState<"employees" | "clients">("employees");
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-4">Centro de Soporte</h1>
      <p className="text-center text-gray-600 mb-6">¿Tenés dudas? Elegí tu rol y encontrá respuestas rápidas.</p>

      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setActiveTab("employees")}
          className={`px-4 py-2 rounded-md font-semibold border ${
            activeTab === "employees" ? "bg-primary text-white" : "bg-white text-primary border-primary"
          }`}
        >
          Empleados
        </button>
        <button
          onClick={() => setActiveTab("clients")}
          className={`px-4 py-2 rounded-md font-semibold border ${
            activeTab === "clients" ? "bg-primary text-white" : "bg-white text-primary border-primary"
          }`}
        >
          Clientes
        </button>
      </div>

      {/* Contenido Empleados */}
      {activeTab === "employees" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Preguntas frecuentes para empleados</h2>
          <ul className="space-y-3">
            <li className="border rounded-md">
              <button
                onClick={() => toggleFaq("emp1")}
                className="w-full text-left px-4 py-2 font-medium"
              >
                ¿Cómo inicio sesión en el POS?
              </button>
              {openFaq === "emp1" && (
                <div className="px-4 pb-3 text-gray-700">
                  Usá tu usuario y contraseña asignados por el administrador. Si no los tenés, solicitá acceso.
                </div>
              )}
            </li>
            <li className="border rounded-md">
              <button
                onClick={() => toggleFaq("emp2")}
                className="w-full text-left px-4 py-2 font-medium"
              >
                ¿Cómo hago una venta?
              </button>
              {openFaq === "emp2" && (
                <div className="px-4 pb-3 text-gray-700">
                  Buscá el producto o escaneá el código, seleccioná el método de pago y presioná &quot;Finalizar venta.&quot;
                </div>
              )}
            </li>
            <li className="border rounded-md">
              <button
                onClick={() => toggleFaq("emp3")}
                className="w-full text-left px-4 py-2 font-medium"
              >
                ¿Cómo reporto un problema?
              </button>
              {openFaq === "emp3" && (
                <div className="px-4 pb-3 text-gray-700">
                  Escribinos a <a href="mailto:soporte@miempresa.com" className="text-blue-600 underline">soporte@miempresa.com</a> con una descripción y captura del error.
                </div>
              )}
            </li>
          </ul>
        </div>
      )}

      {/* Contenido Clientes */}
      {activeTab === "clients" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Preguntas frecuentes para clientes</h2>
          <ul className="space-y-3">
            <li className="border rounded-md">
              <button
                onClick={() => toggleFaq("cli1")}
                className="w-full text-left px-4 py-2 font-medium"
              >
                ¿Dónde veo mis compras?
              </button>
              {openFaq === "cli1" && (
                <div className="px-4 pb-3 text-gray-700">
                  Ingresá a tu cuenta y accedé a la sección &quot;Mis compras&quot; desde el menú principal.
                </div>
              )}
            </li>
            <li className="border rounded-md">
              <button
                onClick={() => toggleFaq("cli2")}
                className="w-full text-left px-4 py-2 font-medium"
              >
                ¿Cómo pido un reembolso?
              </button>
              {openFaq === "cli2" && (
                <div className="px-4 pb-3 text-gray-700">
                  Enviá tu número de orden y el motivo del reclamo a <a href="mailto:clientes@miempresa.com" className="text-blue-600 underline">clientes@nivo.com</a>.
                </div>
              )}
            </li>
            <li className="border rounded-md">
              <button
                onClick={() => toggleFaq("cli3")}
                className="w-full text-left px-4 py-2 font-medium"
              >
                ¿Cómo actualizo mis datos?
              </button>
              {openFaq === "cli3" && (
                <div className="px-4 pb-3 text-gray-700">
                  Desde tu cuenta, ingresá a &quot;Configuración&quot; y editá tus datos personales.
                </div>
              )}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SupportPage;
