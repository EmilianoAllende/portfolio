"use client"
import React, { useRef } from "react";
import { Formik, Form, ErrorMessage } from "formik";
import * as yup from "yup";
import { ButtonAccent } from "../../../../../../components/UI/Buttons/Buttons";
import toast from "react-hot-toast";
import CloudinaryButton from "@/components/UI/Buttons/CloudinaryButton";
import InputFormik from "@/components/UI/Inputs/InputFormik";
import Image from "next/image"
import api from '@/lib/axiosInstance'

const categorySchema = yup.object().shape({
  nombreCategoria: yup
    .string()
    .required("El nombre de la categoría es obligatorio")
    .trim("No se permiten espacios en blanco")
    .min(1, "El nombre de la categoría no puede estar vacío"),

  nombre: yup
    .string()
    .required("La clave es obligatoria")
    .trim("No se permiten espacios en blanco")
    .min(1, "La clave no puede estar vacía"),

  image: yup
    .string()
    .required("La imagen es obligatoria"),
});

const RegisterCategory = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <section>
      <Formik
        initialValues={{
          nombre: "",
          nombreCategoria: "",
          image: "",
        }}
        validationSchema={categorySchema}
        onSubmit={async (values, { resetForm }) => {
          try {
            console.log("Categoría a registrar:", values);

            await api.post("/categories", {
              name: values.nombreCategoria,
              key: values.nombre,
              image: values.image,
            });

            toast.success("Categoría registrada correctamente");
            resetForm();

            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Ocurrió un error al registrar la categoría";
            toast.error(errorMessage);
          }

        }}

      >
        {({ setFieldValue, values }) => (
          <Form>
            <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10">
              <h2 className="text-2xl font-bold mb-6 md:mb-10 text-[#4e4090] text-center md:text-left">
                Registrar nueva Categoria
              </h2>
              <div className="border border-gray-300 p-6 sm:p-8 bg-white rounded-lg shadow-md max-w-lg mx-auto md:max-w-none">
                <div className="mb-4">
                  <InputFormik
                    name="nombreCategoria"
                    label="Nombre de la Categoria:"
                    type="text"
                    placeholder="Nombre de la Categoría"
                  />
                </div>
                <div className="mb-4">
                  <InputFormik
                    name="nombre"
                    label="Clave de la Categoria:"
                    type="text"
                    placeholder="Clave de la Categoria"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-md font-semibold text-[#4e4090] mb-2">

                    Imagen de la Categoria
                  </label>
                  <CloudinaryButton
                    onUploadSuccess={(url: string) => setFieldValue("image", url)}
                  />
                  {values.image && (
                    <div className="w-40 h-40 relative border rounded overflow-hidden mt-4 mx-auto md:mx-0"> 
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
              <div className="flex justify-center md:justify-end mt-6"> 
                <ButtonAccent type="submit" textContent="GUARDAR" />
              </div>
            </div>

          </Form>
        )}
      </Formik>
    </section>
  );
};

export default RegisterCategory;