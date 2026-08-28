"use client"; 
import React from "react";

interface Color {
  id: string;
  color: string;
  hexCode: string;
}

interface ColorListProps {
  colors: Color[];
  loading: boolean;
}

const ColorList = ({ colors, loading }: ColorListProps) => {
  if (loading) return <p className="text-center mt-10">Cargando colores...</p>;

  return (
  <div className="border border-gray-300 p-6 sm:p-8 bg-white rounded-lg mt-6 md:mt-0">
      <h2 className="text-2xl font-bold mb-4 text-[#4e4090]">
        Colores Disponibles
      </h2>
      {colors.length > 0 ? (
        <div className="space-y-4">
          {colors.map((color) => (
            <div key={color.id} className="flex items-center gap-4">
              <div
                className="w-8 h-8 rounded-full border"
                style={{ backgroundColor: color.hexCode }}
              ></div>
              <span className="text-gray-700">{color.color}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-lg text-center mt-10">
          Aún no hay colores disponibles.
        </p>
      )}
    </div>
  );
};

export default ColorList;