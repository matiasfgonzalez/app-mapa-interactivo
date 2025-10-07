"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMapStore } from "@/store/mapStore";
import { useState } from "react";
import { SelectLocalidad } from "../selects/SelectLocalidad";
import SelectFacultadCarrera from "../selects/SelectFacultadCarrera";
import { useAuth } from "@/hooks/useAuth";
import { fetchUbicacionesDelEstudiante } from "@/lib/const/layers";
import SelectPais from "../selects/SelectPais";
import SelectTipoUniversitario from "../selects/SelectTipoUniversitario";

export default function LocationModal() {
  const { modalOpen, setModalOpen, lon, lat, map, layers } = useMapStore();
  const user = useAuth();

  const [formData, setFormData] = useState({
    localidad: "",
    pais: "",
    tipoUni: "",
    tipoUniOtro: "",
    facultad: "",
    carrera: "",
    profesion: "",
  });
  const [loading, setLoading] = useState(false);

  const updateFormData = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);

    const res = await fetch("/api/ubicaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.user?.id,
        email: user.user?.email,
        nombre_completo: user.user?.user_metadata.full_name,
        localidad: formData.localidad,
        facultad: formData.facultad,
        carrera: formData.carrera,
        profesion: formData.profesion,
        lat,
        lon,
      }),
    });

    const data = await res.json();

    const vectorLayer = await fetchUbicacionesDelEstudiante(user.user!);

    // Agregar la capa al mapa
    map.addLayer(vectorLayer);

    // Validar si ya existe una layer similar, eliminarla para evitar duplicados
    const existingIndex = layers.findIndex(
      (l) => l.id === "ubicacion_estudiante"
    );
    if (existingIndex !== -1) {
      const existingLayer = layers[existingIndex].layer;
      map.removeLayer(existingLayer);
      layers.splice(existingIndex, 1); // Eliminar del estado
    }

    layers.push({
      id: "ubicacion_estudiante",
      title: "Mi Ubicación",
      visible: true,
      opacity: 1,
      layer: vectorLayer,
    });

    setLoading(false);
    if (data.success) setModalOpen(false);
    else alert(data.error);
  };

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Ubicación seleccionada</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Coordenadas */}
          <div className="text-sm text-gray-700">
            <p>
              <b>Latitud:</b> {lat?.toFixed(6)}
            </p>
            <p>
              <b>Longitud:</b> {lon?.toFixed(6)}
            </p>
          </div>

          <SelectPais
            value={formData.pais}
            onChange={(value) => updateFormData("pais", value)}
          />

          {/* Localidad dinámica */}
          {formData.pais === "Argentina" && (
            <SelectLocalidad
              value={formData.localidad}
              onChange={(value) => updateFormData("localidad", value)}
            />
          )}

          <SelectFacultadCarrera
            setFacultad={(value) => updateFormData("facultad", value)}
            setCarrera={(value) => updateFormData("carrera", value)}
          />

          <SelectTipoUniversitario
            value={formData.tipoUni}
            onChange={(value) => updateFormData("tipoUni", value)}
          />

          {formData.tipoUni === "Otro" && (
            <div className="space-y-1">
              <Label htmlFor="tipo-uni">Especificar tipo:</Label>
              <Input
                id="tipo-uni"
                placeholder="Ej: Investigador, Docente, etc."
                value={formData.tipoUniOtro}
                onChange={(e) => updateFormData("tipoUniOtro", e.target.value)}
              />
            </div>
          )}

          {/* Profesión actual */}
          <div className="space-y-1">
            <Label htmlFor="profesion">Actualmente me desempeño en:</Label>
            <Input
              id="profesion"
              placeholder="Ej: Desarrollador de software"
              value={formData.profesion}
              onChange={(e) => updateFormData("profesion", e.target.value)}
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
