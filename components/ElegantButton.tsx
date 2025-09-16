"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ElegantButtonProps extends React.ComponentProps<typeof Button> {
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
}

export const ElegantButton = React.forwardRef<
  HTMLButtonElement,
  ElegantButtonProps
>(({ title, description, icon, badge, className, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      variant="ghost"
      className={cn(
        "cursor-pointer w-full h-16 px-4 justify-start rounded-lg hover:bg-slate-100 transition-all duration-200 group",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-4 w-full">
        {/* Icono principal */}
        <div className="relative">
          <div className="p-2.5 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg">
            {icon}
          </div>
          {/* Indicador opcional (ej: status online) */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
        </div>

        {/* Contenido textual */}
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="font-semibold text-slate-900">{title}</h4>
            {badge && (
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-medium">
                {badge}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600">{description}</p>
        </div>

        {/* Icono de acción */}
        <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
      </div>
    </Button>
  );
});

ElegantButton.displayName = "ElegantButton";
