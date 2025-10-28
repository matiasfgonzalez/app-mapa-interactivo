import { User } from "@supabase/supabase-js";
import { create } from "zustand";
import {
  fetchUbicacionesDelEstudiante,
  createNearbyStudentsLayer,
} from "@/lib/const/layers";

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
  lon: number | null;
  lat: number | null;
  checkUbicacion: boolean;
  modalOpen: boolean;
  user: User | null;

  setMap: (map: any) => void;
  setLayers: (layers: LayerData[]) => void;
  toggleLayer: (id: string, visible: boolean) => void;
  setOpacity: (id: string, opacity: number) => void;
  setSelectedRegion: (id: string | null) => void;
  setFeatureValues: (values: Record<string, any> | null) => void;
  setCoordinate: (lon: number | null, lat: number | null) => void;
  setCheckUbicacion: (check: boolean) => void;
  setModalOpen: (open: boolean) => void;
  setUser: (user: User | null) => void;
  updateStudentLocationLayer: (user: User) => Promise<void>;
  updateNearbyStudentsLayer: (nearbyStudents: any[]) => Promise<void>;
}

export const useMapStore = create<MapState>((set, get) => ({
  map: null,
  layers: [],
  selectedRegion: null,
  featureValues: null,
  lon: null,
  lat: null,
  checkUbicacion: false,
  modalOpen: false,
  user: null,

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
  setCoordinate: (lon, lat) => set({ lon, lat }),
  setCheckUbicacion: (check) => set({ checkUbicacion: check }),
  setModalOpen: (open) => {
    if (open && get().checkUbicacion) {
      set({ modalOpen: true });
    } else if (!open) {
      set({ modalOpen: false });
    }
  },
  setUser: (user) => set({ user }),
  updateStudentLocationLayer: async (user) => {
    const { map, layers } = get();
    if (!map) return;

    const vectorLayer = await fetchUbicacionesDelEstudiante(user);
    if (vectorLayer) {
      map.addLayer(vectorLayer);

      // Remover capa existente si hay
      const existingIndex = layers.findIndex(
        (l) => l.id === "ubicacion_estudiante"
      );
      if (existingIndex !== -1) {
        const existingLayer = layers[existingIndex].layer;
        map.removeLayer(existingLayer);
        layers.splice(existingIndex, 1);
      }

      // Agregar nueva capa
      layers.push({
        id: "ubicacion_estudiante",
        title: "Mi Ubicación",
        visible: true,
        opacity: 1,
        layer: vectorLayer,
      });

      // Actualizar el estado
      set({ layers: [...layers] });
    }
  },
  updateNearbyStudentsLayer: async (nearbyStudents) => {
    const { map, layers } = get();
    if (!map || !nearbyStudents || nearbyStudents.length === 0) return;

    const vectorLayer = await createNearbyStudentsLayer(nearbyStudents);
    if (vectorLayer) {
      map.addLayer(vectorLayer);

      // Remover capa existente si hay
      const existingIndex = layers.findIndex(
        (l) => l.id === "estudiantes_cercanos"
      );
      if (existingIndex !== -1) {
        const existingLayer = layers[existingIndex].layer;
        map.removeLayer(existingLayer);
        layers.splice(existingIndex, 1);
      }

      // Agregar nueva capa
      layers.push({
        id: "estudiantes_cercanos",
        title: `Estudiantes Cercanos (${nearbyStudents.length})`,
        visible: true,
        opacity: 1,
        layer: vectorLayer,
      });

      // Actualizar el estado
      set({ layers: [...layers] });
    }
  },
}));
