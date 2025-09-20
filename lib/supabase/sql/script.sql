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
    created_at timestamptz default now(),
    created_by uuid references auth.users(id) not null,
    updated_at timestamptz,
    updated_by uuid references auth.users(id)
);