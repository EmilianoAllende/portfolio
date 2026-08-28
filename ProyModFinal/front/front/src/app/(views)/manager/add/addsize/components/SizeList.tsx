"use client";
import React from "react";

interface Size {
  id: string;
  size_us: number;
  size_eur: number;
  size_cm: number;
}

interface SizeListProps {
  sizes: Size[];
  loading: boolean;
}

const SizeList = ({ sizes, loading }: SizeListProps) => {
  if (loading) return <p className="text-center mt-10">Cargando talles...</p>;

  return (
    <div className="border border-gray-300 p-6 mt-6 sm:mt-17 bg-white rounded-lg">
    <h2 className="text-2xl font-bold mb-4 text-[#4e4090]">
        Talles Disponibles
      </h2>
      {sizes.length > 0 ? (
        <div className="space-y-4">
          {sizes.map((size) => (
            <div key={size.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-2 border-b last:border-b-0">
              <span className="font-semibold text-gray-700">US: {size.size_us}</span>
              <span className="text-gray-600">|</span>
              <span className="font-semibold text-gray-700">EUR: {size.size_eur}</span>
              <span className="text-gray-600">|</span>
              <span className="font-semibold text-gray-700">CM: {size.size_cm}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-lg text-center mt-10">
          Aún no hay talles disponibles.
        </p>
      )}
    </div>
  );
};

export default SizeList;