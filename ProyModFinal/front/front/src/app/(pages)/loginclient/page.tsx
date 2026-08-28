import React from "react";
import LoginFormClient from "../../../components/Auth/Client/LoginFormClientUI";
import Link from "next/link";
import { routes } from "../../routes/index";

const LoginPageClient = () => {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2">
      {/* Sección izquierda : formulario */}
      <div className="flex flex-col items-center justify-center bg-base-100 px-6 py-12">
        <div className="w-full max-w-md">
          <LoginFormClient />
        </div>

        <div className="flex flex-col">
          <p className="text-center mt-2">
            ¿Sos empleado?{" "}
            <Link
              href={routes.public.login}
              className="text-primary font-semibold inline-flex space-x-1 items-center hover:text-[#0d0d0d]"
            >
              Clickea aquí
            </Link>
          </p>
          <p className="text-center mt-2">
            ¿Aún no tenes cuenta?{" "}
            <Link
              href={routes.public.registerClient}
              className="text-primary font-semibold inline-flex space-x-1 items-center hover:text-[#0d0d0d]"
            >
              Clickea aquí
            </Link>
          </p>
        </div>
      </div>

      {/* Sección derecha : imagen o color */}
      <div className="hidden lg:block bg-primary relative">
        {/* Texto */}
        <div className="relative z-10 flex items-center justify-center h-full px-10 text-base-100 text-center">
          <div>
            <h1 className="text-4xl font-bold mb-4">Bienvenido</h1>
            <p className="text-lg">
              Iniciá sesión para acceder a la app Cliente
            </p>
            {/* <Image
              src="/shoes.webp"
              alt="Nivo POS"
              width={600}
              height={600}
              className="mx-auto mt-8"
            /> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPageClient;
