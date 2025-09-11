"use client";

import { LayerData, useMapStore } from "@/store/mapStore";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableItemProps {
  id: string;
  layer: LayerData;
}

export default function SortableItem({
  id,
  layer,
}: Readonly<SortableItemProps>) {
  const toggleLayer = useMapStore((s) => s.toggleLayer);
  const setOpacity = useMapStore((s) => s.setOpacity);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isDragging = transform !== null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-1 rounded-lg shadow-md cursor-grab ${
        isDragging ? "bg-blue-100" : ""
      }`}
    >
      <div className="p-3 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={layer.visible}
              onChange={(e) => toggleLayer(layer.id, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <span className="text-sm font-medium">{layer.title}</span>
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">Opacidad:</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={layer.opacity}
            onChange={(e) => setOpacity(layer.id, parseFloat(e.target.value))}
            className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-gray-500 w-10">
            {Math.round(layer.opacity * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
