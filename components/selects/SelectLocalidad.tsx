"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { useMapStore } from "@/store/mapStore";
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
  const { lon, lat } = useMapStore();

  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<Localidad[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Sincroniza el estado local con el valor de la prop
  React.useEffect(() => {
    setQuery(value || "");
  }, [value]);

  // Efecto para buscar la localidad por coordenadas (se ejecuta al inicio y cuando cambian lon/lat)
  React.useEffect(() => {
    const fetchLocalidadByCoords = async () => {
      // Evitar llamadas innecesarias si no hay coordenadas válidas
      if (!lat || !lon) return;

      setLoading(true);
      try {
        const res = await fetch(
          `https://apis.datos.gob.ar/georef/api/ubicacion?lat=${lat}&lon=${lon}`
        );
        const data = await res.json();

        if (
          data.ubicacion &&
          data.ubicacion.municipio &&
          data.ubicacion.municipio.nombre != null
        ) {
          const newLocalidad = `${data.ubicacion.municipio.nombre} (${data.ubicacion.provincia.nombre})`;
          setQuery(data.ubicacion.municipio.nombre);
          onChange(newLocalidad);
        } else {
          // Limpiar si no se encuentra una localidad válida
          setQuery("");
          onChange("");
        }
      } catch (error) {
        console.error("Error al buscar localidad por coordenadas:", error);
        setQuery("");
        onChange("");
      } finally {
        setLoading(false);
      }
    };

    // Solo si el query está vacío, para evitar sobrescribir la búsqueda del usuario
    if (!query) {
      fetchLocalidadByCoords();
    }
  }, [lon, lat, onChange]);

  // Efecto para buscar localidades por nombre con debounce
  React.useEffect(() => {
    // Si la búsqueda por coordenadas llenó el query, no hacer otra búsqueda de inmediato
    if (query === value) {
      return;
    }

    const fetchLocalidadesByName = async () => {
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

    const timeout = setTimeout(fetchLocalidadesByName, 500); // debounce
    return () => clearTimeout(timeout);
  }, [query, value]);

  return (
    <div className="space-y-2">
      <Label htmlFor="localidad-combobox">Localidad</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value
              ? results.find((loc) => loc.nombre === value)?.nombre || value
              : "Selecciona una localidad..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-md p-0">
          <Command>
            <CommandInput
              placeholder="Buscar localidad..."
              value={query}
              onValueChange={setQuery}
            />
            {loading && (
              <div className="p-2 text-sm text-gray-500">Buscando...</div>
            )}
            <CommandEmpty>No se encontraron resultados.</CommandEmpty>
            {!loading && (
              <CommandGroup>
                {results.map((loc) => (
                  <CommandItem
                    key={loc.id}
                    value={loc.nombre}
                    onSelect={(currentValue) => {
                      onChange(currentValue === value ? "" : currentValue);
                      setOpen(false);
                      // Puedes dejar el query con el valor seleccionado o limpiarlo
                      // setQuery("");
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === loc.nombre ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {loc.nombre}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
