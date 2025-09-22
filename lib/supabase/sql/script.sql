create table public.ubicacionesDeEstudiantes (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) not null,
    email text not null,
    nombre_completo text not null,
    localidad text not null,
    facultad text not null,
    carrera text not null,
    profesion text not null,
    lat numeric not null,
    lon numeric not null,
    avatar_url text,
    created_at timestamptz default now(),
    created_by uuid references auth.users(id) not null,
    updated_at timestamptz,
    updated_by uuid references auth.users(id)
);

-- 1. Activar RLS en la tabla
ALTER TABLE public.ubicacionesdeestudiantes ENABLE ROW LEVEL SECURITY;

-- SELECT abierto
CREATE POLICY "Usuarios ven ubicaciones"
ON public.ubicacionesdeestudiantes
FOR SELECT
USING (true);

-- INSERT restringido
CREATE POLICY "Usuarios insertan solo sus ubicaciones"
ON public.ubicacionesdeestudiantes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE restringido
CREATE POLICY "Usuarios actualizan solo sus ubicaciones"
ON public.ubicacionesdeestudiantes
FOR UPDATE
USING (auth.uid() = user_id);

-- DELETE restringido
CREATE POLICY "Usuarios eliminan solo sus ubicaciones"
ON public.ubicacionesdeestudiantes
FOR DELETE
USING (auth.uid() = user_id);

