"use client";
import { useEffect, useState } from "react";
import api from "@/lib/axiosInstance";
import { IBrand } from "@/interfaces";
import CardBrand from "@/components/UI/Cards/CardBrand"; 

const BrandList = () => {
  const [brands, setBrands] = useState<IBrand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`${process.env.NEXT_PUBLIC_API_URL}/brands`)
      .then((res) => {
        setBrands(res.data);
        console.log("brands", res.data);
      })
      .catch((err) => console.error("Error al obtener marcas:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center mt-10">Cargando marcas...</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
      {brands.length > 0 ? (
        brands.map((brand) => (
          <CardBrand
            key={brand.id} 
            name={brand.name}
            image={brand.image}
            id={brand.id}             
            subcategories={brand.subcategories} 
            brandKey={brand.brandKey}      
          />
        ))
      ) : (
        <div className="col-span-1 sm:col-span-2 lg:col-span-3 w-full h-60 flex justify-center items-center">
          <p className="text-center text-gray-500 text-lg w-full">
            No hay marcas disponibles.
          </p>
        </div>
      )}
    </div>
  );
};

export default BrandList;