"use client";
import React, { useEffect, useState } from "react";
import { Field, ErrorMessage } from "formik";
import api from '@/lib/axiosInstance'

interface Props {
  name: string;
  index: number; 
}

interface Size {
  id: string;
  size_us?: string;
  size_eur?: string;
  size_cm?: string;
}

const VariantProduct2: React.FC<Props> = ({ name, index }) => {
  const [sizes, setSizes] = useState<Size[]>([]);

  useEffect(() => {
    const fetchSizes = async () => {
      try {
        const res = await api.get("/sizes");
        setSizes(res.data);
      } catch (error) {
        console.error("Error al obtener talles:", error);
      }
    };

    fetchSizes();
  }, []);

  return (
    <div className="border border-[#d3d3d3] p-4 rounded-lg mt-2">
      <h4 className="text-lg font-semibold text-[#4e4090] mb-3">Detalle de Stock y Talle</h4>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold text-[#4e4090]">Talle (Unidad)</label>
          <Field
            as="select"
            name={`${name}[${index}].talle`} 
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Seleccionar</option>
            {sizes.map((size: Size) => (
              <option key={size.id} value={size.id}>
                {size.size_us ? `US: ${size.size_us}` : ''}
                {size.size_eur ? ` EUR: ${size.size_eur}` : ''}
                {size.size_cm ? ` CM: ${size.size_cm}` : ''}
              </option>
            ))}
          </Field>
          <ErrorMessage
            name={`${name}[${index}].talle`}
            component="div"
            className="text-red-500 text-sm"
          />
        </div>

        <div>
          <label className="block font-semibold text-[#4e4090]">Stock</label>
          <Field
            name={`${name}[${index}].stock`} 
            type="number"
            className="w-full p-2 border border-gray-300 rounded"
          />
          <ErrorMessage
            name={`${name}[${index}].stock`}
            component="div"
            className="text-red-500 text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default VariantProduct2;