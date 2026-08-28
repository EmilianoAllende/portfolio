"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/axiosInstance";
import { useRouter } from "next/navigation";
import { ButtonAccent } from "@/components/UI/Buttons/Buttons";
import toast from "react-hot-toast";

const CreateCut = () => {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [latestAuditId, setLatestAuditId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestAudit = async () => {
      try {
        const res = await api.get("/audits");
        const audits = res.data;
        if (audits.length > 0) {
          setLatestAuditId(audits[audits.length - 1].id);
        }
      } catch (err) {
        console.error("Error al obtener auditorías:", err);
      }
    };

    fetchLatestAudit();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!latestAuditId) {
      toast.error("No se encontró un arqueo para asociar el corte.");
      return;
    }
    try {
      await api.post("/cuts", { description: note });
      toast.success("Corte de caja registrado correctamente.");
      router.push("/manager/cashier/overview");
    } catch (err) {
      console.error("Error al registrar corte:", err);
      toast.error("No se pudo registrar el corte de caja.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">Registrar Nuevo Corte</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-yellow-200 text-yellow-900 text-sm p-2 rounded">
          El registro del corte incluirá todas las ventas y arqueos registrados hasta el momento.<br />
          Se requiere por lo menos un arqueo, en caso de no tener flujo de efectivo, registrar arqueo en ceros.
        </div>
        <div>
          <label className="block text-sm font-medium">Nota o descripción</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            required
          />
        </div>
        <ButtonAccent type="submit" textContent="Guardar"/>
      </form>
    </div>
  );
};

export default CreateCut;