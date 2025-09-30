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

  const [localidad, setLocalidad] = useState("");
  const [pais, setPais] = useState("");
  const [tipoUni, setTipoUni] = useState("");
  const [facultad, setFacultad] = useState("");
  const [carrera, setCarrera] = useState("");
  const [profesion, setProfesion] = useState("");
  const [loading, setLoading] = useState(false);

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
        localidad,
        facultad,
        carrera,
        profesion,
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

          <SelectPais value={pais} onChange={setPais} />

          {/* Localidad dinámica */}
          {pais === "Argentina" && (
            <SelectLocalidad value={localidad} onChange={setLocalidad} />
          )}

          <SelectFacultadCarrera
            setFacultad={setFacultad}
            setCarrera={setCarrera}
          />

          <SelectTipoUniversitario value={tipoUni} onChange={setTipoUni} />

          {/* Profesión actual */}
          <div className="space-y-1">
            <Label htmlFor="profesion">Actualmente me desempeño en:</Label>
            <Input
              id="profesion"
              placeholder="Ej: Desarrollador de software"
              value={profesion}
              onChange={(e) => setProfesion(e.target.value)}
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
