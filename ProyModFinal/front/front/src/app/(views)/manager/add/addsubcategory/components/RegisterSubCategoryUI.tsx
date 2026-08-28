"use client";

import React, { useEffect, useRef, useState } from "react";
import { Formik, Form, ErrorMessage } from "formik";
import * as yup from "yup";
import { ButtonAccent } from "@/components/UI/Buttons/Buttons";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import CloudinaryButton from "@/components/UI/Buttons/CloudinaryButton";
import InputFormik from "@/components/UI/Inputs/InputFormik";
import Image from "next/image";
import api from '@/lib/axiosInstance'

const Select = dynamic(() => import("react-select"), { ssr: false });

type OptionType = {
  value: string;
  label: string;
};

const subCategorySchema = yup.object().shape({
  nombreSubCategoria: yup
    .string()
    .required("El nombre de la Sub-Categoria es obligatorio")
    .trim("No se permiten espacios en blanco")
    .min(1, "El nombre no puede estar vacío"),

  nombre: yup
    .string()
    .required("La clave es obligatoria")
    .trim("No se permiten espacios en blanco")
    .min(1, "La clave no puede estar vacía"),

  categoria: yup
    .array()
    .min(1, "Selecciona al menos una categoría")
    .of(yup.string().required()),

  image: yup
    .string()
    .required("La imagen es obligatoria"),
});

const RegisterSubCategory = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categoryOptions, setCategoryOptions] = useState<OptionType[]>([]);
  const [selectedCategoria, setSelectedCategoria] = React.useState<OptionType[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");

        const formattedOptions = response.data.map((cat: any) => ({
          value: cat.id,
          label: cat.name,
        }));

        setCategoryOptions(formattedOptions);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
        toast.error("No se pudieron cargar las categorías");
      }
    };

    fetchCategories();
  }, []);

  return (
    <section>
      <h2 className="text-2xl font-bold mb-10 text-[#4e4090] text-center sm:text-left sm:pl-10">
        Registrar nueva Sub-Categoria
      </h2>

      <Formik
        initialValues={{
          nombreSubCategoria: "",
          nombre: "",
          image: "",
          categoria: [],
        }}
        validationSchema={subCategorySchema}
        onSubmit={async (values, { resetForm }) => {
          try {
            console.log("Subcategoría a registrar:", values);

            await api.post("/sub-categories", {
              name: values.nombreSubCategoria,
              key: values.nombre,
              image: values.image,
              categories: values.categoria,
            });

            toast.success("Subcategoría registrada correctamente");
            resetForm();
            setSelectedCategoria([]);

            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Ocurrió un error al registrar la sub-categoría";
            toast.error(errorMessage);
          }
        }}
      >
        {({ setFieldValue, values }) => (
          <Form>
            <div className="flex flex-col lg:flex-row gap-6 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-10">
              <div className="border border-gray-300 flex-1 p-6 sm:p-8 bg-white rounded-lg">
                <div className="mb-4">
                  <InputFormik
                    name="nombreSubCategoria"
                    label="Nombre de la Sub-Categoría:"
                    type="text"
                    placeholder="Nombre de la Sub-Categoría"
                  />
                </div>
                <div className="mb-4">
                  <InputFormik
                    name="nombre"
                    label="Clave de la Sub-Categoría:"
                    type="text"
                    placeholder="Clave de la Sub-Categoría"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-md font-semibold text-[#4e4090] mb-2">
                    Imagen de la Sub-Categoría
                  </label>
                  <CloudinaryButton
                    onUploadSuccess={(url: string) => setFieldValue("image", url)}
                  />
                  {values.image && (
                    <div className="w-40 h-40 relative border rounded overflow-hidden mt-4 mx-auto lg:mx-0">
                      <Image
                        src={values.image}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <ErrorMessage
                    name="image"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              </div>

              <div className="border border-gray-300 flex-1 p-6 sm:p-8 bg-white rounded-lg">
                <div className="mb-4">
                  <label className="block text-md font-semibold text-[#4e4090] mb-2">
                    Categoría
                  </label>
                  <Select
                    isMulti
                    name="categoria"
                    options={categoryOptions}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    value={selectedCategoria}
                    onChange={(newValue: any) => {
                      setSelectedCategoria(newValue);
                      const values = newValue ? newValue.map((option: OptionType) => option.value) : [];
                      setFieldValue("categoria", values);
                    }}
                  />
                  <ErrorMessage
                    name="categoria"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end mt-6 mr-10">
              <ButtonAccent type="submit" textContent="GUARDAR" />
            </div>
          </Form>
        )}
      </Formik>
    </section>
  );
};

export default RegisterSubCategory;