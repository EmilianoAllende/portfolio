"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getUserApi } from "@/lib/authBase";
import { useAuthStore } from "@/stores/authStore";
import { routes } from "../../../routes/index";

export default function GoogleSuccess() {
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();
  const params = useSearchParams();

  const type = params.get("type");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getUserApi();
        if (user) {
          setUser(user);
          if (type === "employee") {
            router.push(routes.shop.categories);
          } else if (type === "client") {
            router.push(routes.user.profile);
          } else {
            console.warn("Tipo de usuario no reconocido:", type);
            router.push(routes.public.login);
          }
        }
      } catch (error) {
        console.error("Error en Google Auth callback", error);
        router.push(routes.public.login);
      }
    };

    fetchUser();
  }, [router, setUser, type]);

  return <p className="text-center mt-10">Autenticando con Google...</p>;
}
