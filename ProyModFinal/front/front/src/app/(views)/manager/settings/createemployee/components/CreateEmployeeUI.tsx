"use client";

import { IRegisterEmployee } from "@/interfaces";
import { Formik, Form, ErrorMessage } from "formik";
import * as yup from "yup";
import InputFormik from "@/components/UI/Inputs/InputFormik";
import { ButtonSecondary } from "@/components/UI/Buttons/Buttons";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/authStore";
import dynamic from "next/dynamic";
import React, { useState, useEffect } from "react";
import { getRolesApi } from "@/lib/authBase";
import type { Props as SelectProps } from "react-select";
import PasswordInputFormik from "@/components/UI/Inputs/InputPassword";

const Select = dynamic(() => import("react-select"), { ssr: false });

type OptionType = {
  value: string;
  label: string;
};

const TypedSelect = Select as unknown as React.ComponentType<
  SelectProps<OptionType, true>
>;

export const CreateEmployeeUI = () => {
  const [roleOptions, setRoleOptions] = useState<OptionType[]>([]);
  const { registerEmployee } = useAuthStore();

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const rolesFromApi = await getRolesApi();
        const options = rolesFromApi.map((role) => ({
          value: role.id,
          label: role.name,
        }));
        setRoleOptions(options);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Error desconocido"
        );
      }
    };

    loadRoles();
  }, []);

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
    roles: yup
      .array()
      .min(1, "Selecciona al menos un rol")
      .of(yup.string().required())
      .required("Debes asignar al menos un rol"),
  });

  const handleSubmit = async (
    values: IRegisterEmployee,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      await registerEmployee(values);
      toast.success("El usuario se ha creado exitosamente");
      resetForm();
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error(
          error.response.data?.message ?? "Ese correo ya está registrado"
        );
      } else {
        toast.error("Ocurrió un error inesperado");
      }
    }
  };

  return (
    <Formik<IRegisterEmployee>
      initialValues={{
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        roles: [],
      }}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {({ setFieldValue, isSubmitting, values }) => (
        <Form>
          <div className="mb-4">
            <label className="block text-md font-bold text-[#4e4090]">
              Rol
            </label>
            <TypedSelect
              isMulti
              name="roles"
              options={roleOptions}
              placeholder="Selecciona uno o más roles"
              className="basic-multi-select"
              classNamePrefix="select"
              isLoading={roleOptions.length === 0}
              value={roleOptions.filter((option) =>
                values.roles.includes(option.value)
              )}
              onChange={(selectedOptions) => {
                const roleValues = (selectedOptions as OptionType[]).map(
                  (opt) => opt.value
                );
                setFieldValue("roles", roleValues);
              }}
            />
            <ErrorMessage
              name="roles"
              component="div"
              className="text-red-500 text-sm mt-1"
            />
          </div>

          {/* FIRST NAME */}
          <InputFormik
            name="first_name"
            label="Nombre"
            type="text"
            placeholder="nombre"
          />

          {/* LAST NAME */}
          <InputFormik
            name="last_name"
            label="Apellido"
            type="text"
            placeholder="apellido"
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

          <div className="flex items-center justify-end mt-4">
            <ButtonSecondary
              textContent="Nuevo Empleado"
              type="submit"
              disabled={isSubmitting}
            />
          </div>
        </Form>
      )}
    </Formik>
  );
};
