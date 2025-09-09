"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";
import { LayerData } from "@/store/mapStore";

interface DnDListProps {
  layers: LayerData[];
}

export default function DnDList(props: Readonly<DnDListProps>) {
  const { layers } = props;
  const [items, setItems] = useState(layers);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.indexOf(active.id.toString());
      const newIndex = items.indexOf(over.id.toString());
      setItems(arrayMove(items, oldIndex, newIndex));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="max-w-sm mx-auto mt-10">
          {items.map((l) => (
            <SortableItem key={l.id} id={l.id} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
