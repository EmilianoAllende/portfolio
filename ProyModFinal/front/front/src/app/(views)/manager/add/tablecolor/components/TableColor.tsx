"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Dropdown, Modal, DropdownItem } from 'flowbite-react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { CgSpinner } from "react-icons/cg";
import { BsThreeDotsVertical } from 'react-icons/bs';
import api from '@/lib/axiosInstance';
import { ButtonAccent } from '@/components/UI/Buttons/Buttons';
import Input from '@/components/UI/Inputs/Input';
import toast from 'react-hot-toast';
import { routes } from '@/app/routes';

interface Color {
  _id: string;
  color: string;
  hexCode: string;
}

const TableColor: React.FC = () => {
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState<string | undefined>();

  const colorIdRef = useRef<string | null>(null);
  const [pendingDeleteColorName, setPendingDeleteColorName] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [currentColor, setCurrentColor] = useState<Color | null>(null);
  const [editForm, setEditForm] = useState({ color: '' });

  const router = useRouter();
  const props = { openModal, setOpenModal };

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(2);
  const [totalColors, setTotalColors] = useState(0);

  const fetchColors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/colors", {
        params: {
          page: currentPage,
          limit: itemsPerPage
        }
      });

      console.log("Respuesta de la API:", response.data);

      if (response.data && typeof response.data === 'object' && 'total' in response.data) {
        setColors(response.data.colors);
        setTotalColors(response.data.total);
      } else if (Array.isArray(response.data)) {
        setColors(response.data);
        setTotalColors(0);
        console.warn("La API devolvió un array directamente. No se puede determinar el total de colores para una paginación completa. Por favor, considera actualizar tu API para que devuelva también el total de elementos (ej: { colors: [...], total: 100 }).");
      } else {
        console.error("El formato de la respuesta de la API no es un objeto ni un array:", response.data);
        setColors([]);
        setTotalColors(0);
        setError('Error: Formato de respuesta de la API inesperado.');
      }

    } catch (err: any) {
      console.error("Error al obtener colores:", err);
      setError('Error al obtener los colores. Por favor, intenta de nuevo.');
      setColors([]);
      setTotalColors(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColors();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    if (page > 0 && (totalColors === 0 || page <= Math.ceil(totalColors / itemsPerPage))) {
      setCurrentPage(page);
    }
  };

  const handleAddColor = () => {
    router.push(routes.manager.add.color);
  };

  const handleEdit = (color: Color) => {
    setCurrentColor(color);
    setEditForm({ color: color.color });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!currentColor) return;

    if (editForm.color.trim() === '') {
      setError('Error: El nombre del color no puede estar vacío.');
      return;
    }

    const colorId = currentColor._id || (currentColor as any).id;
    if (!colorId) {
      console.error("Error: No se pudo obtener el ID del color para actualizar.");
      return;
    }

    try {
      setLoading(true);
      await api.put(`/colors/${colorId}`, {
        color: editForm.color,
        hexCode: currentColor.hexCode,
      });
      toast.success('¡Cambios realizados!');
      await fetchColors();
      setIsEditing(false);
      setCurrentColor(null);
      setEditForm({ color: '' });
    } catch (err: any) {
      console.error("Error al actualizar el color:", err);
      setError('Error al actualizar el color. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCurrentColor(null);
    setEditForm({ color: '' });
  };

  const handleDeleteClick = (color: Color) => {
    const colorId = color._id || (color as any).id;

    if (colorId && typeof colorId === 'string') {
      colorIdRef.current = colorId;
      setPendingDeleteColorName(`${color.color}`);
      props.setOpenModal('pop-up');
    } else {
      console.error("Error: El color seleccionado no tiene un ID válido.", color);
      setError('No se pudo seleccionar el color para eliminar. Por favor, intenta de nuevo.');
    }
  };

  const handleDeleteConfirmed = async () => {
    const idToDelete = colorIdRef.current;

    if (!idToDelete) {
      console.error("Error interno: No se pudo obtener el ID del color para eliminar.");
      props.setOpenModal(undefined);
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/colors/${idToDelete}`);

      await fetchColors();

      props.setOpenModal(undefined);
      colorIdRef.current = null;
      setPendingDeleteColorName(null);
    } catch (err: any) {
      console.error("Error al eliminar el color:", err);
      setError('Error al eliminar el color. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = totalColors > 0 ? Math.ceil(totalColors / itemsPerPage) : 0;

  if (isEditing && currentColor) {
    return (
      <div className="div-container bg-base-100 p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-base-300 mb-6">Editar Color</h2>
        <div className="space-y-4">
          <Input
            label="Nombre del color"
            name="color"
            type="text"
            value={editForm.color}
            onChange={(e) => setEditForm({ color: e.target.value })}
            placeholder="Introduce el nombre del color"
          />
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
              <h2 className="text-2xl font-bold text-base-300">Tabla de colores</h2>
            </div>
            <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
              <button
                type="button"
                className="flex items-center justify-center text-base-100 bg-primary hover:bg-secondary focus:ring-4 focus:ring-primary-20 font-medium rounded-lg text-sm px-4 py-2 cursor-pointer"
                onClick={handleAddColor}
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
                Añadir Color
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <CgSpinner className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-base-300">Cargando colores...</span>
              </div>
            ) : error ? (
              <div className="text-center p-8 text-accent">
                <p>Error: {error}</p>
                <button onClick={fetchColors} className="mt-4 text-primary underline">
                  Intentar de nuevo
                </button>
              </div>
            ) : colors.length === 0 ? (
              <div className="text-center p-8 text-base-250">
                <p>No hay colores para mostrar.</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left text-base-250">
                <thead className="text-xs text-base-300 uppercase">
                  <tr>
                    <th scope="col" className="px-4 py-3">
                      Color
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Vista previa
                    </th>
                    <th scope="col" className="px-4 py-3">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {colors.map((color) => (
                    <tr key={color._id || (color as any).id} className="border-b border-base-200 hover:bg-base-200">
                      <td className="px-4 py-3 font-medium text-base-300 whitespace-nowrap">
                        {color.color}
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className="w-6 h-6 rounded-full border border-gray-300"
                          style={{ backgroundColor: color.hexCode }}
                          title={color.hexCode}
                        ></div>
                      </td>
                      <td className="px-4 py-3 flex items-center justify-end">
                        <Dropdown
                          inline
                          label={<BsThreeDotsVertical className="w-5 h-5 text-base-250 cursor-pointer" />}
                          className="bg-base-100 border border-base-200 shadow-lg rounded-md"
                        >
                          <DropdownItem onClick={() => handleEdit(color)} className="hover:bg-base-200 text-base-300">
                            Editar
                          </DropdownItem>
                          <DropdownItem onClick={() => handleDeleteClick(color)} className="hover:bg-accent hover:text-base-100 text-base-300">
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
          <nav className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4" aria-label="Table navigation">
            <span className="text-sm font-normal text-base-250">
              {totalColors > 0 ? (
                <>
                  Mostrando
                  <span className="font-semibold text-base-300">
                    {" " + ((currentPage - 1) * itemsPerPage + 1)}
                    -
                    {currentPage * itemsPerPage > totalColors ? totalColors : currentPage * itemsPerPage}
                  </span>
                  de
                  <span className="font-semibold text-base-300">
                    {" " + totalColors}
                  </span>
                </>
              ) : (
                `Mostrando ${colors.length} colores en esta página.`
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
                  className={`flex items-center justify-center h-full py-1.5 px-3 leading-tight text-base-250 rounded-r-lg border border-base-200 hover:bg-base-200 hover:text-base-300 ${currentPage === totalPages || totalColors === 0 && colors.length < itemsPerPage ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
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

      <Modal show={props.openModal === 'pop-up'} size="md" popup={true} onClose={() => {
        props.setOpenModal(undefined);
        colorIdRef.current = null;
        setPendingDeleteColorName(null);
      }}>
        <div className="text-center p-6">
          <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400" />
          <h3 className="mb-5 text-lg font-normal text-gray-500">
            ¿Estás seguro de que quieres eliminar el color
            {pendingDeleteColorName ? (
              <span className="font-semibold text-accent">
                {" " + pendingDeleteColorName}
              </span>
            ) : " seleccionado"}
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
                colorIdRef.current = null;
                setPendingDeleteColorName(null);
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

export default TableColor;