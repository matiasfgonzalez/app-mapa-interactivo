import { create } from "zustand";

export interface LayerData {
  id: string;
  title: string;
  visible: boolean;
  opacity: number;
  layer: any; // referencia real a ol/layer
}

interface MapState {
  map: any | null; // referencia a OpenLayers Map
  layers: LayerData[];
  selectedRegion: string | null;
  featureValues: Record<string, any> | null;

  setMap: (map: any) => void;
  setLayers: (layers: LayerData[]) => void;
  toggleLayer: (id: string, visible: boolean) => void;
  setOpacity: (id: string, opacity: number) => void;
  setSelectedRegion: (id: string | null) => void;
  setFeatureValues: (values: Record<string, any> | null) => void;
}

export const useMapStore = create<MapState>((set) => ({
  map: null,
  layers: [],
  selectedRegion: null,
  featureValues: null,

  setMap: (map) => set({ map }),
  setLayers: (layers) => set({ layers }),
  toggleLayer: (id, visible) =>
    set((state) => {
      const updated = state.layers.map((l) => {
        if (l.id === id) {
          l.layer.setVisible(visible);
          return { ...l, visible };
        }
        return l;
      });
      return { layers: updated };
    }),
  setOpacity: (id, opacity) =>
    set((state) => {
      const updated = state.layers.map((l) => {
        if (l.id === id) {
          l.layer.setOpacity(opacity);
          return { ...l, opacity };
        }
        return l;
      });
      return { layers: updated };
    }),
  setSelectedRegion: (id) => set({ selectedRegion: id }),
  setFeatureValues: (values) => set({ featureValues: values }),
}));
