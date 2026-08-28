"use client";
import React, { useState, useEffect, useCallback } from "react";
import api from "@/lib/axiosInstance";
import toast from "react-hot-toast";
import RegisterSize from "./RegisterSizeUI";
import SizeList from "./SizeList";

interface Size {
  id: string;
  size_us: number;
  size_eur: number;
  size_cm: number;
}

const SizeManager = () => {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSizes = useCallback(async () => {
    try {
      const res = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/sizes`);
      setSizes(res.data);
    } catch (error) {
      console.error("Error al obtener talles:", error);
      toast.error("Error al cargar los talles.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSizes();
  }, [fetchSizes]);

  const handleSizeRegistered = () => {
    fetchSizes();
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 p-4 sm:p-6 md:p-8">
      <div className="flex-1">
        <RegisterSize onSizeRegistered={handleSizeRegistered} />
      </div>

      <div className="flex-1">
        <SizeList sizes={sizes} loading={loading} />
      </div>
    </div>
  );
};

export default SizeManager;