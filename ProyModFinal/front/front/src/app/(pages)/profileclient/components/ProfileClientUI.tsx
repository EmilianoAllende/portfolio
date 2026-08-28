"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { ButtonPrimary } from "@/components/UI/Buttons/Buttons";
import { routes } from "@/app/routes";
import { useRouter } from "next/navigation";

const ProfileClient = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isClient = useAuthStore((state) => state.isClient);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const fetchUser = useAuthStore.getState().fetchUser;
  const setInitialized = useAuthStore.getState().setInitialized;

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (!isInitialized) {
        await fetchUser();
        setInitialized(true);
      }
      setLoading(false);
    };
    init();
  }, [isInitialized]);

  if (loading) return <p className="p-4">Cargando perfil...</p>;
  if (!user)
    return <p className="p-4 text-red-500">No se pudo cargar el usuario.</p>;
  if (!isClient())
    return <p className="p-4 text-red-500">Acceso no autorizado.</p>;

  return (
 <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">
        Bienvenido <span className="text-secondary">{user.name}</span>
      </h2>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3 text-primary">Datos Personales</h3>
        <p><span className="font-semibold text-gray-700">Nombre:</span> {user.name}</p>
        <p><span className="font-semibold text-gray-700">Email:</span> {user.email}</p>
        <p><span className="font-semibold text-gray-700">Rol:</span> {isClient() ? "Cliente" : user.roles.join(", ")}</p>
      </div>

      <ButtonPrimary
        textContent="Ver mis suscripciones"
        onClick={() => router.push(routes.client.subscription)}
      />
    </div>
  );
};

export default ProfileClient;