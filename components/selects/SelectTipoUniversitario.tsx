import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

interface Props {
  value: string | undefined;
  onChange: (value: string) => void;
}

const tiposUniversitario = [
  "Egresado",
  "Estudiante",
  "Docente",
  "Personal Administrativo",
  "Autoridad",
  "Otro",
];

const SelectTipoUniversitario = ({ value, onChange }: Readonly<Props>) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <div className="space-y-2">
      <Label htmlFor="localidad-combobox">Soy</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={loading}
          >
            {/* APLICAMOS: Mostrar el mensaje de carga o el valor actual */}
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cargando tipos...
              </>
            ) : value ? (
              tiposUniversitario.find((c) => c === value) || value
            ) : (
              "Selecciona un tipo..."
            )}

            {/* Ocultar el icono de flechas si está cargando */}
            {!loading && (
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-md p-0">
          <Command>
            <CommandInput
              placeholder={loading ? "Cargando..." : "Buscar tipo..."}
              value={query}
              onValueChange={setQuery}
              disabled={loading}
            />
            {loading && (
              <div className="p-4 text-center text-sm text-gray-500 flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Obteniendo datos...
              </div>
            )}

            {!loading && (
              <>
                <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                <CommandGroup>
                  {tiposUniversitario.map((c) => (
                    <CommandItem
                      key={c}
                      value={c}
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
                          value === c ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {c}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SelectTipoUniversitario;
