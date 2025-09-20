"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocalidadType } from "@/lib/types/localidadType";

interface Localidad {
  id: string;
  nombre: string;
}

interface Props {
  value: string | undefined;
  onChange: (value: string) => void;
}

export function SelectLocalidad({ value, onChange }: Readonly<Props>) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<Localidad[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Fetch localidades cuando el usuario escribe más de 3 caracteres
  React.useEffect(() => {
    const fetchLocalidades = async () => {
      if (query.length <= 3) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(
          `https://apis.datos.gob.ar/georef/api/localidades?nombre=${query}&max=10`
        );
        const data = await res.json();

        if (data.localidades) {
          setResults(
            data.localidades.map((loc: LocalidadType) => ({
              id: loc.id,
              nombre: `${loc.nombre} (${loc.provincia.nombre})`,
            }))
          );
        }
      } catch (error) {
        console.error("Error al buscar localidades:", error);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchLocalidades, 500); // debounce de 500ms
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="space-y-2">
      <Label htmlFor="localidad">Localidad</Label>
      <Input
        id="localidad"
        placeholder="Escribe al menos 4 letras..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={loading}
      />

      {results.length > 0 && (
        <Select onValueChange={onChange} value={value} disabled={loading}>
          <SelectTrigger>
            <SelectValue
              placeholder={loading ? "Buscando..." : "Selecciona una localidad"}
            />
          </SelectTrigger>
          <SelectContent>
            {results.length > 0 ? (
              results.map((loc) => (
                <SelectItem key={loc.id} value={loc.nombre}>
                  {loc.nombre}
                </SelectItem>
              ))
            ) : (
              <div className="p-2 text-sm text-gray-500">
                Escribe al menos 4 letras
              </div>
            )}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
