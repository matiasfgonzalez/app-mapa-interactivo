"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Input } from "../ui/input";
import { ScanSearch } from "lucide-react";
import { getLayerGeoservicio } from "@/lib/resources/GetCapabilities";
import { addLayerGeoJson } from "@/lib/resources/addLayerGeoJson";
import { useMapStore } from "@/store/mapStore";
import { toast } from "sonner";

interface ObtenerLayersModalProps {
  children?: React.ReactNode;
  showButton?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ObtenerLayersModal = ({
  children,
  showButton,
  open,
  onOpenChange,
}: ObtenerLayersModalProps) => {
  const [selectValue, setSelectValue] = useState("WFS");
  const [urlValue, setUrlValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [capaSelect, setCapaSelect] = useState("");

  const map = useMapStore((s) => s.map);
  const layers = useMapStore((s) => s.layers);
  const setLayers = useMapStore((s) => s.setLayers);

  const [capas, setCapas] = useState<
    {
      name: string;
      title: string;
    }[]
  >([]);

  const options = ["WFS", "WMS"];

  const searchLayers = async () => {
    setLoading(true);
    setCapas([]);
    try {
      const url = `${urlValue}?service=${selectValue}&request=GetCapabilities`;
      const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
      const text = await res.text();
      console.log(text);

      const parser = new DOMParser();
      const xml = parser.parseFromString(text, "text/xml");
      let featureTypes;
      if (selectValue == "WFS") {
        featureTypes = Array.from(xml.getElementsByTagName("FeatureType")).map(
          (ft) => {
            const name = ft.getElementsByTagName("Name")[0].textContent;
            const title = ft.getElementsByTagName("Title")[0].textContent;
            return { name, title };
          }
        );
      } else {
        featureTypes = Array.from(xml.getElementsByTagName("Layer")).map(
          (ft) => {
            const name = ft.getElementsByTagName("Name")[0].textContent;
            const title = ft.getElementsByTagName("Title")[0].textContent;
            return { name, title };
          }
        );
      }

      console.log(featureTypes);
      setCapas(featureTypes);

      toast.success(`Se obtubieron "${featureTypes.length}" capas.`);
    } catch (err) {
      console.log("Error al obtener datos" + err);
      setCapas([]);
    } finally {
      setLoading(false);
    }
  };

  const addLayer = async () => {
    if (!map) {
      toast.error("El mapa no está inicializado");
      return;
    }

    const geoJson = await getLayerGeoservicio(
      urlValue,
      capaSelect,
      selectValue
    );

    const { vectorLayer, layerData } = await addLayerGeoJson(
      geoJson,
      capaSelect
    );

    // Agregar al mapa
    map.addLayer(vectorLayer);

    // Actualizar estado
    setLayers([...layers, layerData]);

    toast.success(`Capa "${capaSelect}" agregada correctamente.`);
    console.log("Capa agregada:", capaSelect);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children ||
          (showButton && (
            <Button
              type="button"
              variant="outline"
              className="bg-emerald-300 hover:bg-emerald-200 cursor-pointer"
            >
              Obtener Capas
            </Button>
          ))}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2/4">
        <DialogHeader>
          <DialogTitle>Consultar capas de Geoservicios WFS/WMS</DialogTitle>
          <DialogDescription>Modal para obtener datos</DialogDescription>
        </DialogHeader>
        <div className="flex w-full flex-wrap gap-2">
          <Badge
            variant="secondary"
            className="bg-blue-500 text-white dark:bg-blue-600"
          >
            WFS
          </Badge>
          <Badge
            variant="secondary"
            className="bg-blue-500 text-white dark:bg-blue-600"
          >
            WMS
          </Badge>
        </div>
        <div className="grid gap-4">
          <div className="grid gap-3">
            <Label htmlFor="tipo">Seleccione un tipo</Label>
            <Select
              value={selectValue}
              onValueChange={(v) => setSelectValue(v)}
              name="tipo"
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                {options.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-4">
          <Label htmlFor="url">URL del Geoservicio</Label>
        </div>
        <div className="flex w-full max-w-sm items-center gap-2">
          <Input
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            name="url"
            type="url"
            disabled={loading}
          />
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer bg-emerald-400 hover:bg-emerald-600"
            onClick={searchLayers}
          >
            <ScanSearch className="w-6 h-6" />
          </Button>
        </div>
        <div className="grid gap-4">
          <div className="grid gap-3">
            <Label htmlFor="capa">Seleccione una capa</Label>
            <Select
              value={capaSelect}
              onValueChange={(v) => setCapaSelect(v)}
              name="capa"
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una capa" />
              </SelectTrigger>
              <SelectContent>
                {capas.map((l) => (
                  <SelectItem key={l.name} value={l.name}>
                    {l.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="destructive"
              className="cursor-pointer bg-red-500 hover:bg-red-400"
            >
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type="button"
            className="cursor-pointer bg-green-600 hover:bg-green-500"
            onClick={addLayer}
          >
            Aceptar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ObtenerLayersModal;
