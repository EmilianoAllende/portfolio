"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axiosInstance";
import { SquarePen, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { routes } from "@/app/routes";

// Asumo que creaste estos archivos como en el paso anterior
import { usePagination } from "@/hooks/usePagination";
import { Pagination } from "@/components/UI/Pagination";

interface Order {
  id: string;
  folio: number;
  date: string;
  time: string;
  total_order: number;
  payment_method: string;
  status: string;
}

const MySales = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [statusInput, setStatusInput] = useState("");
  const router = useRouter();

  // Lógica de paginación: 5 items por página
  const {
    currentData,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    goToPage,
  } = usePagination(orders, 5);

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      const res = await api.get("/orders/my");
      const formattedOrders: Order[] = res.data.map((order: any) => ({
        ...order,
        total_order: parseFloat(order.total_order || '0')
      }));
      setOrders(formattedOrders);
    } catch (err) {
      console.error("Error al obtener órdenes:", err);
      toast.error("No se pudieron cargar las ventas.");
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const res = await api.get(`/orders/${id}`);
      setEditingOrder(res.data);
      setStatusInput(res.data.status || "");
    } catch (err) {
      console.error("Error al obtener orden:", err);
      toast.error("No se pudo obtener la orden.");
    }
  };

  const handleUpdate = async () => {
    if (!editingOrder) return;
    try {
      await api.put(`/orders/${editingOrder.id}`, { status: statusInput });
      toast.success("Orden actualizada.");
      setEditingOrder(null);
      fetchMyOrders();
    } catch (err) {
      console.error("Error al actualizar orden:", err);
      toast.error("No se pudo actualizar la orden.");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-secondary mb-6">Mis Ventas</h2>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-secondary text-gray-100 uppercase">
              <tr>
                <th className="py-3 px-6 text-left">Fecha</th>
                <th className="py-3 px-6 text-left">Total</th>
                <th className="py-3 px-6 text-left">Método</th>
                <th className="py-3 px-6 text-left">Estado</th>
                <th className="py-3 px-6 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 divide-y divide-gray-200">
              {currentData.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  {/*-- CAMBIO AQUÍ --*/}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="font-medium text-gray-800">
                      {new Date(order.date + "T" + order.time).toLocaleDateString('es-AR')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(order.date + "T" + order.time).toLocaleTimeString('es-AR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </td>
                  {/*-- FIN DEL CAMBIO --*/}
                  <td className="py-4 px-6 font-medium whitespace-nowrap">
                    ${order.total_order.toFixed(2)}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">{order.payment_method}</td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'Completada'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'Cancelada'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 flex items-center gap-4 whitespace-nowrap">
                    <button
                      className="text-indigo-600 hover:text-indigo-800 transition-colors"
                      onClick={() => handleEdit(order.id)}
                    >
                      <SquarePen size={18} />
                    </button>
                    <button
                      className={`transition-colors ${
                        order.status.toUpperCase() === 'CANCELADA'
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-red-600 hover:text-red-800'
                      }`}
                      onClick={() => {
                        if (order.status.toUpperCase() !== 'CANCELADA') {
                          router.push(`${routes.user.ordercancel}/${order.id}`);
                        }
                      }}
                      disabled={order.status.toUpperCase() === 'CANCELADA'}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && (
          <p className="text-center p-8 text-gray-500">
            Aún no registraste ventas.
          </p>
        )}
      </div>

      {/* Footer con Paginación */}
      <div className="p-4 bg-white rounded-b-lg shadow-md border-t border-gray-200">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          nextPage={nextPage}
          prevPage={prevPage}
          goToPage={goToPage}
        />
      </div>

      {/* Modal de edición */}
      {editingOrder && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">
              Editar estado orden #{editingOrder.folio}
            </h3>
            <label className="block mb-2 text-sm font-medium text-gray-700">Estado</label>
            <select
              className="w-full border border-gray-300 px-3 py-2 rounded-md mb-4 focus:ring-indigo-500 focus:border-indigo-500"
              value={statusInput}
              onChange={(e) => setStatusInput(e.target.value)}
            >
              <option value="">Seleccionar estado</option>
              <option value="Completada">Completada</option>
              <option value="Cancelada">Cancelada</option>
            </select>
            <div className="flex justify-end gap-3">
              <button
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                onClick={() => setEditingOrder(null)}
              >
                Cancelar
              </button>
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
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

export default MySales;