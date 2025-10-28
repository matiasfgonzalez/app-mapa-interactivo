```bash
npm i

npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Abrir [http://localhost:3000](http://localhost:3000)

https://supabase.wordpress.com/2023/05/22/simplificando-las-busquedas-geoespaciales-con-geohash-en-supabase/

Agregar una columna geohash que permita realizar búsquedas geoespaciales rápidas (por proximidad o área) en Supabase (PostgreSQL).

🧭 1. Agregar la columna geohash
Crear la columna donde se almacenará el hash geoespacial:

```
ALTER TABLE tu_tabla
ADD COLUMN geohash TEXT;
```

🧮 2. Instalar la extensión necesaria
Supabase usa PostgreSQL, que permite instalar la extensión postgis (si no está habilitada ya).
Con postgis, podés crear un punto geográfico y convertirlo en geohash.

Ejecutá esto en el SQL Editor de Supabase:

```
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_raster;
```

🌍 3. Generar los geohash desde latitud y longitud
Una vez habilitada la extensión, podés usar la función ST_GeoHash de PostGIS.
Ejemplo para llenar los valores de la nueva columna:

```
UPDATE tu_tabla
SET geohash = ST_GeoHash(
  ST_SetSRID(ST_MakePoint(longitud, latitud), 4326),
  8  -- precisión (de 1 a 12, 8 es buen equilibrio)
);
```

👉 Cuanto mayor el número, más precisa la ubicación (y más largo el hash).
Por ejemplo:

- 5 → ~5 km de precisión

- 8 → ~38 metros

- 12 → ~3 cm

🔄 4. Mantener actualizado el geohash automáticamente (opcional)

Podés crear un trigger para que el geohash se actualice cada vez que cambien latitud o longitud:

```
CREATE OR REPLACE FUNCTION update_geohash()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geohash := ST_GeoHash(
    ST_SetSRID(ST_MakePoint(NEW.lon, NEW.lat), 4326),
    8
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_geohash
BEFORE INSERT OR UPDATE OF lat, lon ON ubicacionesdeestudiantes
FOR EACH ROW
EXECUTE FUNCTION update_geohash();
```

🔍 5. Búsquedas por proximidad usando geohash

Podés buscar puntos cercanos filtrando por prefijo del geohash (porque los geohash cercanos comparten el mismo prefijo):

```
SELECT *
FROM tu_tabla
WHERE geohash LIKE LEFT('ezs42e44', 5) || '%';
```

Esto devolverá todos los registros con geohash cercanos al área del hash ezs42e44 con precisión de 5 caracteres.
