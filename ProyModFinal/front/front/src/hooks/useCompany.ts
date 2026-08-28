import api from "@/lib/axiosInstance";
import { useEffect, useState } from "react";

export const useCompany = () => {
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/customers")
      .then((res) => setCompany(res.data[0]))
      .catch((err) => {
        console.error("Error al obtener la empresa:", err);
        setCompany(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return { company, loading };
};
