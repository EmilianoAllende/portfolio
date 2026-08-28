import React, { useState, useMemo, useCallback } from "react";
import { Send, Filter, MapPin, Calendar, FileText, Building2 } from "lucide-react";
import { Button } from "../../common/ui/button";
import { Card, CardContent, CardHeader } from "../../common/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../common/ui/select";

const SendEmailsButton = ({ patrocinios = [] }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTerritory, setSelectedTerritory] = useState("all");
  const [selectedExpiration, setSelectedExpiration] = useState("all");

  const filterPatrocinios = useCallback((list, territory, expiration) => {
    return list.filter((p) => {
      // Filtro por territorio
      if (territory && territory !== "all") {
        const normalize = (str) =>
          (str || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/-/g, " ");

        const territorioPatrocinio = normalize(p.territorio || "");
        const territorioFiltro = normalize(territory);

        if (!territorioPatrocinio.includes(territorioFiltro)) return false;
      }

      // Filtro por vencimiento
      if (expiration && expiration !== "all" && p.fecha_fin) {
        const fechaFin = new Date(p.fecha_fin);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const limite = new Date(hoy);

        switch (expiration) {
          case "7days":
            limite.setDate(hoy.getDate() + 7);
            break;
          case "30days":
            limite.setDate(hoy.getDate() + 30);
            break;
          case "3months":
            limite.setMonth(hoy.getMonth() + 3);
            break;
          case "6months":
            limite.setMonth(hoy.getMonth() + 6);
            break;
          case "12months":
            limite.setMonth(hoy.getMonth() + 12);
            break;
          default:
            return true;
        }

        limite.setHours(23, 59, 59, 999);

        if (fechaFin < hoy || fechaFin > limite) return false;
      }

      return true;
    });
  }, []);

  const filteredRecipients = useMemo(() => {
    return filterPatrocinios(patrocinios, selectedTerritory, selectedExpiration).map((p) => ({
      id: p.licitacion_id || Math.random().toString(),
      name: p.adjudicatario || "Sin nombre",
      email: "contacto@ejemplo.com",
      tender: p.titulo || "Sin tÃ­tulo",
      expiration: p.fecha_fin,
      amount: p.monto?.toLocaleString("es-ES", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) || "0,00",
      territory: p.territorio || "Sin territorio",
    }));
  }, [filterPatrocinios, patrocinios, selectedTerritory, selectedExpiration]);

  const territories = [
    { value: "all", label: "Todos los territorios" },
    { value: "tenerife", label: "Tenerife" },
    { value: "gran-canaria", label: "Gran Canaria" },
    { value: "lanzarote", label: "Lanzarote" },
    { value: "fuerteventura", label: "Fuerteventura" },
  ];

  const expirations = [
    { value: "all", label: "Todos los vencimientos" },
    { value: "7days", label: "PrÃ³ximos 7 dÃ­as" },
    { value: "30days", label: "PrÃ³ximos 30 dÃ­as" },
    { value: "3months", label: "PrÃ³ximos 3 meses" },
    { value: "6months", label: "PrÃ³ximos 6 meses" },
    { value: "12months", label: "PrÃ³ximos 12 meses" },
  ];

  const handleConfirmarEnvio = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://n8n.icc-e.org/webhook/redactar-mail-adjudicatarios",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            territory: selectedTerritory,
            expiration: selectedExpiration,
          }),
        }
      );

      if (response.ok) {
        alert("Mails encolados correctamente para envÃ­o");
        setOpen(false);
      } else {
        alert("Error al procesar el envÃ­o");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexiÃ³n con n8n");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        <Send size={16} className="mr-2" />
        Enviar Mails
      </Button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Send size={20} />
                Enviar Correos a Adjudicatarios
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filtros */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Filter size={16} />
                  Filtros de SegmentaciÃ³n
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <MapPin size={14} />
                      Territorio
                    </label>
                    <Select value={selectedTerritory} onValueChange={setSelectedTerritory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {territories.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Calendar size={14} />
                      Vencimiento
                    </label>
                    <Select value={selectedExpiration} onValueChange={setSelectedExpiration}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {expirations.map((e) => (
                          <SelectItem key={e.value} value={e.value}>
                            {e.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Resumen */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <FileText size={16} />
                  Destinatarios ({filteredRecipients.length})
                </h3>
                <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-3">
                  {filteredRecipients.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <p>No hay destinatarios que coincidan con los filtros</p>
                    </div>
                  ) : (
                    filteredRecipients.map((r) => (
                      <div
                        key={r.id}
                        className="text-sm border rounded p-2 flex items-start justify-between"
                      >
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            <Building2 size={14} />
                            {r.name}
                          </p>
                          <p className="text-xs text-slate-600">{r.tender}</p>
                        </div>
                        <div className="text-right text-xs">
                          <p className="font-medium">{r.amount} â‚¬</p>
                          <p className="text-slate-600">{r.territory}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 justify-end border-t pt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmarEnvio}
                  disabled={loading || filteredRecipients.length === 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? "Enviando..." : `Enviar (${filteredRecipients.length})`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default SendEmailsButton;
