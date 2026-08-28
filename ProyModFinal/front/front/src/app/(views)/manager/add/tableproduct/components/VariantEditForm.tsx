"use client";
import React, { useEffect, useState } from "react";
import { FieldArray, Field, ErrorMessage, useFormikContext, getIn } from "formik";
import Image from "next/image";
import MultipleImagesCloudinaryButton from "@/components/UI/Buttons/MultipleImagesCloudinaryButton";
import api from "@/lib/axiosInstance";
import Select from "react-select";
import { ButtonAccent } from "@/components/UI/Buttons/Buttons";
import toast from 'react-hot-toast';
import { Modal } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";

interface ColorOption {
    value: string;
    label: string;
    hexCode: string;
    id: string;
}

interface SizeOption {
    id: string;
    size_us?: string | number;
    size_eur?: string | number;
    size_cm?: string | number;
}

export interface VarianteForm {
    id?: string;
    color_id: string;
    color: string;
    images: string[];
    description: string;
    variantSizes: {
        id?: string;
        size_id: string;
        stock: number | string;
    }[];
}

interface VariantEditFormProps {
    name: string;
    variantIndex?: number;
    onSaveVariant?: (variantData: VarianteForm) => Promise<void>;
    onDeleteVariant?: (variantId: string) => Promise<void>;
    onSaveSize: (sizeData: { id?: string; size_id: string; stock: number | string }, variantId: string) => Promise<void>;
    onDeleteSize: (sizeId: string) => Promise<void>;
    initialShowSizes?: boolean;
    isNewVariant?: boolean;
    showActionButtons?: boolean;
}

const VariantEditForm: React.FC<VariantEditFormProps> = ({
    name,
    variantIndex,
    onSaveVariant,
    onDeleteVariant,
    onSaveSize,
    onDeleteSize,
    initialShowSizes = false,
    isNewVariant = false,
    showActionButtons = true
}) => {
    const { setFieldValue, values } = useFormikContext<any>();

    const [colorOptions, setColorOptions] = useState<ColorOption[]>([]);
    const [sizeOptions, setSizeOptions] = useState<SizeOption[]>([]);
    const [loadingColors, setLoadingColors] = useState(true);
    const [loadingSizes, setLoadingSizes] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showSizesSection, setShowSizesSection] = useState(initialShowSizes);
    const variantPath = variantIndex !== undefined ? `${name}[${variantIndex}]` : name;
    const currentVariant: VarianteForm = getIn(values, variantPath);

    const safeCurrentVariant = currentVariant || { id: undefined, color_id: "", color: "", images: [], description: "", variantSizes: [] };

    const [openModal, setOpenModal] = useState<string | undefined>();
    const [variantIdToDelete, setVariantIdToDelete] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [colorsRes, sizesRes] = await Promise.all([
                    api.get("/colors"),
                    api.get("/sizes")
                ]);
                const colorOpts = colorsRes.data.map((col: { id: string; color: string; hexCode: string }) => ({
                    value: col.color,
                    label: col.color,
                    hexCode: col.hexCode,
                    id: col.id,
                }));
                setColorOptions(colorOpts);
                const sizeOpts = sizesRes.data.map((size: any) => ({
                    id: size.id,
                    size_us: size.size_us,
                    size_eur: size.size_eur,
                    size_cm: size.size_cm,
                }));
                setSizeOptions(sizeOpts);
            } catch (error) {
                console.error("Error al obtener datos:", error);
                toast.error("Error al cargar colores o tallas.");
            } finally {
                setLoadingColors(false);
                setLoadingSizes(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (safeCurrentVariant && safeCurrentVariant.color_id && colorOptions.length > 0) {
            const selected = colorOptions.find(opt => opt.id === safeCurrentVariant.color_id);
            if (selected && safeCurrentVariant.color !== selected.value) {
                const fieldPathColor = getFieldPath("color");
                setFieldValue(fieldPathColor, selected.value);
            }
        }
    }, [safeCurrentVariant.color_id, colorOptions, setFieldValue, name, variantIndex, safeCurrentVariant.color]);


    const handleSaveCurrentVariant = async () => {
        if (!onSaveVariant) {
            toast.error("La función para guardar la variante no está disponible.");
            return;
        }
        setIsSaving(true);
        try {
            await onSaveVariant(safeCurrentVariant);
        } catch (error) {
            console.error("Error al guardar variante:", error);
            toast.error('Error al actualizar la variante.');
        } finally {
            setIsSaving(false);
        }
    };

    // const handleDeleteCurrentVariant = async () => {
    //     if (!onDeleteVariant || !safeCurrentVariant.id) {
    //         toast.error('No se puede eliminar una variante sin ID o la función de eliminación no está disponible.');
    //         return;
    //     }
    //     setIsDeleting(true);
    //     try {
    //         await onDeleteVariant(safeCurrentVariant.id);
    //     } catch (error) {
    //         console.error("Error al eliminar variante:", error);
    //         toast.error('Error al eliminar la variante.');
    //     } finally {
    //         setIsDeleting(false);
    //     }
    // };

    // NUEVA FUNCIÓN PARA ABRIR EL MODAL
    const handleOpenDeleteModal = (variantId: string) => {
        setVariantIdToDelete(variantId);
        setOpenModal("pop-up");
    };

    // NUEVA FUNCIÓN PARA CONFIRMAR ELIMINACIÓN
    const handleDeleteVariantConfirmed = async () => {
        if (variantIdToDelete && onDeleteVariant) {
            setIsDeleting(true);
            try {
                await onDeleteVariant(variantIdToDelete);
                setOpenModal(undefined);
                setVariantIdToDelete(null);
            } catch (error) {
                console.error("Error al eliminar variante:", error);
                toast.error('Error al eliminar la variante.');
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const getFieldPath = (field: string) => {
        return variantPath ? `${variantPath}.${field}` : field;
    };

    const getSizesFieldArrayPath = () => {
        return variantPath ? `${variantPath}.variantSizes` : "variantSizes";
    };

    return (
        <div className="border p-4 rounded-lg mb-4 bg-white flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                    <label className="block font-semibold text-[#4e4090] mb-2">
                        Color
                    </label>
                    <Select
                        name={getFieldPath("color_id")}
                        options={colorOptions}
                        className="basic-single"
                        classNamePrefix="select"
                        isLoading={loadingColors}
                        value={colorOptions.find(option => option.id === safeCurrentVariant.color_id) || null}
                        onChange={(newValue: ColorOption | null) => {
                            setFieldValue(getFieldPath("color_id"), newValue ? newValue.id : "");
                            setFieldValue(getFieldPath("color"), newValue ? newValue.value : "");
                        }}
                        placeholder="Seleccioná un color"
                        noOptionsMessage={() => "No hay colores disponibles"}
                    />
                    <ErrorMessage
                        name={getFieldPath("color_id")}
                        component="div"
                        className="text-red-500 text-sm"
                    />
                    {safeCurrentVariant.color_id && (
                        <div className="mt-4 flex flex-wrap items-center gap-4">
                            <span className="text-gray-700">Vista previa:</span>
                            <div
                                className="w-10 h-10 rounded-full border"
                                style={{ backgroundColor: colorOptions.find(opt => opt.id === safeCurrentVariant.color_id)?.hexCode || '#FFFFFF' }}
                            ></div>
                            <span className="text-gray-600">
                                {colorOptions.find(opt => opt.id === safeCurrentVariant.color_id)?.label || safeCurrentVariant.color}
                            </span>
                        </div>
                    )}
                </div>
                <div>
                    <label className="block font-semibold text-[#4e4090] mb-2">
                        Descripción
                    </label>
                    <Field
                        name={getFieldPath("description")}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="Ej. Color vibrante ideal para verano"
                    />
                    <ErrorMessage
                        name={getFieldPath("description")}
                        component="div"
                        className="text-red-500 text-sm"
                    />
                </div>
            </div>

            <div>
                <label className="block text-md font-semibold text-[#4e4090] mb-2">
                    Imágenes de la Variante:
                </label>
                <MultipleImagesCloudinaryButton
                    onUploadSuccess={(urls: string[]) => {
                        const currentImages = Array.isArray(safeCurrentVariant.images) ? safeCurrentVariant.images : [];
                        const updatedImages = [...currentImages, ...urls];
                        setFieldValue(getFieldPath("images"), updatedImages);
                    }}
                    buttonText="Subir imágenes"
                />

                <div className="flex flex-wrap gap-2 mt-2">
                    {safeCurrentVariant.images &&
                        safeCurrentVariant.images.length > 0 &&
                        safeCurrentVariant.images.map((imgUrl: string, imgIndex: number) => (
                            <div
                                key={`image-${safeCurrentVariant.id || 'new'}-${imgIndex}`}
                                className="w-20 h-20 relative border rounded overflow-hidden"
                            >
                                <Image
                                    src={imgUrl}
                                    alt={`Preview ${imgIndex + 1}`}
                                    fill
                                    className="object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const updatedImages = safeCurrentVariant.images.filter(
                                            (_, i) => i !== imgIndex
                                        );
                                        setFieldValue(getFieldPath("images"), updatedImages);
                                    }}
                                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                    aria-label="Eliminar imagen"
                                >
                                    X
                                </button>
                            </div>
                        ))}
                </div>
                <ErrorMessage
                    name={getFieldPath("images")}
                    component="div"
                    className="text-red-500 text-sm mt-1"
                />
            </div>
            {/* Los botones de acción ahora se controlan con showActionButtons */}
            {showActionButtons && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-2 gap-4">
                    {!isNewVariant && onDeleteVariant && safeCurrentVariant.id && (
                        <div className="p-6">
                            <button
                                type="button"
                                onClick={() => handleOpenDeleteModal(safeCurrentVariant.id!)}
                                className="text-red-600 hover:underline cursor-pointer"
                            >
                                Eliminar variante
                            </button>
                            {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
                            <Modal show={openModal === 'pop-up'} size="md" popup={true} onClose={() => setOpenModal(undefined)}  className="flex items-center justify-center">
                                <div className="p-6">
                                    <div className="text-center">
                                        <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400" />
                                        <h3 className="mb-5 text-lg font-normal text-gray-500">
                                            ¿Estás seguro de que quieres eliminar la variante seleccionada?
                                        </h3>
                                        <div className="flex justify-center gap-4">
                                            <ButtonAccent
                                                textContent={isDeleting ? "Eliminando..." : "Sí, estoy seguro"}
                                                onClick={handleDeleteVariantConfirmed}
                                                disabled={isDeleting}
                                            />
                                            <button
                                                className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 cursor-pointer"
                                                onClick={() => {
                                                    setOpenModal(undefined);
                                                    setVariantIdToDelete(null);
                                                }}
                                            >
                                                No, cancelar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Modal>
                        </div>
                    )}
                    <ButtonAccent
                        textContent={isSaving ? "Guardando..." : "Guardar Cambios de Variante"}
                        onClick={handleSaveCurrentVariant}
                        type="button"
                        disabled={isSaving}
                    />
                </div>
            )}

            {!showSizesSection && (
                <div className="flex justify-end mt-4">
                    <button
                        type="button"
                        onClick={() => {
                            if (!safeCurrentVariant.color_id || safeCurrentVariant.images.length === 0 || !safeCurrentVariant.description) {
                                toast.error("Completa el color, al menos una imagen y la descripción de la variante para habilitar los talles y stock.");
                                return;
                            }
                            setShowSizesSection(true);
                            if (!safeCurrentVariant.variantSizes || safeCurrentVariant.variantSizes.length === 0) {
                                setFieldValue(getSizesFieldArrayPath(), [{ size_id: "", stock: "" }]);
                            }
                        }}
                        className="bg-[#4e4090] text-white px-4 py-2 rounded hover:bg-[#3d3370] cursor-pointer w-full sm:w-auto"
                    >
                        Gestionar Talles y Stock
                    </button>
                </div>
            )}

            {showSizesSection && (
                <FieldArray name={getSizesFieldArrayPath()}>
                    {({ push, remove }) => (
                        <div className="border border-gray-200 p-4 rounded-lg mt-4">
                            <h4 className="text-lg font-bold text-[#4e4090] mb-3">
                                Talles y Stock
                            </h4>
                            {safeCurrentVariant.variantSizes && safeCurrentVariant.variantSizes.length > 0 ? (
                                safeCurrentVariant.variantSizes.map((sizeDetail, sizeIndex: number) => {
                                    const selectedSizeOption = sizeOptions.find(opt => opt.id === sizeDetail.size_id);
                                    const sizeIdFieldPath = `${getSizesFieldArrayPath()}[${sizeIndex}].size_id`;
                                    const stockFieldPath = `${getSizesFieldArrayPath()}[${sizeIndex}].stock`;

                                    return (
                                        <div
                                            key={sizeDetail.id || `new-size-${sizeIndex}`}
                                            className="border border-[#ccc] p-3 rounded-lg mb-2 bg-white flex flex-col gap-2"
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block font-semibold text-[#4e4090]">Talle (Unidad)</label>
                                                    <Select
                                                        name={sizeIdFieldPath}
                                                        options={sizeOptions.map(size => ({
                                                            value: size.id,
                                                            label: `${size.size_us ? `US: ${size.size_us}` : ''}${size.size_eur ? ` EUR: ${size.size_eur}` : ''}${size.size_cm ? ` CM: ${size.size_cm}` : ''}`
                                                        }))}
                                                        className="basic-single"
                                                        classNamePrefix="select"
                                                        isLoading={loadingSizes}
                                                        value={selectedSizeOption ? { value: selectedSizeOption.id, label: `${selectedSizeOption.size_us ? `US: ${selectedSizeOption.size_us}` : ''}${selectedSizeOption.size_eur ? ` EUR: ${selectedSizeOption.size_eur}` : ''}${selectedSizeOption.size_cm ? ` CM: ${selectedSizeOption.size_cm}` : ''}` } : null}
                                                        onChange={(newValue: any) => {
                                                            setFieldValue(sizeIdFieldPath, newValue ? newValue.value : "");
                                                        }}
                                                        placeholder="Seleccionar talla"
                                                        noOptionsMessage={() => "No hay tallas disponibles"}
                                                    />
                                                    <ErrorMessage
                                                        name={sizeIdFieldPath}
                                                        component="div"
                                                        className="text-red-500 text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block font-semibold text-[#4e4090]">Stock</label>
                                                    <Field
                                                        name={stockFieldPath}
                                                        type="number"
                                                        className="w-full p-2 border border-gray-300 rounded"
                                                    />
                                                    <ErrorMessage
                                                        name={stockFieldPath}
                                                        component="div"
                                                        className="text-red-500 text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-end mt-2 gap-2">
                                                {sizeDetail.id && safeCurrentVariant.id && (
                                                    <ButtonAccent
                                                        textContent={isSaving ? "Guardando..." : "Guardar Talla"}
                                                        onClick={() => onSaveSize(sizeDetail, safeCurrentVariant.id!)}
                                                        type="button"
                                                        disabled={isSaving}
                                                        className="text-sm px-3 py-1"
                                                    />
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (sizeDetail.id && onDeleteSize) {
                                                            onDeleteSize(sizeDetail.id);
                                                        } else {
                                                            remove(sizeIndex);
                                                        }
                                                    }}
                                                    className="text-red-600 hover:underline text-sm cursor-pointer"
                                                >
                                                    Eliminar Talle/Stock
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-gray-500 italic mb-3">No hay talles y stock definidos para esta variante. Agrega uno.</p>
                            )}
                            <button
                                type="button"
                                onClick={() => push({ size_id: "", stock: "" })}
                                className="bg-[#4e4090] text-white px-3 py-1 rounded mt-2 hover:bg-[#3d3370] text-sm cursor-pointer w-full sm:w-auto"
                            >
                                Agregar Talle/Stock
                            </button>
                        </div>
                    )}
                </FieldArray>
            )}
        </div>
    );
};

export default VariantEditForm;