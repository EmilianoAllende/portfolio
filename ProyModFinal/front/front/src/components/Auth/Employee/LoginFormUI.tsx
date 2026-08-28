"use client";

import { ILogin } from "@/interfaces";
import { Formik, Form, FormikHelpers } from "formik";
import InputFormik from "../../UI/Inputs/InputFormik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { routes } from "@/app/routes";
import GoogleLoginButton from "../../UI/Buttons/GoogleButton";
import { ButtonSecondary } from "../../UI/Buttons/Buttons";
import toast from "react-hot-toast";
import { useAuthStore } from "../../../stores/authStore";
import PasswordInputFormik from "@/components/UI/Inputs/InputPassword";

const LoginForm = () => {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const initialValues = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string().email("Email inválido").required("Requerido"),
    password: Yup.string().required("Requerido"),
  });

  const handleSubmit = async (
    values: ILogin,
    { setSubmitting, setErrors }: FormikHelpers<ILogin>
  ) => {
    try {
      await login("employee", values);
      router.push(routes.shop.categories);
      toast.success("Has ingresado exitosamente");
    } catch (error: any) {
      const message = error.response?.data?.message || "Error desconocido";
      setErrors({ password: message });
      toast.error(message.error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-10">
      <h2 className="text-2xl font-bold text-center mb-6">Iniciar Sesión</h2>
      <GoogleLoginButton role="employee" label="Continuar con Google" />
      <div className="my-4 text-center text-sm text-gray-500">
        o ingresa con tu correo
      </div>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            {/* Email */}
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

            <div className="flex items-center justify-end mt-4">
              <ButtonSecondary
                textContent="Iniciar Sesión"
                type="submit"
                disabled={isSubmitting}
              />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default LoginForm;
