import { z } from "zod";

export const ubicacionFrontendSchema = z
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

export const ubicacionBackendSchema = z.object({
  localidad: z.string().optional(),
  facultad: z.string().min(1),
  carrera: z.string().min(1),
  profesion: z.string().min(1),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  // email and nombre_completo are optional because we can take them from the auth user
  email: z.string().email().optional().nullable(),
  nombre_completo: z.string().optional().nullable(),
});

export const ubicacionPatchSchema = ubicacionBackendSchema.extend({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
});

export const nearbySchema = z.object({
  lat: z.coerce.number(),
  lon: z.coerce.number() 
});
