"use client"

import {ICard} from "@/interfaces";
import Image from "next/image";
import React from "react";

export const CardCategory: React.FC<ICard> = ({ name, image }) => {
  return (
    // Quitamos 'w-xs'. Añadimos h-full y flex para que todas las tarjetas en una fila tengan la misma altura.
    <div className="h-full flex flex-col p-4 text-center border border-transparent hover:border-[#6e5cc4] rounded-lg transition-colors duration-300">
      <div className="w-full aspect-square relative overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover rounded-md"
        />
      </div>
      
      {/* Añadimos 'flex-grow' para empujar el nombre hacia abajo si las tarjetas tienen alturas diferentes */}
      <div className="mt-4 text-xl uppercase font-semibold text-gray-800 flex-grow flex items-center justify-center">
        <span>{name}</span>
      </div>
    </div>
  );
};

export default CardCategory;