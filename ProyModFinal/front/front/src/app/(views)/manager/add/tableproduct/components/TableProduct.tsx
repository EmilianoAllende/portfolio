"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dropdown, Modal, DropdownItem } from 'flowbite-react'; 
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { CgSpinner } from "react-icons/cg";
import { BsThreeDotsVertical } from 'react-icons/bs';
import api from '@/lib/axiosInstance'; 
import { ButtonAccent } from '@/components/UI/Buttons/Buttons';
import { IApiProductExtended } from '@/interfaces/product-extended';
import ProductDetailsView from './ProductDetailsView';
import { routes } from '@/app/routes';

const TableProduct: React.FC = () => {
    const [products, setProducts] = useState<IApiProductExtended[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openModal, setOpenModal] = useState<string | undefined>();
    const [productIdToDelete, setProductIdToDelete] = useState<string | null>(null);
    const [pendingDeleteProductName, setPendingDeleteProductName] = useState<string | null>(null);

    // Estados para la paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(3); // Ajusta a cantidad x
    const [totalProducts, setTotalProducts] = useState(0);

    const [isViewingDetails, setIsViewingDetails] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<IApiProductExtended | null>(null);

    const router = useRouter();

    // Función para obtener los productos con paginación
    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get<IApiProductExtended[]>("/products", {
                params: {
                    page: currentPage,
                    limit: itemsPerPage
                }
            });

            if (Array.isArray(response.data)) {
                const totalCountHeader = response.headers['x-total-count'];
                const totalCount = totalCountHeader ? parseInt(totalCountHeader, 10) : response.data.length;

                setProducts(response.data); 
                setTotalProducts(totalCount); 

            } else {
                console.error("El formato de la respuesta de la API no es un array:", response.data);
                setProducts([]);
                setTotalProducts(0);
                setError('Error: La API no devolvió una lista de productos.');
            }

        } catch (err: any) {
            console.error("Error al obtener productos:", err);
            setError('Error al obtener los productos. Por favor, intenta de nuevo.');
            setProducts([]);
            setTotalProducts(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [currentPage]);

    const handlePageChange = (page: number) => {
        if (page > 0 && (totalProducts === 0 || page <= Math.ceil(totalProducts / itemsPerPage))) {
            setCurrentPage(page);
        }
    };

    const handleAddProduct = () => {
        router.push(routes.manager.add.product);
    };

    const handleViewDetails = (product: IApiProductExtended) => {
        setCurrentProduct(product);
        setIsViewingDetails(true);
    };

    const handleCloseDetails = () => {
        setCurrentProduct(null);
        setIsViewingDetails(false);
        fetchProducts();
    };

    const handleDeleteProductClick = (product: IApiProductExtended) => {
        setProductIdToDelete(product.id);
        setPendingDeleteProductName(product.name);
        setOpenModal('pop-up');
    };

    const handleDeleteProductConfirmed = async () => {
        const idToDelete = productIdToDelete;
        if (!idToDelete) {
            console.error("Error: No se pudo obtener el ID del producto para eliminar.");
            setOpenModal(undefined);
            return;
        }

        try {
            setLoading(true);
            await api.delete(`/products/${idToDelete}`);
            await fetchProducts();
            setOpenModal(undefined);
            setProductIdToDelete(null);
            setPendingDeleteProductName(null);
        } catch (err: any) {
            console.error("Error al eliminar el producto:", err);
            setError('Error al eliminar el producto. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const totalPages = totalProducts > 0 ? Math.ceil(totalProducts / itemsPerPage) : 0;

    if (isViewingDetails && currentProduct) {
        return (
            <ProductDetailsView
                product={currentProduct}
                onClose={handleCloseDetails}
            />
        );
    }

    return (
        <section className="p-3 sm:p-5">
            <div>
                <div className="bg-base-100 relative shadow-md sm:rounded-lg overflow-hidden">
                    <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                        <div className="w-full md:w-1/2">
                            <h2 className="text-2xl font-bold text-base-300">Tabla de Productos</h2>
                        </div>
                        <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
                            <button
                                type="button"
                                className="flex items-center justify-center text-base-100 bg-primary hover:bg-secondary focus:ring-4 focus:ring-primary-20 font-medium rounded-lg text-sm px-4 py-2 cursor-pointer"
                                onClick={handleAddProduct}
                            >
                                <svg className="h-3.5 w-3.5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <path clipRule="evenodd" fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                                </svg>
                                Añadir Producto
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="flex justify-center items-center p-8">
                                <CgSpinner className="h-8 w-8 animate-spin text-primary" />
                                <span className="ml-3 text-base-300">Cargando productos...</span>
                            </div>
                        ) : error ? (
                            <div className="text-center p-8 text-accent">
                                <p>Error: {error}</p>
                                <button onClick={fetchProducts} className="mt-4 text-primary underline">
                                    Intentar de nuevo
                                </button>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center p-8 text-base-250">
                                <p>No hay productos para mostrar.</p>
                            </div>
                        ) : (
                            <table className="w-full text-sm text-left text-base-250">
                                <thead className="text-xs text-base-300 uppercase">
                                    <tr>
                                        <th scope="col" className="px-4 py-3">Nombre</th>
                                        <th scope="col" className="px-4 py-3">Código</th>
                                        <th scope="col" className="px-4 py-3">Precio de Venta</th>
                                        <th scope="col" className="px-4 py-3">Variantes</th>
                                        <th scope="col" className="px-4 py-3">
                                            <span className="sr-only">Acciones</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product.id} className="border-b border-base-200 hover:bg-base-200">
                                            <td className="px-4 py-3 font-medium text-base-300 whitespace-nowrap">{product.name}</td>
                                            <td className="px-4 py-3 font-medium text-base-300 whitespace-nowrap">{product.code}</td>
                                            <td className="px-4 py-3 font-medium text-base-300 whitespace-nowrap">
                                                ${typeof product.sale_price === 'string' ? parseFloat(product.sale_price).toFixed(2) : product.sale_price.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-base-300 whitespace-nowrap">{product.variants?.length || 0}</td>
                                            <td className="px-4 py-3 flex items-center justify-end">
                                                <Dropdown
                                                    inline
                                                    label={<BsThreeDotsVertical className="w-5 h-5 text-base-250 cursor-pointer" />}
                                                    className="bg-base-100 border border-base-200 shadow-lg rounded-md"
                                                >
                                                    <DropdownItem onClick={() => handleViewDetails(product)} className="hover:bg-base-200 text-base-300">
                                                        Ver Detalles
                                                    </DropdownItem>
                                                    <DropdownItem onClick={() => handleDeleteProductClick(product)} className="hover:bg-accent hover:text-base-100 text-base-300">
                                                        Eliminar Producto
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
                            {totalProducts > 0 ? (
                                <>
                                    Mostrando
                                    <span className="font-semibold text-base-300">
                                        {" " + ((currentPage - 1) * itemsPerPage + 1)}
                                        -
                                        {currentPage * itemsPerPage > totalProducts ? totalProducts : currentPage * itemsPerPage}
                                    </span>
                                    {" "} de
                                    <span className="font-semibold text-base-300">
                                        {" " + totalProducts}
                                    </span>
                                </>
                            ) : (
                                `Mostrando ${products.length} productos en esta página.`
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
                                    className={`flex items-center justify-center h-full py-1.5 px-3 leading-tight text-base-250 rounded-r-lg border border-base-200 hover:bg-base-200 hover:text-base-300 ${currentPage === totalPages || totalProducts === 0 && products.length < itemsPerPage ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
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

            {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
            <Modal show={openModal === 'pop-up'} size="md" popup={true} onClose={() => setOpenModal(undefined)}>
                <div className="p-6">
                    <div className="text-center">
                        <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400" />
                        <h3 className="mb-5 text-lg font-normal text-gray-500">
                            ¿Estás seguro de que quieres eliminar el producto
                            {pendingDeleteProductName ? (
                                <span className="font-semibold text-accent">
                                    {" " + pendingDeleteProductName}
                                </span>
                            ) : " seleccionado"}
                            ?
                        </h3>
                        <div className="flex justify-center gap-4">
                            <ButtonAccent
                                textContent="Sí, estoy seguro"
                                onClick={handleDeleteProductConfirmed}
                            />
                            <button
                                className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 cursor-pointer"
                                onClick={() => {
                                    setOpenModal(undefined);
                                    setProductIdToDelete(null);
                                    setPendingDeleteProductName(null);
                                }}
                            >
                                No, cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
        </section>
    );
};

export default TableProduct;