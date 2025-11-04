"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMapStore } from "@/store/mapStore";
import { useState } from "react";
import { SelectLocalidad } from "../selects/SelectLocalidad";
import SelectFacultadCarrera from "../selects/SelectFacultadCarrera";
import { useAuth } from "@/hooks/useAuth";
import SelectPais from "../selects/SelectPais";
import SelectTipoUniversitario from "../selects/SelectTipoUniversitario";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

const schema = z
  .object({
    pais: z.string().min(1, "País es obligatorio"),
    localidad: z.string().optional(),
    tipoUni: z.string().min(1, "Tipo universitario es obligatorio"),
    tipoUniOtro: z.string().optional(),
    facultad: z.string().min(1, "Facultad es obligatoria"),
    carrera: z.string().min(1, "Carrera es obligatoria"),
    profesion: z.string().min(1, "Profesión es obligatoria"),
  })
  .refine(
    (data) => {
      if (data.pais === "Argentina") {
        return data.localidad && data.localidad.length > 0;
      }
      return true;
    },
    {
      message: "Localidad es obligatoria para Argentina",
      path: ["localidad"],
    }
  )
  .refine(
    (data) => {
      if (data.tipoUni === "Otro") {
        return data.tipoUniOtro && data.tipoUniOtro.length > 0;
      }
      return true;
    },
    {
      message: "Especificar tipo es obligatorio",
      path: ["tipoUniOtro"],
    }
  );

export default function LocationModal() {
  const { modalOpen, setModalOpen, lon, lat, updateStudentLocationLayer } =
    useMapStore();
  const user = useAuth();

  const {
    control,
    handleSubmit: rhfHandleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      pais: "",
      localidad: "",
      tipoUni: "",
      tipoUniOtro: "",
      facultad: "",
      carrera: "",
      profesion: "",
    },
  });

  const watchedPais = watch("pais");
  const watchedTipoUni = watch("tipoUni");

  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    if (!loading) {
      reset();
      setModalOpen(false);
    }
  };

  const onSubmit = rhfHandleSubmit(async (data) => {
    if (!user) {
      toast.error("Error de autenticación", {
        description: "Por favor, inicia sesión para continuar.",
      });
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Guardando ubicación...");

    try {
      const res = await fetch("/api/ubicaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.user?.id,
          email: user.user?.email,
          nombre_completo: user.user?.user_metadata.full_name,
          localidad: data.localidad,
          facultad: data.facultad,
          carrera: data.carrera,
          profesion: data.profesion,
          lat,
          lon,
        }),
      });

      const responseData = await res.json();

      toast.dismiss(loadingToast);

      if (responseData.success) {
        await updateStudentLocationLayer(user.user!);
        toast.success("¡Ubicación guardada!", {
          description: "Tu ubicación se ha guardado correctamente en el mapa.",
          duration: 4000,
        });
        reset();
        setModalOpen(false);
      } else {
        toast.error("Error al guardar", {
          description: responseData.error || "No se pudo guardar la ubicación.",
          duration: 5000,
        });
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Error de conexión", {
        description:
          "Ocurrió un error al intentar guardar la ubicación. Por favor, verifica tu conexión e intenta nuevamente.",
        duration: 5000,
      });
      console.error("Error al guardar ubicación:", error);
    } finally {
      setLoading(false);
    }
  });

  return (
    <Dialog open={modalOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Ubicación seleccionada</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit}>
          <div className="space-y-4">
            {/* Coordenadas */}
            <div className="text-sm text-gray-700">
              <p>
                <b>Latitud:</b> {lat?.toFixed(6)}
              </p>
              <p>
                <b>Longitud:</b> {lon?.toFixed(6)}
              </p>
            </div>

            <div>
              <Controller
                name="pais"
                control={control}
                render={({ field }) => (
                  <SelectPais value={field.value} onChange={field.onChange} />
                )}
              />
              <p className="text-red-500 text-sm">{errors.pais?.message}</p>
            </div>

            {/* Localidad dinámica */}
            {watchedPais === "Argentina" && (
              <div>
                <Controller
                  name="localidad"
                  control={control}
                  render={({ field }) => (
                    <SelectLocalidad
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <p className="text-red-500 text-sm">
                  {errors.localidad?.message}
                </p>
              </div>
            )}

            <div>
              <SelectFacultadCarrera
                setFacultad={(value) => setValue("facultad", value)}
                setCarrera={(value) => setValue("carrera", value)}
              />
              <p className="text-red-500 text-sm">{errors.facultad?.message}</p>
              <p className="text-red-500 text-sm">{errors.carrera?.message}</p>
            </div>

            <div>
              <Controller
                name="tipoUni"
                control={control}
                render={({ field }) => (
                  <SelectTipoUniversitario
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <p className="text-red-500 text-sm">{errors.tipoUni?.message}</p>
            </div>

            {watchedTipoUni === "Otro" && (
              <div className="space-y-1">
                <Label htmlFor="tipo-uni">Especificar tipo:</Label>
                <Controller
                  name="tipoUniOtro"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="tipo-uni"
                      placeholder="Ej: Investigador, Docente, etc."
                      {...field}
                    />
                  )}
                />
                <p className="text-red-500 text-sm">
                  {errors.tipoUniOtro?.message}
                </p>
              </div>
            )}

            {/* Profesión actual */}
            <div className="space-y-1">
              <Label htmlFor="profesion">Actualmente me desempeño en:</Label>
              <Controller
                name="profesion"
                control={control}
                render={({ field }) => (
                  <Input
                    id="profesion"
                    placeholder="Ej: Desarrollador de software"
                    {...field}
                  />
                )}
              />
              <p className="text-red-500 text-sm">
                {errors.profesion?.message}
              </p>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
