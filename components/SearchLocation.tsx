"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Search, MapPin, Loader2, X, Navigation } from "lucide-react";
import {
  searchLocation,
  formatLocationName,
  type GeocodingResult,
} from "@/lib/services/geocoding";
import { useMapStore } from "@/store/mapStore";
import { fromLonLat } from "ol/proj";
import { toast } from "sonner";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

interface SearchLocationProps {
  onLocationSelect?: (result: GeocodingResult) => void;
  placeholder?: string;
  className?: string;
}

export function SearchLocation({
  onLocationSelect,
  placeholder = "Buscar ciudad, dirección...",
  className = "",
}: Readonly<SearchLocationProps>) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<GeocodingResult[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const map = useMapStore((s) => s.map);
  const debouncedQuery = useDebounce(query, 400);

  // Cargar búsquedas recientes del localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ceregeo_recent_searches");
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch {
      // Ignorar errores de localStorage
    }
  }, []);

  // Guardar búsqueda reciente
  const saveRecentSearch = useCallback((result: GeocodingResult) => {
    setRecentSearches((prev) => {
      const filtered = prev.filter((r) => r.placeId !== result.placeId);
      const updated = [result, ...filtered].slice(0, 5);
      try {
        localStorage.setItem(
          "ceregeo_recent_searches",
          JSON.stringify(updated),
        );
      } catch {
        // Ignorar errores de localStorage
      }
      return updated;
    });
  }, []);

  // Buscar cuando cambia el query (debounced)
  useEffect(() => {
    const search = async () => {
      if (debouncedQuery.length < 3) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        // Priorizar búsquedas en Argentina, especialmente Entre Ríos
        const searchResults = await searchLocation(debouncedQuery, {
          limit: 6,
          countryCode: "ar",
          // Viewbox centrado en Entre Ríos pero que incluye Argentina
          viewbox: [-65, -40, -55, -25],
          bounded: false,
        });
        setResults(searchResults);
        setSelectedIndex(-1);
      } catch (error) {
        console.error("Error en búsqueda:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    search();
  }, [debouncedQuery]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Navegar a una ubicación en el mapa
  const goToLocation = useCallback(
    (result: GeocodingResult) => {
      if (!map) {
        toast.error("El mapa no está disponible");
        return;
      }

      const view = map.getView();
      const center = fromLonLat([result.lon, result.lat]);

      // Animar hacia la ubicación
      view.animate({
        center,
        zoom: result.type === "city" || result.type === "town" ? 12 : 14,
        duration: 1000,
      });

      // Guardar en recientes
      saveRecentSearch(result);

      // Limpiar y cerrar
      setQuery(formatLocationName(result));
      setIsOpen(false);
      setResults([]);

      // Callback opcional
      onLocationSelect?.(result);

      toast.success("Navegando a ubicación", {
        description: formatLocationName(result),
        duration: 2000,
      });
    },
    [map, onLocationSelect, saveRecentSearch],
  );

  // Manejar teclas
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = results.length > 0 ? results : recentSearches;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && items[selectedIndex]) {
          goToLocation(items[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const showDropdown =
    isOpen &&
    (results.length > 0 || (query.length === 0 && recentSearches.length > 0));

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input de búsqueda */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none"
          size={16}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 text-sm bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-primary placeholder:text-muted-foreground transition-colors"
          autoComplete="off"
          spellCheck={false}
        />

        {/* Loader o botón de limpiar */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : query.length > 0 ? (
            <button
              onClick={clearSearch}
              className="p-0.5 hover:bg-accent rounded transition-colors"
              type="button"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Dropdown de resultados */}
      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
          {/* Resultados de búsqueda */}
          {results.length > 0 && (
            <ul className="max-h-64 overflow-y-auto">
              {results.map((result, index) => (
                <li key={result.placeId}>
                  <button
                    onClick={() => goToLocation(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full px-3 py-2.5 text-left flex items-start gap-3 transition-colors ${
                      selectedIndex === index
                        ? "bg-accent"
                        : "hover:bg-accent/50"
                    }`}
                    type="button"
                  >
                    <MapPin className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {formatLocationName(result)}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {result.displayName}
                      </p>
                    </div>
                    <Navigation className="h-4 w-4 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Búsquedas recientes */}
          {results.length === 0 &&
            query.length === 0 &&
            recentSearches.length > 0 && (
              <>
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/50">
                  Búsquedas recientes
                </div>
                <ul className="max-h-48 overflow-y-auto">
                  {recentSearches.map((result, index) => (
                    <li key={result.placeId}>
                      <button
                        onClick={() => goToLocation(result)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full px-3 py-2 text-left flex items-center gap-3 transition-colors ${
                          selectedIndex === index
                            ? "bg-accent"
                            : "hover:bg-accent/50"
                        }`}
                        type="button"
                      >
                        <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm text-foreground truncate">
                          {formatLocationName(result)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}

          {/* Sin resultados */}
          {results.length === 0 && query.length >= 3 && !isLoading && (
            <div className="px-3 py-4 text-center">
              <p className="text-sm text-muted-foreground">
                No se encontraron resultados para "{query}"
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Intenta con otro término de búsqueda
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
