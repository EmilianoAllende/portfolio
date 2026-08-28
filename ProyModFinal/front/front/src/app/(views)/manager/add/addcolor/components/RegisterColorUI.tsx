"use client";
import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import { ButtonAccent } from "@/components/UI/Buttons/Buttons";
import toast from "react-hot-toast";
import api from "@/lib/axiosInstance";
import { ColorPicker, useColor, IColor } from "react-color-palette";
import 'react-color-palette/dist/css/rcp.css';

interface RegisterColorProps {
  onColorRegistered: () => void;
}

const colorSchema = yup.object().shape({
  hex: yup
    .string()
    .required("El color HEX es obligatorio")
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Formato de color HEX inválido")
    .trim("No se permiten espacios en blanco")
    .min(1, "El color no puede estar vacío"),
  name: yup
    .string()
    .required("El nombre del color es obligatorio")
    .trim("No se permiten espacios en blanco")
    .min(1, "El nombre no puede estar vacío"),
});

const RegisterColor = ({ onColorRegistered }: RegisterColorProps) => {
  const [color, setColor] = useColor("#102e3a");

  const [initialColorForReset, setInitialColorForReset] = useState<IColor | null>(null);

  useEffect(() => {
    if (color && !initialColorForReset) {
      setInitialColorForReset(color);
    }
  }, [color, initialColorForReset]);

  return (
    <section>
      <Formik
        initialValues={{
          hex: initialColorForReset ? initialColorForReset.hex : "#102e3a",
          name: '',
        }}
        enableReinitialize={true}
        validationSchema={colorSchema}
        onSubmit={async (values, { resetForm }) => {
          try {
            console.log("Datos a registrar en el backend:", values);
            await api.post("/colors", { color: values.name, hexCode: values.hex });
            toast.success("Color registrado correctamente");
            resetForm();
            const defaultColor: IColor = { hex: "#102e3a", rgb: { r: 16, g: 46, b: 58, a: 1 }, hsv: { h: 197, s: 72, v: 23, a: 1 } };
            if (initialColorForReset) {
              setColor(initialColorForReset);
            } else {
              setColor(defaultColor);
            }
            onColorRegistered();
          } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Ocurrió un error al registrar el color";
            toast.error(errorMessage);
          }
        }}
      >
        {({ setFieldValue }) => (
          <Form>
            <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 md:px-10">
              <h2 className="text-2xl font-bold mb-6 sm:mb-10 text-[#4e4090] text-center sm:text-left">
                Registrar nuevo Color
              </h2>
              <div className="border border-gray-300 flex-1 p-6 bg-white rounded-lg">
                <div className="mb-4">
                  <label className="block text-md font-semibold text-[#4e4090] mb-1">
                    Seleccioná un color
                  </label>
                  {/* Contenedor del Color Picker */}
                  <div
                    className="w-full flex justify-center"
                  >
                    <div
                      className="w-full max-w-sm min-w-[280px] mx-auto"
                      style={{
                        height: '480px',
                      }}
                    >
                      <ColorPicker
                        color={color}
                        onChange={(newColor) => {
                          setColor(newColor);
                          setFieldValue("hex", newColor.hex);
                        }}
                      />
                    </div>
                  </div>
                  {/* Campo de texto para el nombre del color */}
                  <div className="mt-6">
                    <label htmlFor="name" className="block text-md font-semibold text-[#4e4090] mb-1">
                      Nombre del color
                    </label>
                    <Field
                      type="text"
                      name="name"
                      id="name"
                      placeholder="Ej. 'Azul Oscuro'"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4e4090]"
                    />
                    <ErrorMessage
                      name="name"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <input
                    type="hidden"
                    name="hex"
                    value={color.hex}
                  />
                  <ErrorMessage
                    name="hex"
                    component="div"
                    className="text-red-500 text-sm mt-1 text-center"
                  />
                  {/* Vista previa del color seleccionado */}
                  {color.hex && (
                    <div className="mt-4 flex items-center gap-4 justify-center">
                      <span className="text-gray-700">Color seleccionado:</span>
                      <div
                        className="w-10 h-10 rounded-full border"
                        style={{ backgroundColor: color.hex }}
                      ></div>
                      {/* Aquí mostramos el HEX para que el usuario vea lo que se enviará */}
                      <span className="text-gray-600">{color.hex.toUpperCase()}</span>
                    </div>
                  )}
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

export default RegisterColor;