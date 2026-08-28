"use client";

import { IRegister } from "@/interfaces";
import { Formik, Form } from "formik";
import InputFormik from "@/components/UI/Inputs/InputFormik";
import * as yup from "yup";
import { useRouter } from "next/navigation";
import { routes } from "@/app/routes";
import toast from "react-hot-toast";
import { ButtonSecondary } from "@/components/UI/Buttons/Buttons";
import { useAuthStore } from "@/stores/authStore";
import PasswordInputFormik from "@/components/UI/Inputs/InputPassword";

export const RegisterFormClient = () => {
  const { registerClient } = useAuthStore();
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
      )
      .required("La contraseña es requerida"),
  });

  const handleSubmit = async (values: IRegister) => {
    try {
      await registerClient(values);
      toast.success("¡Registro exitoso!");
      router.push(routes.public.loginClient);
    } catch (error: any) {
      console.error(error);
      const errorMessage =
        error?.response?.data?.message || "Error al registrarse";
      toast.error(
        typeof errorMessage === "string"
          ? errorMessage
          : "Ocurrió un error inesperado"
      );
    }
  };

  return (
    <Formik
      initialValues={{
        first_name: "",
        last_name: "",
        email: "",
        password: "",
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
            <PasswordInputFormik
              name="password"
              label="Contraseña"
              placeholder="Ingresá tu contraseña"
            />

          <div className="flex justify-end mt-4">
            <ButtonSecondary
              textContent="Registrarse"
              type="submit"
              disabled={isSubmitting}
            />
          </div>
        </Form>
      )}
    </Formik>
  );
};
