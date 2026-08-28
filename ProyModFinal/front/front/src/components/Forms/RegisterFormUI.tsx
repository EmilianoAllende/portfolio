"use client";

import { IRegisterEmployee } from "@/interfaces";
import { Formik, Form } from "formik";
import InputFormik from "@/components/UI/Inputs/InputFormik";
import * as yup from "yup";
import { useRouter } from "next/navigation";
import { routes } from "@/app/routes";
import toast from "react-hot-toast";
import { useAuthStore } from "../../stores/authStore";

export const RegisterForm = () => {
  const { registerEmployee } = useAuthStore();
  const router = useRouter();

  const validationSchema = yup.object({
    first_name: yup
      .string()
      .max(50, "El nombre debe tener 50 caracteres o menos")
      .required("El nombre es requerido"),
    last_name: yup
      .string()
      .max(50, "El apellido debe tener 50 caracteres o menos")
      .required("El apellido es requerido"),
    email: yup
      .string()
      .email("Correo electrónico no válido")
      .required("El correo electrónico es requerido"),
    password: yup
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .matches(/[a-zA-Z]/, "La contraseña debe contener al menos una letra")
      .matches(
        /[^a-zA-Z0-9]/,
        "La contraseña debe contener al menos un carácter especial"
      ),
  });

  const handleSubmit = async (values: IRegisterEmployee) => {
    try {
      await registerEmployee(values);
      toast.success("¡Registro exitoso!");
      router.push(routes.public.login);
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error ? error.message : "Error al registrarse";
      toast.error(errorMessage);
    }
  };

  return (
    <Formik
      initialValues={{
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        roles: []
      }}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {({ isSubmitting }) => (
        <Form>
          {/* FIRST NAME */}
          <InputFormik
            name="first_name"
            label="Nombre"
            type="text"
            placeholder="Nombre"
          />

          {/* LAST NAME */}
          <InputFormik
            name="last_name"
            label="Apellido"
            type="text"
            placeholder="Apellido"
          />

          {/* EMAIL */}
          <InputFormik
            name="email"
            label="Correo"
            type="email"
            placeholder="correo@correo.com"
          />

          {/* PASSWORD */}
          <InputFormik
            name="password"
            label="Contraseña"
            type="password"
            placeholder="contraseña"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 mt-8 font-medium text-white bg-black rounded-lg border-black inline-flex space-x-2 items-center justify-center cursor-pointer hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Crear cliente</span>
          </button>
        </Form>
      )}
    </Formik>
  );
};
