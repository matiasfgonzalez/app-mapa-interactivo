"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Props {
  setFacultad: (facultad: string) => void;
  setCarrera: (carrera: string) => void;
}

export default function SelectFacultadCarrera({
  setFacultad,
  setCarrera,
}: Readonly<Props>) {
  const [facultades, setFacultades] = useState<
    { id: string; nombre: string }[]
  >([]);
  const [carreras, setCarreras] = useState<{ nombre: string }[]>([]);
  const [selectedFacultad, setSelectedFacultad] = useState<string>("");

  // Obtener facultades al montar
  useEffect(() => {
    fetch("/api/uader/facultades")
      .then((res) => res.json())
      .then((data) => setFacultades(data.facultades));
  }, []);

  // Obtener carreras cuando cambia facultad
  useEffect(() => {
    if (!selectedFacultad) return;
    setFacultad(selectedFacultad);
    fetch(`/api/uader/facultades/${selectedFacultad}/carreras`)
      .then((res) => res.json())
      .then((data) => setCarreras(data.carreras));
  }, [selectedFacultad]);

  return (
    <div className="space-y-4">
      <div>
        <Label>Facultad</Label>
        <Select onValueChange={setSelectedFacultad}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona una facultad" />
          </SelectTrigger>
          <SelectContent>
            {facultades.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedFacultad && (
        <div>
          <Label>Carrera</Label>
          <Select onValueChange={setCarrera}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona una carrera" />
            </SelectTrigger>
            <SelectContent>
              {carreras.map((c, idx) => (
                <SelectItem key={idx} value={c.nombre}>
                  {c.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
