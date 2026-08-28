"use client"

import { IBrand } from "@/interfaces";
import Image from "next/image";
import React from "react";

const CardBrand: React.FC<IBrand> = ({ name, image }) => {
  return (
    <div className="w-xs p-4 text-center border border-transparent hover:border-[#6e5cc4] rounded-lg transition-colors duration-300">
      <div className="w-full aspect-square relative overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          className="max-h-64 aspect-auto object-cover"
        />
      </div>
      <div className="mt-4 text-lg font-semibold text-gray-800">{name}</div>
    </div>
  );
};

export default CardBrand;