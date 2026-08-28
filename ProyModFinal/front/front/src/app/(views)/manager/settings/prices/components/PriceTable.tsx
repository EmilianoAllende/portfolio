"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/axiosInstance";

// 1. Eliminamos 'stock' de la interfaz
interface SimplifiedProduct {
  id: string;
  name: string;
  code: string; // Es buena idea tener el código para referencia
  sale_price: string;
}

const PriceTable = () => {
  const [products, setProducts] = useState<SimplifiedProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const loadProducts = () => {
    setLoading(true);
    api
      .get("/products")
      .then((res) => {
        console.log(res.data);
        // 2. Simplificamos el mapeo de datos
        const simplified = res.data.map((prod: any) => ({
          id: prod.id,
          name: prod.name,
          code: prod.code,
          sale_price:  Number(prod.sale_price),
        }));
        setProducts(simplified);
      })
      .catch((err) => {
        console.error("Error al obtener productos:", err);
        toast.error("Error al cargar productos");
      })
      .finally(() => setLoading(false));
  };

  // 3. La función getTotalStock() se elimina por completo.

  // Usamos loadProducts dentro de useEffect para no repetir código
  useEffect(() => {
    loadProducts();
  }, []);

  const handleDownloadCsv = async () => {
    try {
      // Esta función llama al backend que genera el CSV de productos (sin variantes)
      // lo cual es exactamente lo que necesitas.
      const res = await api.get("/products/csv/download-prices", {
        responseType: "blob",
      });

      const fecha = new Date().toISOString().split('T')[0];
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `precios_productos_${fecha}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error al descargar CSV:", error);
      toast.error("No se pudo descargar el archivo.");
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      toast.promise(
        api.post("/products/csv/update-prices", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        }),
        {
          loading: 'Actualizando precios...',
          success: () => {
            loadProducts();
            return 'Precios actualizados correctamente.';
          },
          error: 'Error al actualizar los precios.',
        }
      );
    }
  };

  return (
    <div className="max-w-[900px] mx-auto">
      <h2 className="text-xl font-bold mb-1">
        Tabulador de <span className="text-primary">Precios</span>
      </h2>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-700">
          Lista actual de precios por producto.
        </p>

        <div className="flex gap-2">
          <label className="bg-accent hover:bg-[#0d0d0d] text-white px-4 py-2 rounded cursor-pointer">
            Cargar CSV
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleUpload}
            />
          </label>

          <button
            onClick={handleDownloadCsv}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-600 transition"
          >
            Descargar CSV
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Cargando productos...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead>
              {/* 4. Eliminamos la columna "Stock" de la tabla */}
              <tr className="bg-primary text-white text-sm">
                <th className="py-2 px-4 text-left">Producto</th>
                <th className="py-2 px-4 text-left">Código</th>
                <th className="py-2 px-4 text-right">Precio</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr key={prod.id} className="text-sm border-b">
                  <td className="py-2 px-4">{prod.name}</td>
                  <td className="py-2 px-4">{prod.code}</td>
                  <td className="py-2 px-4 text-right">
                    {typeof prod.sale_price === "number"
                      ? `$${prod.sale_price}`
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PriceTable;