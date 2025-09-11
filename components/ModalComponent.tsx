"use client";

import { useEffect, useState } from "react";
import {
  getWFSCapabilities,
  getWFSLayer,
} from "@/lib/resources/getWFSCapabilities";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Vector as VectorLayer } from "ol/layer";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { LayerData, useMapStore } from "@/store/mapStore";
import { toast } from "sonner";

const ModalComponent = () => {
  const map = useMapStore((s) => s.map);
  const layers = useMapStore((s) => s.layers);
  const setLayers = useMapStore((s) => s.setLayers);
  const [options, setOptions] = useState<
    {
      name: string;
      title: string;
    }[]
  >([]);

  const [selectValue, setSelectValue] = useState("");

  useEffect(() => {
    const fetchWFS = async () => {
      const resp = await getWFSCapabilities();
      setOptions(resp);
    };

    fetchWFS();
  }, []);

  const addLayerSelect = async () => {
    if (!selectValue || !map) return;

    // ✅ Validar si la capa ya está cargada
    const exists = layers.some((l) => l.id === selectValue);
    if (exists) {
      console.log(exists);
      toast.warning(`La capa ${selectValue} ya está cargada en el mapa.`);
      return;
    }

    try {
      // Obtener GeoJSON de la capa
      const geojsonData = await getWFSLayer(selectValue);

      // Crear capa vectorial
      const vectorLayer = new VectorLayer({
        source: new VectorSource({
          features: new GeoJSON().readFeatures(geojsonData, {
            featureProjection: "EPSG:3857", // reproyección a web mercator
          }),
        }),
        visible: true,
        opacity: 1,
      });

      // Datos de la capa en el store
      const selected = options.find((o) => o.name === selectValue);
      const layerData: LayerData = {
        id: selectValue,
        title: selected?.title || selectValue,
        visible: true,
        opacity: 1,
        layer: vectorLayer,
      };

      // Agregar al mapa
      map.addLayer(vectorLayer);

      // Actualizar estado
      setLayers([...layers, layerData]);

      toast.success(`Capa "${layerData.title}" agregada correctamente.`);
      console.log("Capa agregada:", layerData);
    } catch (error) {
      toast.error("Error al cargar la capa seleccionada.");
      console.error(error);
    }
  };

  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="bg-emerald-300 hover:bg-emerald-200 cursor-pointer"
          >
            Modal WFS IDEER
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2/4">
          <DialogHeader>
            <DialogTitle>Entre Ríos</DialogTitle>
            <DialogDescription>
              Infraestructura de Datos Espaciales de Entre Ríos (IDEER)
            </DialogDescription>
          </DialogHeader>
          <div className="flex w-full flex-wrap gap-2">
            <Badge
              variant="secondary"
              className="bg-blue-500 text-white dark:bg-blue-600"
            >
              WFS:{" "}
            </Badge>
            <Badge variant="outline">
              https://geoservicios.entrerios.gov.ar/geoserver/ows
            </Badge>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">Seleccione una capa</Label>
              <Select
                value={selectValue}
                onValueChange={(v) => setSelectValue(v)}
                name="capa"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una capa" />
                </SelectTrigger>
                <SelectContent>
                  {options.map((m) => (
                    <SelectItem key={m.name} value={m.name}>
                      {m.name} - {m.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="destructive"
                className="cursor-pointer bg-red-500 hover:bg-red-400"
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="cursor-pointer bg-green-600 hover:bg-green-500"
              onClick={addLayerSelect}
            >
              Aceptar
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default ModalComponent;
