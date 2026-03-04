import { User } from "@supabase/supabase-js";
import { create } from "zustand";
import type { NearbyStudentType } from "@/lib/types/nearbyStudentType";
import type { FeatureValues } from "@/lib/types/featureValues";
import type { EstudianteType } from "@/lib/types/estudianteType";

export interface LayerConfig {
  id: string;
  title: string;
  visible: boolean;
  opacity: number;
}

export const INITIAL_LAYERS: LayerConfig[] = [
  {
    id: "base",
    title: "Mapa Base",
    visible: true,
    opacity: 1,
  },
  {
    id: "uni_uader",
    title: "Ubicación Unidades Académicas UADER",
    visible: true,
    opacity: 1,
  },
];

interface MapState {
  layers: LayerConfig[];
  selectedRegion: string | null;
  featureValues: FeatureValues | null;
  lon: number | null;
  lat: number | null;
  checkUbicacion: boolean;
  modalOpen: boolean;
  user: User | null;
  
  // Data plane para que Mapa.tsx reaccione
  studentData: EstudianteType[] | null;
  nearbyStudentsData: NearbyStudentType[] | null;

  setLayers: (layers: LayerConfig[]) => void;
  toggleLayer: (id: string, visible: boolean) => void;
  setOpacity: (id: string, opacity: number) => void;
  setSelectedRegion: (id: string | null) => void;
  setFeatureValues: (values: FeatureValues | null) => void;
  setCoordinate: (lon: number | null, lat: number | null) => void;
  setCheckUbicacion: (check: boolean) => void;
  setModalOpen: (open: boolean) => void;
  setUser: (user: User | null) => void;
  
  // Acciones que solo actualizan estado de datos (Mapa.tsx observará este estado)
  updateStudentLocationLayer: (user: User) => Promise<void>;
  updateNearbyStudentsLayer: (nearbyStudents: NearbyStudentType[]) => Promise<void>;
  clearNearbyStudentsLayer: () => void;
}

export const useMapStore = create<MapState>((set, get) => ({
  layers: INITIAL_LAYERS,
  selectedRegion: null,
  featureValues: null,
  lon: null,
  lat: null,
  checkUbicacion: false,
  modalOpen: false,
  user: null,
  studentData: null,
  nearbyStudentsData: null,

  setLayers: (layers) => set({ layers }),
  toggleLayer: (id, visible) =>
    set((state) => {
      const updated = state.layers.map((l) =>
        l.id === id ? { ...l, visible } : l
      );
      return { layers: updated };
    }),
  setOpacity: (id, opacity) =>
    set((state) => {
      const updated = state.layers.map((l) =>
        l.id === id ? { ...l, opacity } : l
      );
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
    try {
      const response = await fetch(`/api/ubicaciones?user_id=${user.id}`);
      const result = await response.json();
      if (result.success) {
        set({ studentData: result.data as EstudianteType[] });
        
        // Asegurar que la capa existe en la configuración para UI
        const state = get();
        if (!state.layers.find(l => l.id === "ubicacion_estudiante")) {
          set({
            layers: [
              ...state.layers,
              {
                id: "ubicacion_estudiante",
                title: "Mi Ubicación",
                visible: true,
                opacity: 1,
              }
            ]
          });
        }
      }
    } catch (error) {
      console.error("Error fetching student locations:", error);
    }
  },
  
  updateNearbyStudentsLayer: async (nearbyStudents) => {
    if (!nearbyStudents || nearbyStudents.length === 0) return;
    set({ nearbyStudentsData: nearbyStudents });
    
    // Asegurar que la capa existe en la configuración para UI
    const state = get();
    const existingIndex = state.layers.findIndex(l => l.id === "estudiantes_cercanos");
    
    if (existingIndex !== -1) {
      const updatedLayers = [...state.layers];
      updatedLayers[existingIndex].title = `Estudiantes Cercanos (${nearbyStudents.length})`;
      set({ layers: updatedLayers });
    } else {
      set({
        layers: [
          ...state.layers,
          {
            id: "estudiantes_cercanos",
            title: `Estudiantes Cercanos (${nearbyStudents.length})`,
            visible: true,
            opacity: 1,
          }
        ]
      });
    }
  },
  
  clearNearbyStudentsLayer: () => {
    set({ nearbyStudentsData: null });
    const layers = get().layers.filter(l => l.id !== "estudiantes_cercanos");
    set({ layers });
  }
}));
