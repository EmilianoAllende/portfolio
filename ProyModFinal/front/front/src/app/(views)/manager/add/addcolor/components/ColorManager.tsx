"use client";

import React, { useState, useEffect, useCallback } from "react";
import RegisterColor from "./RegisterColorUI";
import ColorList from "./ColorList";
import api from "@/lib/axiosInstance";
import toast from "react-hot-toast";

interface Color {
  id: string;
  color: string;
  hexCode: string;
}

const ColorManager = () => {
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchColors = useCallback(async () => {
    try {
      const res = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/colors`);
      setColors(res.data);
    } catch (error) {
      console.error("Error al obtener colores:", error);
      toast.error("Error al cargar los colores.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchColors();
  }, [fetchColors]);

  const handleColorRegistered = () => {
    fetchColors(); 
  };

  return (
    <>
      <div className="flex-1">
        <RegisterColor onColorRegistered={handleColorRegistered} />
      </div>

      <div className="flex-1">
        <ColorList colors={colors} loading={loading} />
      </div>
    </>
  );
};

export default ColorManager;