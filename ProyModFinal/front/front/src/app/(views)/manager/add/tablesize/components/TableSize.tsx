"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Dropdown, Modal, DropdownItem } from 'flowbite-react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { CgSpinner } from "react-icons/cg";
import { BsThreeDotsVertical } from 'react-icons/bs';
import api from '@/lib/axiosInstance';
import { ButtonAccent } from '@/components/UI/Buttons/Buttons';
import toast from 'react-hot-toast';
import { routes } from '@/app/routes';

interface Size {
  _id: string;
  size_us: number;
  size_eur: number;
  size_cm: number;
}

const TableSize: React.FC = () => {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState<string | undefined>();

  const sizeIdRef = useRef<string | null>(null);
  const [pendingDeleteSizeName, setPendingDeleteSizeName] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [currentSize, setCurrentSize] = useState<Size | null>(null);
  const [editForm, setEditForm] = useState({ size_us: 0, size_eur: 0, size_cm: 0 });

  const router = useRouter();
  const props = { openModal, setOpenModal };

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(2); // Se puede ajustar a x número
  const [totalSizes, setTotalSizes] = useState(0);

  // Función para obtener las medidas con paginación
  const fetchSizes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/sizes", {
        params: {
          page: currentPage,
          limit: itemsPerPage
        }
      });

      // Respuesta en la consola para ver su estructura real.
      console.log("Respuesta de la API:", response.data);

      if (response.data && typeof response.data === 'object' && 'total' in response.data) {
        setSizes(response.data.sizes); // Asegúrate de que el key sea `sizes`
        setTotalSizes(response.data.total);
      } else if (Array.isArray(response.data)) {
        setSizes(response.data);
        setTotalSizes(0);
        console.warn("La API devolvió un array directamente. No se puede determinar el total de medidas para una paginación completa. Por favor, considera actualizar tu API para que devuelva también el total de elementos (ej: { sizes: [...], total: 100 }).");
      } else {
        console.error("El formato de la respuesta de la API no es un objeto ni un array:", response.data);
        setSizes([]);
        setTotalSizes(0);
        setError('Error: Formato de respuesta de la API inesperado.');
      }

    } catch (err: any) {
      console.error("Error al obtener medidas:", err);
      setError('Error al obtener las medidas. Por favor, intenta de nuevo.');
      setSizes([]);
      setTotalSizes(0);
    } finally {
      setLoading(false);
    }
  };

  // Cambia la página actual
  useEffect(() => {
    fetchSizes();
  }, [currentPage]); // Se vuelve a cargar cada vez que cambia la página

  // Manejador para cambiar de página
  const handlePageChange = (page: number) => {
    // Esto permite que el usuario haga clic en "Siguiente" hasta que la tabla se vacíe.
    if (page > 0 && (totalSizes === 0 || page <= Math.ceil(totalSizes / itemsPerPage))) {
      setCurrentPage(page);
    }
  };

  const handleAddSize = () => {
    router.push(routes.manager.add.size);
  };

  const handleEdit = (size: Size) => {
    setCurrentSize(size);
    setEditForm({ size_us: size.size_us, size_eur: size.size_eur, size_cm: size.size_cm });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!currentSize) return;

    // Validación antes de enviar
    if (isNaN(editForm.size_us) || isNaN(editForm.size_eur) || isNaN(editForm.size_cm)) {
      setError('Error: Los valores de las tallas deben ser números válidos.');
      return;
    }

    const sizeId = currentSize._id || (currentSize as any).id;
    if (!sizeId) {
      console.error("Error: No se pudo obtener el ID de la medida para actualizar.");
      return;
    }

    try {
      setLoading(true);
      await api.put(`/sizes/${sizeId}`, {
        size_us: editForm.size_us,
        size_eur: editForm.size_eur,
        size_cm: editForm.size_cm,
      });
      toast.success('¡Cambios realizados!');
      await fetchSizes();
      setIsEditing(false);
      setCurrentSize(null);
      setEditForm({ size_us: 0, size_eur: 0, size_cm: 0 });
    } catch (err: any) {
      console.error("Error al actualizar la medida:", err);
      setError('Error al actualizar la medida. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCurrentSize(null);
    setEditForm({ size_us: 0, size_eur: 0, size_cm: 0 });
  };

  const handleDeleteClick = (size: Size) => {
    const sizeId = size._id || (size as any).id;

    if (sizeId && typeof sizeId === 'string') {
      sizeIdRef.current = sizeId;
      setPendingDeleteSizeName(`US ${size.size_us} / EUR ${size.size_eur} / CM ${size.size_cm}`);
      props.setOpenModal('pop-up');
    } else {
      console.error("Error: La medida seleccionada no tiene un ID válido.", size);
      setError('No se pudo seleccionar la medida para eliminar. Por favor, intenta de nuevo.');
    }
  };

  const handleDeleteConfirmed = async () => {
    const idToDelete = sizeIdRef.current;

    if (!idToDelete) {
      console.error("Error interno: No se pudo obtener el ID de la medida para eliminar.");
      props.setOpenModal(undefined); // Cierra el modal si no hay ID
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/sizes/${idToDelete}`);

      await fetchSizes();

      props.setOpenModal(undefined);
      sizeIdRef.current = null;
      setPendingDeleteSizeName(null);
    } catch (err: any) {
      console.error("Error al eliminar la medida:", err);
      setError('Error al eliminar la medida. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Calculamos el número total de páginas (si tenemos el total)
  const totalPages = totalSizes > 0 ? Math.ceil(totalSizes / itemsPerPage) : 0;

  if (isEditing && currentSize) {
    return (
      <div className="div-container bg-base-100 p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-base-300 mb-6">Editar Medida</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="edit-size_us" className="block text-sm font-medium text-base-250">
              Talla US
            </label>
            <input
              type="number"
              step="0.5"
              id="edit-size_us"
              value={editForm.size_us}
              onChange={(e) => setEditForm({ ...editForm, size_us: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary bg-base-200 text-base-400"
            />
          </div>
          <div>
            <label htmlFor="edit-size_eur" className="block text-sm font-medium text-base-250">
              Talla EUR
            </label>
            <input
              type="number"
              id="edit-size_eur"
              value={editForm.size_eur}
              onChange={(e) => setEditForm({ ...editForm, size_eur: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary bg-base-200 text-base-400"
            />
          </div>
          <div>
            <label htmlFor="edit-size_cm" className="block text-sm font-medium text-base-250">
              Talla CM
            </label>
            <input
              type="number"
              step="0.5"
              id="edit-size_cm"
              value={editForm.size_cm}
              onChange={(e) => setEditForm({ ...editForm, size_cm: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary bg-base-200 text-base-400"
            />
          </div>
          <div className="flex gap-4 mt-6">
            <ButtonAccent
              textContent="Guardar Cambios"
              onClick={handleSaveEdit}
            />
            <button
              onClick={handleCancelEdit}
              className="bg-base-200 text-base-300 py-2 px-4 rounded-lg font-medium hover:bg-base-300 hover:text-base-100 focus:outline-none focus:ring-2 focus:ring-base-250 cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="p-3 sm:p-5">
      <div>
        <div className="bg-base-100 relative shadow-md sm:rounded-lg overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
            <div className="w-full md:w-1/2">
              <h2 className="text-2xl font-bold text-base-300">Tabla de medidas</h2>
            </div>
            <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
              <button
                type="button"
                className="flex items-center justify-center text-base-100 bg-primary hover:bg-secondary focus:ring-4 focus:ring-primary-20 font-medium rounded-lg text-sm px-4 py-2 cursor-pointer"
                onClick={handleAddSize}
              >
                <svg
                  className="h-3.5 w-3.5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    clipRule="evenodd"
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  />
                </svg>
                Añadir Medida
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <CgSpinner className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-base-300">Cargando medidas...</span>
              </div>
            ) : error ? (
              <div className="text-center p-8 text-accent">
                <p>Error: {error}</p>
                <button onClick={fetchSizes} className="mt-4 text-primary underline">
                  Intentar de nuevo
                </button>
              </div>
            ) : sizes.length === 0 ? (
              <div className="text-center p-8 text-base-250">
                <p>No hay medidas para mostrar.</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left text-base-250">
                <thead className="text-xs text-base-300 uppercase">
                  <tr>
                    <th scope="col" className="px-4 py-3">
                      Talla US
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Talla EUR
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Talla CM
                    </th>
                    <th scope="col" className="px-4 py-3">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sizes.map((size) => (
                    <tr key={size._id || (size as any).id} className="border-b border-base-200 hover:bg-base-200">
                      <td className="px-4 py-3 font-medium text-base-300 whitespace-nowrap">
                        {size.size_us}
                      </td>
                      <td className="px-4 py-3 font-medium text-base-300 whitespace-nowrap">
                        {size.size_eur}
                      </td>
                      <td className="px-4 py-3 font-medium text-base-300 whitespace-nowrap">
                        {size.size_cm}
                      </td>
                      <td className="px-4 py-3 flex items-center justify-end">
                        <Dropdown
                          inline
                          label={<BsThreeDotsVertical className="w-5 h-5 text-base-250 cursor-pointer" />}
                          className="bg-base-100 border border-base-200 shadow-lg rounded-md"
                        >
                          <DropdownItem onClick={() => handleEdit(size)} className="hover:bg-base-200 text-base-300">
                            Editar
                          </DropdownItem>
                          <DropdownItem onClick={() => handleDeleteClick(size)} className="hover:bg-accent hover:text-base-100 text-base-300">
                            Eliminar
                          </DropdownItem>
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {/* Paginación */}
          <nav className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4" aria-label="Table navigation">
            <span className="text-sm font-normal text-base-250">
              {/* Muestra el rango de elementos si totalSizes es conocido */}
              {totalSizes > 0 ? (
                <>
                  Mostrando
                  <span className="font-semibold text-base-300">
                    {" " + ((currentPage - 1) * itemsPerPage + 1)}
                    -
                    {currentPage * itemsPerPage > totalSizes ? totalSizes : currentPage * itemsPerPage}
                  </span>
                  de
                  <span className="font-semibold text-base-300">
                    {" " + totalSizes}
                  </span>
                </>
              ) : (
                // Mensaje alternativo si el total no se conoce
                `Mostrando ${sizes.length} medidas en esta página.`
              )}
            </span>
            <ul className="inline-flex items-stretch -space-x-px">
              <li>
                <a
                  href="#"
                  className={`flex items-center justify-center h-full py-1.5 px-3 ml-0 text-base-250 rounded-l-lg border border-base-200 hover:bg-base-200 hover:text-base-300 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                >
                  <span className="sr-only">Anterior</span>
                  <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </a>
              </li>
              {/* Se generan dinámicamente los números de página si se conoce el total */}
              {totalPages > 0 && [...Array(totalPages)].map((_, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className={`flex items-center justify-center text-sm py-2 px-3 leading-tight text-base-250 border border-base-200 hover:bg-base-200 hover:text-base-300 cursor-pointer ${currentPage === index + 1 ? 'z-10 bg-primary-20 text-primary border-primary-20' : 'bg-base-100'}`}
                    onClick={(e) => { e.preventDefault(); handlePageChange(index + 1); }}
                  >
                    {index + 1}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#"
                  className={`flex items-center justify-center h-full py-1.5 px-3 leading-tight text-base-250 rounded-r-lg border border-base-200 hover:bg-base-200 hover:text-base-300 ${currentPage === totalPages || totalSizes === 0 && sizes.length < itemsPerPage ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                >
                  <span className="sr-only">Siguiente</span>
                  <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Modal de confirmación para eliminar */}
      <Modal show={props.openModal === 'pop-up'} size="md" popup={true} onClose={() => {
        props.setOpenModal(undefined);
        sizeIdRef.current = null;
        setPendingDeleteSizeName(null);
      }}>
        <div className="text-center p-6">
          <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400" />
          <h3 className="mb-5 text-lg font-normal text-gray-500">
            ¿Estás seguro de que quieres eliminar la medida
            {pendingDeleteSizeName ? (
              <span className="font-semibold text-accent">
                {" " + pendingDeleteSizeName}
              </span>
            ) : " seleccionada"}
            ?
          </h3>
          <div className="flex justify-center gap-4">
            <button
              className="bg-accent text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 cursor-pointer"
              onClick={handleDeleteConfirmed}
            >
              Sí, estoy seguro
            </button>
            <button
              className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 cursor-pointer"
              onClick={() => {
                props.setOpenModal(undefined);
                sizeIdRef.current = null;
                setPendingDeleteSizeName(null);
              }}
            >
              No, cancelar
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
};

export default TableSize;