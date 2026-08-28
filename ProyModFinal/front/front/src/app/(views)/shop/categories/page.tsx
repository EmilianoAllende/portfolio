"use client";


import React, { useEffect, useState } from "react";
import CardCategory from "@/components/UI/Cards/CardCategory";
import api from "@/lib/axiosInstance";
import Link from "next/link";
import { ICard } from "@/interfaces"; // 👈 Asegurate de que tenga slug


export default function CategoriesPage() {
  // Estado para guardar categorías
  const [categories, setCategories] = useState<ICard[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    api
      .get(`/categories`)
      .then((res) => {
        setCategories(res.data);
        console.log("categories", res.data);
      })
      .catch((err) => console.error("Error al obtener categorías:", err))
      .finally(() => setLoading(false));
  }, []);


  if (loading) {
    return <p className="text-center mt-10">Cargando categorías...</p>;
  }


  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mx-auto px-4">
        {categories.length > 0 ? (
          categories.map((category, index) => (
            <Link
              href={`/shop/categories/${category.slug}`}
              key={index}
            >
              <CardCategory
                name={category.name}
                image={category.image}
                slug={category.slug}
              />
            </Link>
          ))
        ) : (
          <div className="w-full h-60 flex justify-center items-center">
            <p className="text-center text-gray-500 text-lg w-full">
              No hay categorías disponibles.
            </p>
          </div>
        )}
      </div>
    </>
  );
}