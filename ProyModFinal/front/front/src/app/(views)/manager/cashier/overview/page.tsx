"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axiosInstance";
import { SquarePen, ChevronDown, ChevronUp } from "lucide-react";
import Notiflix from "notiflix";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ButtonAccent, ButtonPrimary } from "@/components/UI/Buttons/Buttons";
import { routes } from "@/app/routes";

interface Audit {
  id: string;
  date: string;
  description: string;
  total_cash_sales: number;
  total_card_sales: number;
  total_cash: number;
  sale_count: number;
  cut_id?: string;
}

interface Cut {
  id: string;
  date: string;
  description: string;
  audit_count: number;
  sale_count: number;
  total_audits: number;
  total_cash_sales: number;
}

const CashierOverview = () => {
  const router = useRouter();
  const [cuts, setCuts] = useState<Cut[]>([]);
  const [auditsByCut, setAuditsByCut] = useState<Record<string, Audit[]>>({});
  const [expandedCutId, setExpandedCutId] = useState<string | null>(null);
  const [editingAudit, setEditingAudit] = useState<Audit | null>(null);
  const [noteInput, setNoteInput] = useState("");
  const [editingCut, setEditingCut] = useState<Cut | null>(null);
  const [cutNoteInput, setCutNoteInput] = useState("");

  useEffect(() => {
    fetchCuts();
  }, []);

  const fetchCuts = async () => {
    try {
      const res = await api.get("/cuts");
      const formattedData = res.data.map((cut: any) => ({
        ...cut,
        audit_count: Number(cut.audit_count) || 0,
        sale_count: Number(cut.sale_count) || 0,
        total_audits: Number(cut.total_audits) || 0,
        total_cash_sales: Number(cut.total_cash_sales) || 0,
      }));
      setCuts(formattedData);
    } catch (err) {
      console.error("Error al obtener cortes:", err);
      toast.error("No se pudieron cargar los cortes.");
    }
  };

  const fetchAudits = async (cutId: string) => {
    try {
      const res = await api.get(`/cuts/${cutId}/audits`);
      interface RawAudit {
        id: string;
        date: string;

        description: string;
        total_cash_sales: number | string;
        total_card_sales: number | string;
        total_cash: number | string;
        sale_count: number | string;
        cut_id?: string;
      }

      const formattedData: Audit[] = (res.data as RawAudit[]).map(
        (audit: RawAudit): Audit => ({
          ...audit,
          total_cash_sales: Number(audit.total_cash_sales) || 0,
          total_card_sales: Number(audit.total_card_sales) || 0,
          total_cash: Number(audit.total_cash) || 0,
          sale_count: Number(audit.sale_count) || 0,
        })
      );
      setAuditsByCut((prev) => ({ ...prev, [cutId]: formattedData }));
    } catch (err) {
      console.error(`Error al obtener auditorías para el corte ${cutId}:`, err);
      toast.error("No se pudieron cargar los detalles del corte.");
    }
  };

  const handleToggle = (cutId: string) => {
    const newExpandedId = expandedCutId === cutId ? null : cutId;
    setExpandedCutId(newExpandedId);
    if (newExpandedId && !auditsByCut[newExpandedId]) {
      fetchAudits(newExpandedId);
    }
  };

  const handleUpdateCut = async () => {
    if (!editingCut) return;
    if (!cutNoteInput.trim()) {
      Notiflix.Notify.warning("La descripción del corte no puede estar vacía.");
      return;
    }
    try {
      await api.patch(`/cuts/${editingCut.id}`, { description: cutNoteInput });
      toast.success("Corte actualizado correctamente.");
      setEditingCut(null);
      fetchCuts();
    } catch (err) {
      console.error("Error al actualizar el corte:", err);
      toast.error("No se pudo actualizar el corte.");
    }
  };

  const handleUpdateAudit = async () => {
    if (!editingAudit) return;
    if (!noteInput.trim()) {
      Notiflix.Notify.warning("La descripción no puede estar vacía.");
      return;
    }
    try {
      await api.patch(`/audits/${editingAudit.id}`, { description: noteInput });
      toast.success("Arqueo actualizado correctamente.");
      setEditingAudit(null);
      if (editingAudit.cut_id) {
        await fetchAudits(editingAudit.cut_id);
      }
    } catch (err) {
      console.error("Error al actualizar auditoría:", err);
      toast.error("No se pudo actualizar el arqueo.");
    }
  };

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold text-primary">
          Historial de Cortes
        </h2>
        <div className="flex gap-2">
          <ButtonPrimary
            onClick={() => router.push(routes.manager.cashier.audits)}
            textContent="Nuevo Arqueo"
          />
          <ButtonAccent
            onClick={() => router.push(routes.manager.cashier.cuts)}
            textContent="Crear Corte"
          />
        </div>
      </div>

      <table className="min-w-full border border-gray-300 text-sm">
        <thead className="bg-secondary text-white text-left">
          <tr>
            <th className="py-2 px-4">Fecha</th>
            <th className="py-2 px-4">Descripción</th>
            <th className="py-2 px-4 text-center">N° Arqueos</th>
            <th className="py-2 px-4 text-center">N° Ventas</th>
            <th className="py-2 px-4 text-right">Total del Corte</th>
            <th className="py-2 px-4 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cuts.map((cut) => (
            <React.Fragment key={cut.id}>
              <tr className="text-gray-700 hover:bg-gray-50">
                <td className="py-3 px-4">
                  {new Date(cut.date).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">{cut.description}</td>
                <td className="py-3 px-4 text-center">{cut.audit_count}</td>
                <td className="py-3 px-4 text-center">{cut.sale_count}</td>
                <td className="py-3 px-4 text-right font-bold text-gray-800">
                  ${Number(cut.total_audits).toFixed(2)}
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex justify-center items-center gap-4">
                    <button
                      title="Editar Corte"
                      className="text-gray-500 hover:text-gray-700 cursor-pointer"
                      onClick={() => {
                        setEditingCut(cut);
                        setCutNoteInput(cut.description);
                      }}
                    >
                      <SquarePen />
                    </button>
                    <button
                      title="Ver Detalles"
                      onClick={() => handleToggle(cut.id)}
                      className="text-gray-500 hover:text-gray-700 cursor-pointer"
                    >
                      {expandedCutId === cut.id ? (
                        <ChevronUp />
                      ) : (
                        <ChevronDown />
                      )}
                    </button>
                  </div>
                </td>
              </tr>

              {/* Fila expandible con la tabla de Arqueos */}
              {expandedCutId === cut.id && (
                <tr className="bg-slate-50">
                  <td colSpan={6} className="p-4">
                    <h4 className="font-bold mb-2 text-primary-dark">
                      Detalle de Arqueos
                    </h4>
                    <table className="min-w-full text-xs bg-white rounded shadow-sm">
                      <thead className="bg-gray-200 text-left">
                        <tr>
                          <th className="py-1 px-3">Fecha y Hora</th>
                          <th className="py-1 px-3">Descripción</th>
                          <th className="py-1 px-3 text-center">N° Ventas</th>
                          <th className="py-1 px-3 text-right">
                            Ventas Efectivo
                          </th>
                          <th className="py-1 px-3 text-right">
                            Ventas Tarjeta
                          </th>
                          <th className="py-1 px-3 text-right">Total Arqueo</th>
                          <th className="py-1 px-3 text-center">Editar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditsByCut[cut.id] &&
                        auditsByCut[cut.id].length > 0 ? (
                          auditsByCut[cut.id].map((audit) => (
                            <tr key={audit.id} className="border-b">
                              <td className="py-2 px-3">
                                {new Date(audit.date).toLocaleDateString()}
                              </td>
                              <td className="py-2 px-3">{audit.description}</td>
                              <td className="py-2 px-3 text-center">
                                {audit.sale_count}
                              </td>
                              <td className="py-2 px-3 text-right">
                                ${Number(audit.total_cash_sales).toFixed(2)}
                              </td>
                              <td className="py-2 px-3 text-right">
                                ${Number(audit.total_card_sales).toFixed(2)}
                              </td>
                              <td className="py-2 px-3 text-right font-medium">
                                ${Number(audit.total_cash).toFixed(2)}
                              </td>
                              <td className="py-2 px-3 text-center">
                                <button
                                  className="text-neutral-600 hover:text-neutral-900 cursor-pointer"
                                  onClick={() => {
                                    setEditingAudit({
                                      ...audit,
                                      cut_id: cut.id,
                                    });
                                    setNoteInput(audit.description || "");
                                  }}
                                >
                                  <SquarePen size={16} />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="text-center py-4">
                              Cargando o no hay arqueos para este corte...
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {editingAudit && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">Editar Arqueo</h3>
            <label className="block mb-2 text-sm font-medium">
              Nota o descripción
            </label>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded mb-4"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Ej: Revisión cierre turno"
            />
            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded cursor-pointer"
                onClick={() => setEditingAudit(null)}
              >
                Cancelar
              </button>
              <button
                className="bg-primary text-white px-4 py-2 rounded cursor-pointer"
                onClick={handleUpdateAudit}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
      {editingCut && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">Editar Corte</h3>
            <label className="block mb-2 text-sm font-medium">
              Descripción del corte
            </label>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded mb-4"
              value={cutNoteInput}
              onChange={(e) => setCutNoteInput(e.target.value)}
              placeholder="Ej: Cierre turno tarde"
            />
            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded cursor-pointer"
                onClick={() => setEditingCut(null)}
              >
                Cancelar
              </button>
              <button
                className="bg-primary text-white px-4 py-2 rounded cursor-pointer"
                onClick={handleUpdateCut}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashierOverview;
