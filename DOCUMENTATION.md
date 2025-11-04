# 🗺️ CEREGEO - Sistema de Mapeo Geoespacial Colaborativo

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green)](https://supabase.com/)
[![OpenLayers](https://img.shields.io/badge/OpenLayers-10.6-red)](https://openlayers.org/)

## 📋 Descripción

Sistema web de mapeo interactivo que permite a estudiantes universitarios registrar su ubicación geográfica, conectar con otros estudiantes cercanos y visualizar datos geoespaciales educativos de Argentina.

### ✨ Características Principales

- 🗺️ **Mapas Interactivos** con OpenLayers
- 🔍 **Búsqueda por Proximidad** usando geohash
- 🎓 **Datos Académicos** (UADER y otras universidades)
- 🔐 **Autenticación Segura** con Google OAuth
- 📍 **Geolocalización** de estudiantes
- 📊 **Visualización de Capas** WFS/WMS
- 📱 **Diseño Responsive**
- 🌐 **Sistema Multi-país**

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 20+ 
- npm/yarn/pnpm
- Cuenta de Supabase
- Cuenta de Google Cloud (para OAuth)

### Instalación

1. **Clonar el repositorio**
\`\`\`bash
git clone https://github.com/tu-usuario/app-mapa-interactivo.git
cd app-mapa-interactivo
\`\`\`

2. **Instalar dependencias**
\`\`\`bash
npm install
\`\`\`

3. **Configurar variables de entorno**
\`\`\`bash
cp .env.example .env.local
\`\`\`

Editar `.env.local` con tus credenciales:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
NEXT_PUBLIC_SITE_URL=http://localhost:3000
\`\`\`

4. **Configurar Base de Datos**

Ejecutar el script SQL en Supabase:
\`\`\`bash
# Ver: lib/supabase/sql/script.sql
\`\`\`

5. **Ejecutar en desarrollo**
\`\`\`bash
npm run dev
\`\`\`

Abrir [http://localhost:3000](http://localhost:3000)

## 🏗️ Estructura del Proyecto

\`\`\`
app-mapa-interactivo/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── nearby/        # Búsqueda geoespacial
│   │   ├── ubicaciones/   # CRUD ubicaciones
│   │   └── uader/         # Datos académicos
│   ├── auth/              # Autenticación
│   ├── dashboard/         # Panel de usuario
│   └── login/             # Página de login
├── components/            # Componentes React
│   ├── modals/           # Modales
│   ├── selects/          # Selectores
│   └── ui/               # Componentes UI base
├── hooks/                # Custom hooks
├── lib/                  # Utilidades
│   ├── const/           # Configuraciones
│   ├── resources/       # Recursos geoespaciales
│   ├── supabase/        # Cliente Supabase
│   ├── types/           # TypeScript types
│   └── utils/           # Funciones utilitarias
├── public/              # Archivos estáticos
│   └── catalogo/       # Archivos GeoJSON/KML
└── store/              # Estado global (Zustand)
\`\`\`

## 🗄️ Modelo de Datos

### Tabla: `ubicacionesdeestudiantes`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid | ID único |
| user_id | uuid | Referencia a auth.users |
| email | text | Email del estudiante |
| nombre_completo | text | Nombre completo |
| localidad | text | Ciudad/Localidad |
| facultad | text | Facultad |
| carrera | text | Carrera |
| profesion | text | Profesión actual |
| lat | numeric | Latitud |
| lon | numeric | Longitud |
| geohash | text | Hash geoespacial |
| avatar_url | text | URL del avatar |

## 🔧 Tecnologías

- **Frontend Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Lenguaje**: TypeScript 5
- **Estilos**: Tailwind CSS 4
- **Componentes**: Radix UI
- **Mapas**: OpenLayers 10
- **Backend**: Supabase (PostgreSQL + PostGIS)
- **Autenticación**: Supabase Auth (Google OAuth)
- **Estado Global**: Zustand
- **Formularios**: React Hook Form + Zod
- **Geohashing**: ngeohash + PostGIS
- **Drag & Drop**: dnd-kit

## 📚 Características Técnicas

### Búsqueda Geoespacial

El sistema utiliza **geohash** para búsquedas de proximidad eficientes:

\`\`\`sql
-- Búsqueda por prefijo de geohash
SELECT * FROM ubicacionesdeestudiantes
WHERE geohash LIKE 'ezs42%';
\`\`\`

### Seguridad (RLS)

Políticas de Row Level Security en Supabase:
- ✅ SELECT: Público (todos pueden ver)
- ✅ INSERT: Solo usuarios autenticados (sus propios datos)
- ✅ UPDATE: Solo el propietario
- ✅ DELETE: Solo el propietario

## 🌟 Funcionalidades Innovadoras

1. **Búsqueda Inteligente por Proximidad**: Algoritmo de geohash optimizado
2. **Visualización Multi-capa**: Gestión dinámica de capas cartográficas
3. **Integración WFS/WMS**: Importación de servicios geoespaciales externos
4. **Modo Declaración de Ubicación**: Sistema interactivo de click en mapa
5. **Panel de Estudiantes Cercanos**: Vista en tiempo real de estudiantes próximos

## 🚀 Deployment

### Vercel (Recomendado)

\`\`\`bash
npm run build
vercel deploy
\`\`\`

### Variables de Entorno en Producción

Configurar en Vercel/plataforma:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`

## 📝 Scripts

\`\`\`bash
npm run dev      # Desarrollo
npm run build    # Build producción
npm run start    # Servidor producción
npm run lint     # Linter
\`\`\`

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto es de código abierto bajo licencia MIT.

## 👥 Autores

- **CEREGEO** - Centro de Recursos Geoespaciales

## 🙏 Agradecimientos

- UADER - Universidad Autónoma de Entre Ríos
- OpenLayers Community
- Supabase Team
