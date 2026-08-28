"use client";
import React, { useEffect, useState } from "react";
import { FieldArray, Field, ErrorMessage, useFormikContext } from "formik";
import VariantProduct2 from "./VariantProduct2";
import Image from "next/image";
import MultipleImagesCloudinaryButton from "@/components/UI/Buttons/MultipleImagesCloudinaryButton";
import api from "@/lib/axiosInstance";
import Select from "react-select";

interface Props {
  name: string;
}

interface ColorOption {
  value: string;
  label: string;
  hexCode: string;
  id: string; // ID del color
}

interface Variante {
  id: string;
  color_id: string; 
  color: string;
  images: string[];
  descripcion: string;
  variants2: {
    talle: string;
    stock: number | string;
  }[]
}

const VariantProduct: React.FC<Props> = ({ name }) => {
  const [showVariant2, setShowVariant2] = useState<boolean[]>([]);
  const [colorOptions, setColorOptions] = useState<ColorOption[]>([]);
  const [loadingColors, setLoadingColors] = useState(true);

  const { setFieldValue, values } = useFormikContext<any>();

  useEffect(() => {
    const fetchColors = async () => {
      try {
        const res = await api.get("/colors");
        const options = res.data.map((col: { id: string; color: string; hexCode: string }) => ({
          value: col.color,
          label: col.color,
          hexCode: col.hexCode,
          id: col.id, 
        }));
        setColorOptions(options);
      } catch (error) {
        console.error("Error al obtener colores:", error);
      } finally {
        setLoadingColors(false);
      }
    };
    fetchColors();
  }, []);


  return (
    <FieldArray name={name}>
      {({ push, remove, form }) => (
        <div className="border border-gray-300 p-4 sm:p-6 rounded-lg mt-6 mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
          <h3 className="text-xl font-bold text-[#4e4090] mb-4">Variantes del Producto</h3>
          {(form.values[name] as Variante[]).map((variante, index: number) => {
            const selectedColorOption = colorOptions.find(
              (option) => option.id === variante.color_id
            );

            return (
              <div
                key={variante.id}
                className="border border-[#d3d3d3] p-4 rounded-lg mb-4 bg-white flex flex-col gap-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-[#4e4090] mb-2">
                      Color
                    </label>
                    <Select
                      name={`${name}[${index}].color_id`}
                      options={colorOptions}
                      className="basic-single"
                      classNamePrefix="select"
                      isLoading={loadingColors}
                      value={selectedColorOption || null}
                      onChange={(newValue: ColorOption | null) => {
                        setFieldValue(
                          `${name}[${index}].color_id`,
                          newValue ? newValue.id : "" 
                        );
                        setFieldValue(
                          `${name}[${index}].color`,
                          newValue ? newValue.value : "" 
                        );
                      }}
                      placeholder="Seleccioná un color"
                      noOptionsMessage={() => "No hay colores disponibles"}
                    />
                    <ErrorMessage
                      name={`${name}[${index}].color_id`}
                      component="div"
                      className="text-red-500 text-sm"
                    />
                    {/* VISTA PREVIA DEL COLOR */}
                    {selectedColorOption && (
                      <div className="mt-4 flex flex-wrap items-center gap-4">
                        <span className="text-gray-700">Vista previa:</span>
                        <div
                          className="w-10 h-10 rounded-full border"
                          style={{ backgroundColor: selectedColorOption.hexCode }}
                        ></div>
                        <span className="text-gray-600">
                          {selectedColorOption.label}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block font-semibold text-[#4e4090] mb-2">
                      Descripción
                    </label>
                    <Field
                      name={`${name}[${index}].descripcion`}
                      className="w-full p-2 border border-gray-300 rounded"
                      placeholder="Ej. Color vibrante ideal para verano"
                    />
                    <ErrorMessage
                      name={`${name}[${index}].descripcion`}
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-md font-semibold text-[#4e4090] mb-2">
                    Imagen de la Variante:
                  </label>
                  <MultipleImagesCloudinaryButton
                    onUploadSuccess={(urls: string[]) => {
                      const currentImages =
                        (form.values[name][index] as Variante).images || [];
                      form.setFieldValue(
                        `${name}[${index}].images`,
                        Array.isArray(currentImages)
                          ? [...currentImages, ...urls]
                          : [...urls]
                      );
                    }}
                    buttonText="Subir imágenes"
                  />

                  <div className="flex flex-wrap gap-2 mt-2">
                    {variante.images &&
                      variante.images.length > 0 &&
                      variante.images.map((imgUrl: string, imgIndex: number) => (
                        <div
                          key={`image-${variante.id}-${imgIndex}`}
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
                              const updatedImages = variante.images.filter(
                                (_, i) => i !== imgIndex
                              );
                              form.setFieldValue(
                                `${name}[${index}].images`,
                                updatedImages
                              );
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
                    name={`${name}[${index}].images`}
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center mt-2 gap-4">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-red-600 hover:underline cursor-pointer"
                  >
                    Eliminar variante
                  </button>
                </div>
                {!showVariant2[index] && (
                  <div className="flex justify-end mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        const currentVariant = (values[name] as Variante[])[
                          index
                        ];
                        if (
                          currentVariant.color_id &&
                          currentVariant.images.length > 0 &&
                          currentVariant.descripcion
                        ) {
                          const newShowVariant2 = [...showVariant2];
                          newShowVariant2[index] = true;
                          setShowVariant2(newShowVariant2);
                          if (
                            !currentVariant.variants2 ||
                            currentVariant.variants2.length === 0
                          ) {
                            setFieldValue(`${name}[${index}].variants2`, [
                              { talle: "", stock: "" },
                            ]);
                          }
                        } else {
                          alert(
                            "Completa el color, al menos una imagen y la descripción de la variante para habilitar los talles y stock."
                          );
                        }
                      }}
                      className="bg-[#4e4090] text-white px-4 py-2 rounded hover:bg-[#3d3370] cursor-pointer w-full sm:w-auto"
                    >
                      Aceptar Variantes
                    </button>
                  </div>
                )}

                {showVariant2[index] && (
                  <FieldArray name={`${name}[${index}].variants2`}>
                    {({ push: push2, remove: remove2, form: form2 }) => (
                      <div className="border border-gray-200 p-4 rounded-lg mt-4">
                        <h4 className="text-lg font-bold text-[#4e4090] mb-3">
                          Talles y Stock
                        </h4>
                        {(
                          form2.values[name][index]
                            .variants2 as { talle: string; stock: number | string }[]
                        ).map((_, subIndex: number) => (
                          <div
                            key={subIndex}
                            className="border border-[#ccc] p-3 rounded-lg mb-2 bg-white flex flex-col gap-2"
                          >
                            <VariantProduct2
                              name={`${name}[${index}].variants2`}
                              index={subIndex}
                            />
                            <div className="flex justify-end mt-2">
                              <button
                                type="button"
                                onClick={() => remove2(subIndex)}
                                className="text-red-600 hover:underline text-sm cursor-pointer"
                              >
                                Eliminar Talle/Stock
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => push2({ talle: "", stock: "" })}
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
          })}

          <button
            type="button"
            onClick={() => {
              push({
                id: Date.now(),
                color_id: "", 
                color: "",
                images: [],
                descripcion: "",
                variants2: [],
              });
              setShowVariant2([...showVariant2, false]);
            }}
            className="bg-[#4e4090] text-white px-4 py-2 rounded mt-6 hover:bg-[#3d3370] cursor-pointer w-full sm:w-auto mx-auto block"
          >
            Agregar variante
          </button>
        </div>
      )}
    </FieldArray>
  );
};

export default VariantProduct;
