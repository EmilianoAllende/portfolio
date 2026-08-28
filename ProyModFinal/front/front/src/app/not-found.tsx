import React from "react";
import Image from "next/image";
import Link from "next/link";

const Error = () => {
  return (
    <div>
      <div className="flex flex-col relative justify-center items-center bg-white h-screen w-full">
        <Image
          src="/notfound.png"
          alt="mainImageSaas"
          width="800"
          height="800"
          priority
        />
        <Link href="/" className="text-primary text-h1">
          {" "}
          volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default Error;
