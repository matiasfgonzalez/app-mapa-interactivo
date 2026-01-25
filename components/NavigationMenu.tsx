"use client";

import * as React from "react";
import { Layers } from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import ModalComponent from "./ModalComponent";
import { ElegantButton } from "./ElegantButton";
import ObtenerLayersModal from "./modals/ObtenerLayersModal";

export function NavigationMenuOptions() {
  const [openModal, setOpenModal] = React.useState(false);

  return (
    <>
      <NavigationMenu viewport={false}>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Recursos</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-full gap-2 p-2">
                <li>
                  <ModalComponent>
                    <ElegantButton
                      title="Capas WFS de IDEER"
                      description="Consultar capas a través del geoservicio WFS"
                      icon={<Layers className="w-5 h-5 text-white" />}
                      badge="Activo"
                    />
                  </ModalComponent>
                </li>
                <li>
                  <ElegantButton
                    title="Obtener capas"
                    description="Consultar capas disponibles en el geoservicio"
                    icon={<Layers className="w-5 h-5 text-white" />}
                    badge="Activo"
                    onClick={() => setOpenModal(true)}
                  />
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <ObtenerLayersModal open={openModal} onOpenChange={setOpenModal} />
    </>
  );
}
