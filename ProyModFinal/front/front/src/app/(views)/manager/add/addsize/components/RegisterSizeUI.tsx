"use client";
import React from "react";
import { Formik, Form } from "formik";
import * as yup from "yup";
import { ButtonAccent } from "@/components/UI/Buttons/Buttons";
import InputFormik from "@/components/UI/Inputs/InputFormik";
import toast from "react-hot-toast";
import api from '@/lib/axiosInstance'

interface RegisterSizeProps {
  onSizeRegistered: () => void; 
}

const sizeSchema = yup.object().shape({
  size_us: yup
    .number()
    .typeError("Debe ser un número")
    .required("El talle US es obligatorio"),
  size_eur: yup
    .number()
    .typeError("Debe ser un número")
    .required("El talle EUR es obligatorio"),
  size_cm: yup
    .number()
    .typeError("Debe ser un número")
    .required("El talle CM es obligatorio"),
});

const RegisterSize = ({ onSizeRegistered }: RegisterSizeProps) => {
  return (
    <>
      <h2 className="text-2xl font-bold mb-6 sm:mb-10 text-[#4e4090] text-center sm:text-left">Registrar nuevo Talle</h2>

      <Formik
        initialValues={{
          size_us: "",
          size_eur: "",
          size_cm: "",
        }}
        validationSchema={sizeSchema}
        onSubmit={async (values, { resetForm }) => {
          try {
            await api.post("/sizes", {
              size_us: Number(values.size_us),
              size_eur: Number(values.size_eur),
              size_cm: Number(values.size_cm),
            });

            toast.success("Talle registrado correctamente");
            resetForm();
            onSizeRegistered();
          } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Ocurrió un error al registrar la talla";
            toast.error(errorMessage);
          }
        }}
      >
        {() => (
          <Form>
          <div className="border border-gray-300 p-6 sm:p-8 bg-white rounded-lg space-y-4">
              <InputFormik
                name="size_us"
                label="Talle US:"
                type="number"
                placeholder="Ej: 8.5"
              />

              <InputFormik
                name="size_eur"
                label="Talle EUR:"
                type="number"
                placeholder="Ej: 42"
              />

              <InputFormik
                name="size_cm"
                label="Talle CM:"
                type="number"
                placeholder="Ej: 26.5"
              />
            </div>

          <div className="flex justify-center md:justify-end mt-6">
              <ButtonAccent type="submit" textContent="GUARDAR" />
            </div>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default RegisterSize;
