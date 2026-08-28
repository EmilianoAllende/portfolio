"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axiosInstance"
import { SquarePen, Trash2 } from "lucide-react";
import Notiflix from "notiflix";

interface Sale {
  id: string;
  client: string;
  email: string;
  date: string;
  total: number;
}

const SalesDashboard = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [editingOrder, setEditingOrder] = useState<Sale | null>(null);
  const [statusInput, setStatusInput] = useState("");


  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const res = await api.get("/orders");
      setSales(res.data);
    } catch (err) {
      console.error("Error al obtener ventas:", err);
    }
  };

  const handleEdit = async (id: string) => {
  try {
    const res = await api.get(`/orders/${id}`);
    setEditingOrder(res.data);
    setStatusInput(res.data.status || ""); // por si ya tiene estado
  } catch (err) {
    console.error("Error al obtener orden:", err);
    Notiflix.Notify.failure("No se pudo obtener la orden para editar.");
  }
};


const handleUpdate = async () => {
  if (!editingOrder) return;
  try {
    await api.put(`/orders/${editingOrder.id}`, { status: statusInput });
    Notiflix.Notify.success("Orden actualizada correctamente.");
    setEditingOrder(null);
    fetchSales();
  } catch (err) {
    console.error("Error al actualizar orden:", err);
    Notiflix.Notify.failure("No se pudo actualizar la orden.");
  }
};

  const handleDelete = async (id: string) => {
    Notiflix.Confirm.show(
      "Cancelar orden",
      "¿Estás seguro de cancelar esta orden?",
      "Sí",
      "No",
      async () => {
        try {
          await api.delete(`/orders/${id}`);
          fetchSales();
          Notiflix.Notify.success("Orden cancelada correctamente.");
        } catch (err) {
          console.error("Error al cancelar orden:", err);
          Notiflix.Notify.failure("No se pudo cancelar la orden.");
        }
      }
    );
  };

  const totalSales = sales.reduce((acc, sale) => acc + sale.total, 0);

return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary">Reportes</h2>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl border-primary-20 shadow">
          <p className="text-sm">Total vendido</p>
          <h3 className="text-xl font-bold">${totalSales.toFixed(2)}</h3>
        </div>
      </div>

      {/* Tabla de ventas */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-secondary text-white">
            <tr>
              <th className="py-2 px-4">ID</th>
              <th className="py-2 px-4">Cliente</th>
              <th className="py-2 px-4">Email</th>
              <th className="py-2 px-4">Fecha</th>
              <th className="py-2 px-4">Total</th>
              <th className="py-2 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id} className="border-b text-center text-gray-800">
                <td className="py-3 px-4">#{sale.id}</td>
                <td className="py-3 px-4">{sale.client}</td>
                <td className="py-3 px-4">{sale.email}</td>
                <td className="py-3 px-4">{new Date(sale.date).toLocaleDateString()}</td>
                <td className="py-2 px-4">${sale.total.toFixed(2)}</td>
                <td className="py-2 px-4 flex justify-center gap-3">
                  <button
                    className="text-blue-600 hover:text-blue-800"
                    onClick={() => handleEdit(sale.id)}
                  >
                    <SquarePen size={18} />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800"
                    onClick={() => handleDelete(sale.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sales.length === 0 && (
          <p className="text-center text-gray-500 mt-4">
            No hay ventas en este período.
          </p>
        )}
      </div>
      {editingOrder && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-6 rounded shadow-lg w-96">
      <h3 className="text-lg font-bold mb-4">Editar orden #{editingOrder.id}</h3>
      
      <label className="block mb-2 text-sm font-medium">Estado</label>
<select
  className="w-full border px-3 py-2 rounded mb-4"
  value={statusInput}
  onChange={(e) => setStatusInput(e.target.value)}
>
  <option value="">Seleccionar estado</option>
  <option value="Completada">Completada</option>
  <option value="Cancelada">Cancelada</option>
  <option value="Pendiente">Pendiente</option>
  <option value="En proceso">En proceso</option>
</select>

      <div className="flex justify-end gap-2">
        <button
          className="bg-gray-300 text-black px-4 py-2 rounded"
          onClick={() => setEditingOrder(null)}
        >
          Cancelar
        </button>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={handleUpdate}
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

export default SalesDashboard;
