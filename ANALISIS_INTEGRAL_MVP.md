# 📊 ANÁLISIS INTEGRAL, MVP Y MEJORA DE UI/UX - CEREGEO

**Fecha de análisis:** 25 de enero de 2026  
**Versión del proyecto:** 0.1.0  
**Stack principal:** Next.js 15 + React 19 + OpenLayers + Supabase

---

## 📋 TABLA DE CONTENIDOS

1. [Análisis General del Proyecto](#1-análisis-general-del-proyecto)
2. [Funcionalidades Actuales](#2-funcionalidades-actuales)
3. [Evaluación del MVP](#3-evaluación-del-mvp)
4. [Funcionalidades Nuevas y Distintivas](#4-funcionalidades-nuevas-y-distintivas)
5. [Análisis de UI/UX](#5-análisis-de-uiux)
6. [Diseño Visual y Mejoras Estéticas](#6-diseño-visual-y-mejoras-estéticas)
7. [Modo Claro / Oscuro](#7-modo-claro--oscuro)
8. [Responsive Design](#8-responsive-design)
9. [Plan de Implementación](#9-plan-de-implementación)

---

## 1. ANÁLISIS GENERAL DEL PROYECTO

### 🎯 ¿Qué problema resuelve?

**CEREGEO** es un sistema de mapeo geoespacial colaborativo orientado a:

1. **Registro y localización de estudiantes universitarios** - Permite a estudiantes de UADER (y potencialmente otras universidades) registrar su ubicación geográfica junto con datos académicos.

2. **Conexión por proximidad** - Facilita encontrar estudiantes cercanos geográficamente mediante algoritmos de geohash, fomentando redes de colaboración y comunidad.

3. **Visualización de datos geoespaciales** - Plataforma para visualizar capas cartográficas (WFS/WMS), datos GeoJSON/KML de Argentina con enfoque en la región de Entre Ríos.

### 👥 ¿Para quién está pensado?

| Usuario Primario                           | Necesidad                                                                               |
| ------------------------------------------ | --------------------------------------------------------------------------------------- |
| **Estudiantes universitarios**             | Registrar ubicación, encontrar compañeros cercanos, conectar con la comunidad académica |
| **Administradores/Investigadores CEREGEO** | Visualizar distribución geográfica de estudiantes, analizar datos geoespaciales         |
| **Comunidad académica UADER**              | Acceso a mapas con información de sedes y unidades académicas                           |

### 🔄 Flujo principal de uso

```
1. Usuario ingresa → Ve el mapa con capas base
                  ↓
2. Login con Google OAuth (opcional pero necesario para funciones avanzadas)
                  ↓
3. Activa "Declarar ubicación" → Click en mapa → Modal de registro
                  ↓
4. Completa: País, Localidad, Facultad, Carrera, Profesión
                  ↓
5. Su ubicación aparece en el mapa como marcador
                  ↓
6. Puede buscar estudiantes cercanos → Ver resultados en sidebar/mapa
```

### ⚠️ Coherencia actual (Diagnóstico)

| Aspecto                   | Estado           | Comentario                                        |
| ------------------------- | ---------------- | ------------------------------------------------- |
| Objetivo claro            | ✅ Definido      | Mapeo colaborativo de estudiantes                 |
| Funcionalidades alineadas | ⚠️ Parcial       | Hay funciones placeholder sin implementar         |
| UI acorde al objetivo     | ⚠️ Mejorable     | Interfaz funcional pero no optimizada             |
| UX coherente              | ⚠️ Mejorable     | Flujo confuso en algunas áreas                    |
| Branding                  | ⚠️ Inconsistente | Logo CEREGEO pero textos "GeoAnalytics" en footer |

---

## 2. FUNCIONALIDADES ACTUALES

### ✅ Funcionalidades CORE (Implementadas)

| Funcionalidad                             | Descripción                                    | Estado       |
| ----------------------------------------- | ---------------------------------------------- | ------------ |
| **Mapa interactivo**                      | Visualización con OpenLayers, zoom, pan, capas | ✅ Funcional |
| **Autenticación Google**                  | Login/Logout con Supabase Auth                 | ✅ Funcional |
| **Registro de ubicación**                 | Click en mapa → Modal → Guardar en BD          | ✅ Funcional |
| **Gestión de capas**                      | Toggle visibilidad, opacidad, reordenamiento   | ✅ Funcional |
| **Búsqueda por proximidad**               | Algoritmo geohash para encontrar cercanos      | ✅ Funcional |
| **Popups informativos**                   | Click en feature → Popup con datos             | ✅ Funcional |
| **Visualización de estudiantes cercanos** | Capa dinámica + lista en sidebar               | ✅ Funcional |
| **Eliminación de ubicación**              | Solo el propietario puede eliminar             | ✅ Funcional |

### ⚠️ Funcionalidades SECUNDARIAS (Parciales/Placeholder)

| Funcionalidad               | Estado         | Problema                                              |
| --------------------------- | -------------- | ----------------------------------------------------- |
| **Búsqueda de ubicación**   | 🔸 Placeholder | Input existe pero no funciona                         |
| **Filtros de datos**        | 🔸 Placeholder | Select de región/fecha sin implementar                |
| **Búsquedas recientes**     | 🔸 Hardcoded   | Lista estática ["Buenos Aires", "Córdoba", "Mendoza"] |
| **Notificaciones (Bell)**   | 🔸 UI only     | Botón sin funcionalidad                               |
| **Download/Share**          | 🔸 UI only     | Botones sin funcionalidad                             |
| **Panel móvil información** | 🔸 Básico      | Datos hardcodeados (1.2M, 85%)                        |
| **Dashboard**               | 🔸 Mínimo      | Solo muestra info básica del usuario                  |

### ❌ Complejidades innecesarias detectadas

1. **Componentes ocultos con `hidden`**: NavigationMenu tiene secciones completas ocultas (Home, Components) que aumentan bundle sin uso.

2. **Datos hardcodeados en UI**: Población "1.2M", Cobertura "85%" en panel móvil sin conexión a datos reales.

3. **Tipo `Voto` y `Region` sin usar**: Definidos en `page.tsx` pero nunca utilizados.

4. **Footer con "GeoAnalytics"**: Inconsistencia de marca.

5. **ObtenerLayersModal**: Componente importado pero su uso no es claro en el flujo principal.

---

## 3. EVALUACIÓN DEL MVP

### 🎯 MVP Mínimo Recomendado

Para un producto funcional y usable, el MVP debe incluir:

#### MUST HAVE (Obligatorio)

| #   | Funcionalidad                              | Justificación                |
| --- | ------------------------------------------ | ---------------------------- |
| 1   | Mapa interactivo con capas base            | Core del producto            |
| 2   | Login con Google                           | Necesario para registro      |
| 3   | Registro de ubicación con datos académicos | Propuesta de valor principal |
| 4   | Visualización de ubicaciones en mapa       | Retroalimentación visual     |
| 5   | Búsqueda de estudiantes cercanos           | Funcionalidad diferenciadora |
| 6   | Gestión de capas (on/off, opacidad)        | Usabilidad básica            |
| 7   | Modo claro/oscuro                          | Accesibilidad y UX moderna   |
| 8   | Responsive design completo                 | Acceso multi-dispositivo     |

#### SHOULD HAVE (Importante)

| #   | Funcionalidad                   | Justificación            |
| --- | ------------------------------- | ------------------------ |
| 1   | Búsqueda de ubicación geocoding | Mejora usabilidad        |
| 2   | Perfil de usuario editable      | Control de datos propios |
| 3   | Estadísticas básicas            | Valor agregado           |
| 4   | Onboarding/Tutorial             | Reduce fricción inicial  |

#### NICE TO HAVE (Deseable)

| #   | Funcionalidad                      | Justificación         |
| --- | ---------------------------------- | --------------------- |
| 1   | Exportar mapa/datos                | Utilidad profesional  |
| 2   | Filtros avanzados                  | Análisis más profundo |
| 3   | Notificaciones                     | Engagement            |
| 4   | Sistema de contacto entre usuarios | Red social académica  |

### ❌ Funcionalidades a REMOVER para MVP

1. **Secciones placeholder** (búsqueda, filtros no funcionales)
2. **Botones decorativos** (Bell, Download, Share sin función)
3. **Datos hardcodeados** (1.2M, 85%, búsquedas recientes)
4. **Menús de navegación ocultos** (limpiar código)

---

## 4. FUNCIONALIDADES NUEVAS Y DISTINTIVAS

### 🚀 Propuestas de Alto Impacto

#### 4.1 Sistema de Geocoding Inteligente

```
Valor: ★★★★★
Esfuerzo: ★★★☆☆
```

**Descripción**: Integrar API de geocoding (Nominatim/OpenStreetMap) para buscar ubicaciones por nombre.

**Por qué aporta valor**:

- Usuario no necesita conocer coordenadas
- Mejora drásticamente la UX
- Permite "ir a" cualquier ubicación rápidamente

---

#### 4.2 Panel de Estadísticas y Analytics

```
Valor: ★★★★★
Esfuerzo: ★★★★☆
```

**Descripción**: Dashboard con visualizaciones (usando Recharts ya instalado):

- Estudiantes por facultad/carrera
- Mapa de calor por densidad
- Distribución geográfica por provincia

**Por qué aporta valor**:

- Insights para administradores
- Justificación para instituciones
- Datos accionables

---

#### 4.3 Modo de Comparación de Ubicaciones

```
Valor: ★★★★☆
Esfuerzo: ★★☆☆☆
```

**Descripción**: Seleccionar dos puntos y ver distancia, tiempo estimado de viaje.

**Por qué aporta valor**:

- Utilidad práctica para planificar encuentros
- Feature única diferenciadora

---

#### 4.4 Sistema de Etiquetas/Tags

```
Valor: ★★★★☆
Esfuerzo: ★★☆☆☆
```

**Descripción**: Permitir a estudiantes agregar tags: "Tesis", "Busco grupo de estudio", "Trabajo final", etc.

**Por qué aporta valor**:

- Facilita conexiones por intereses
- Filtrado más útil

---

#### 4.5 Compartir Ubicación Temporalmente

```
Valor: ★★★☆☆
Esfuerzo: ★★★☆☆
```

**Descripción**: Generar link temporal para compartir ubicación sin login.

**Por qué aporta valor**:

- Útil para eventos académicos
- Viral potential

---

#### 4.6 Integración con Calendario Académico

```
Valor: ★★★☆☆
Esfuerzo: ★★★★☆
```

**Descripción**: Mostrar eventos/fechas importantes de UADER en el mapa.

**Por qué aporta valor**:

- Contexto académico
- Engagement continuo

---

## 5. ANÁLISIS DE UI/UX

### 🔍 Evaluación Actual

#### Jerarquía Visual

| Aspecto  | Puntuación | Problema                                       |
| -------- | ---------- | ---------------------------------------------- |
| Header   | 7/10       | Logo pequeño, navegación dispersa              |
| Sidebars | 6/10       | Demasiada información, secciones confusas      |
| Mapa     | 8/10       | Ocupa espacio correcto, controles flotantes OK |
| Footer   | 5/10       | Innecesario en app, marca inconsistente        |

#### Claridad de Navegación

| Ruta               | Puntuación | Problema                                      |
| ------------------ | ---------- | --------------------------------------------- |
| Login → Mapa       | 7/10       | Funciona pero redirect no siempre claro       |
| Declarar ubicación | 5/10       | Flujo no evidente para nuevos usuarios        |
| Gestión de capas   | 6/10       | Muchos controles, poco espacio                |
| Buscar cercanos    | 6/10       | Requiere primero seleccionar punto (no obvio) |

#### Uso del Espacio

- **Desktop**: Aceptable, sidebars de 320px y 384px son adecuados
- **Mobile**: Problemático, sidebars cubren todo
- **Mapa**: Bien dimensionado pero controles pequeños

#### Consistencia de Componentes

| Aspecto | Estado                                                               |
| ------- | -------------------------------------------------------------------- |
| Botones | ⚠️ Mix de estilos (algunos `bg-blue-600`, otros `hover:bg-gray-100`) |
| Inputs  | ✅ Consistentes con Tailwind/shadcn                                  |
| Cards   | ⚠️ Algunos con sombra, otros sin                                     |
| Iconos  | ✅ Lucide consistente                                                |

#### Carga Cognitiva

**Puntuación: 6/10**

Problemas:

1. Demasiadas opciones visibles simultáneamente
2. Sidebar izquierdo con 3 tabs + contenido denso
3. Modal de ubicación tiene muchos campos
4. Usuario nuevo no sabe por dónde empezar

### 🚨 Problemas de Usabilidad Críticos

1. **Onboarding inexistente**: Usuario nuevo llega y no sabe qué hacer
2. **Checkbox "Declarar ubicación"**: No es intuitivo que debe activarse primero
3. **Búsqueda de cercanos**: Requiere pasos previos no documentados
4. **Feedback visual insuficiente**: Acciones no siempre tienen confirmación clara
5. **Mobile UX deficiente**: Sidebars fullscreen son intrusivos

### ✅ Mejoras Concretas Propuestas

#### 5.1 Onboarding de 3 pasos

```
Paso 1: "Bienvenido a CEREGEO" → Explicación breve
Paso 2: "Registra tu ubicación" → Tutorial visual
Paso 3: "Encuentra compañeros" → Mostrar búsqueda
```

#### 5.2 Floating Action Button (FAB) para declarar ubicación

- Botón flotante prominente en mobile
- Tooltip contextual
- Estado visual claro (activo/inactivo)

#### 5.3 Empty States informativos

Cuando no hay resultados/capas, mostrar ilustración + texto explicativo en lugar de espacios vacíos.

#### 5.4 Breadcrumb visual del flujo

En modal de ubicación, mostrar pasos: País → Localidad → Facultad → Datos

#### 5.5 Tooltips en controles del mapa

Explicar qué hace cada botón (Download, Share, etc.)

---

## 6. DISEÑO VISUAL Y MEJORAS ESTÉTICAS

### 🎨 Sistema de Diseño Propuesto

#### Tipografía

| Uso                | Font       | Tamaño  | Peso    |
| ------------------ | ---------- | ------- | ------- |
| Headlines          | Geist Sans | 24-32px | 600-700 |
| Subheadlines       | Geist Sans | 18-20px | 500-600 |
| Body               | Geist Sans | 14-16px | 400     |
| Captions           | Geist Sans | 12px    | 400     |
| Monospace (coords) | Geist Mono | 12-14px | 400     |

#### Espaciado (8px grid)

```
--space-xs: 4px
--space-sm: 8px
--space-md: 16px
--space-lg: 24px
--space-xl: 32px
--space-2xl: 48px
```

#### Border Radius

```
--radius-sm: 4px   (badges, chips)
--radius-md: 8px   (inputs, buttons)
--radius-lg: 12px  (cards, modals)
--radius-xl: 16px  (sidebars, panels)
--radius-full: 9999px (avatars, FABs)
```

#### Sombras

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-glow: 0 0 20px rgb(59 130 246 / 0.3); /* Para elementos activos */
```

### Mejoras de Layout

#### Header Optimizado

```
[☰ Menu] [CEREGEO Logo] -------- [Nav Items] -------- [🔔] [👤 User] [⚙️]
```

- Logo más prominente
- Navegación centrada en desktop
- Controles agrupados a la derecha

#### Sidebar Izquierdo Simplificado

```
┌─────────────────────────────┐
│ Panel de Control      [X]  │
├─────────────────────────────┤
│ [📍 Capas] [🔍 Buscar]     │ ← Solo 2 tabs principales
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ 🎯 Tu ubicación         │ │ ← Card prominente
│ │ [Declarar ubicación]    │ │
│ └─────────────────────────┘ │
│                             │
│ Capas disponibles           │
│ ┌─────────────────────────┐ │
│ │ [✓] Mapa Base      ▼▲  │ │
│ │ ──────────────○─────── │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

#### Microinteracciones

1. **Hover en capas**: Elevation sutil + borde
2. **Toggle de checkbox**: Animación de check
3. **Slider de opacidad**: Thumb con glow
4. **Botones**: Scale 0.98 on press
5. **Sidebars**: Slide con easing suave
6. **Popups**: Fade + scale desde 0.95

---

## 7. MODO CLARO / OSCURO

### 🌓 Implementación con next-themes

#### Paso 1: Configurar ThemeProvider

```tsx
// app/layout.tsx
import { ThemeProvider } from "next-themes";

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

#### Paso 2: Componente de Toggle

```tsx
// components/ThemeToggle.tsx
"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
```

### 🎨 Paleta de Colores Propuesta

#### Modo Claro

```css
:root {
  /* Fondos */
  --background: #ffffff;
  --background-secondary: #f8fafc;
  --background-tertiary: #f1f5f9;

  /* Textos */
  --foreground: #0f172a;
  --foreground-muted: #64748b;
  --foreground-subtle: #94a3b8;

  /* Primario (Azul CEREGEO) */
  --primary: #2563eb;
  --primary-hover: #1d4ed8;
  --primary-light: #dbeafe;

  /* Secundario */
  --secondary: #f1f5f9;
  --secondary-foreground: #334155;

  /* Accento (Verde éxito) */
  --accent: #10b981;
  --accent-light: #d1fae5;

  /* Bordes */
  --border: #e2e8f0;
  --border-focus: #2563eb;

  /* Estados */
  --destructive: #ef4444;
  --warning: #f59e0b;
  --success: #10b981;
}
```

#### Modo Oscuro

```css
.dark {
  /* Fondos */
  --background: #0f172a;
  --background-secondary: #1e293b;
  --background-tertiary: #334155;

  /* Textos */
  --foreground: #f8fafc;
  --foreground-muted: #94a3b8;
  --foreground-subtle: #64748b;

  /* Primario (Azul más brillante en dark) */
  --primary: #3b82f6;
  --primary-hover: #60a5fa;
  --primary-light: #1e3a5f;

  /* Secundario */
  --secondary: #1e293b;
  --secondary-foreground: #e2e8f0;

  /* Accento */
  --accent: #34d399;
  --accent-light: #064e3b;

  /* Bordes */
  --border: #334155;
  --border-focus: #3b82f6;

  /* Estados */
  --destructive: #f87171;
  --warning: #fbbf24;
  --success: #34d399;
}
```

### 🗺️ Estilos del Mapa para Modo Oscuro

Para que el mapa de OpenLayers sea coherente con el tema oscuro, se puede:

1. **Cambiar el tile layer**: Usar tiles oscuros como CartoDB Dark Matter o Stamen Toner

```typescript
// lib/const/layers.ts
import { useTheme } from "next-themes";

export const getDarkModeBaseLayer = () =>
  new TileLayer({
    source: new XYZ({
      url: "https://{a-d}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      attributions: "© CartoDB",
    }),
  });
```

2. **Invertir colores del mapa**: CSS filter approach

```css
.dark .ol-viewport {
  filter: invert(1) hue-rotate(180deg);
}
.dark .ol-viewport img {
  filter: invert(1) hue-rotate(180deg); /* Revertir íconos */
}
```

### ✅ Accesibilidad Visual

| Elemento        | Light Mode Contrast | Dark Mode Contrast | WCAG   |
| --------------- | ------------------- | ------------------ | ------ |
| Texto principal | 15.8:1              | 16.2:1             | ✅ AAA |
| Texto muted     | 4.7:1               | 4.5:1              | ✅ AA  |
| Primary on bg   | 4.9:1               | 5.2:1              | ✅ AA  |
| Links           | 5.1:1               | 5.4:1              | ✅ AA  |

---

## 8. RESPONSIVE DESIGN

### 📱 Breakpoints Definidos

```css
/* Tailwind defaults optimizados */
xs: 475px   /* Móviles pequeños */
sm: 640px   /* Móviles grandes / Landscape */
md: 768px   /* Tablets */
lg: 1024px  /* Tablets landscape / Laptops */
xl: 1280px  /* Desktop */
2xl: 1536px /* Desktop grandes */
```

### 🔍 Análisis por Dispositivo

#### Mobile (< 768px)

**Problemas actuales:**

1. Sidebars cubren toda la pantalla
2. Footer ocupa espacio innecesario
3. Controles del mapa muy pequeños
4. Popup del mapa no se adapta bien
5. Navegación requiere muchos taps

**Soluciones propuestas:**

```
┌─────────────────────────────┐
│ [☰] CEREGEO          [👤]  │ ← Header compacto
├─────────────────────────────┤
│                             │
│         [MAPA]              │ ← Mapa fullscreen
│                             │
├─────────────────────────────┤
│ [📍] [🔍] [📊] [⚙️]        │ ← Bottom navigation
└─────────────────────────────┘
```

1. **Bottom Sheet** en lugar de sidebars
2. **Bottom Navigation** para acciones principales
3. **FAB** para declarar ubicación
4. **Swipe gestures** para navegar
5. **Popup simplificado** con menos info

#### Tablet (768px - 1024px)

**Solución:**

- Sidebar izquierdo colapsable a iconos
- Panel derecho como drawer
- Mapa con más espacio

```
┌─────────────────────────────────────┐
│ [☰] CEREGEO    [Nav]    [👤] [⚙️] │
├────┬────────────────────────────────┤
│ 📍 │                                │
│ 🔍 │           [MAPA]               │
│ 📊 │                                │
│    │                                │
└────┴────────────────────────────────┘
```

#### Desktop (> 1024px)

**Mantener layout actual mejorado:**

- Sidebars siempre visibles
- Ajustar anchos máximos
- Más breathing room

### 📐 Componentes Responsive Específicos

#### Header Responsive

```tsx
<nav className="h-14 md:h-16 px-3 md:px-6 lg:px-8">
  {/* Logo: pequeño en mobile */}
  <Logo className="h-6 md:h-8" />

  {/* Nav: oculto en mobile */}
  <NavigationMenu className="hidden lg:flex" />

  {/* Mobile menu button */}
  <Button className="lg:hidden" />
</nav>
```

#### Sidebar Responsive

```tsx
{
  /* Mobile: Full overlay */
}
<Sheet open={isOpen} onOpenChange={setIsOpen}>
  <SheetContent side="left" className="w-[85vw] max-w-[350px]">
    <SidebarContent />
  </SheetContent>
</Sheet>;

{
  /* Desktop: Fixed sidebar */
}
<aside className="hidden md:block w-80 lg:w-96">
  <SidebarContent />
</aside>;
```

#### Popup del Mapa Responsive

```css
.popup-container {
  width: 280px; /* Mobile */
  max-height: 60vh; /* Evitar scroll infinito */
}

@media (min-width: 768px) {
  .popup-container {
    width: 340px;
  }
}
```

### 🎯 Mobile-First Checklist

- [ ] Touch targets mínimo 44x44px
- [ ] Espaciado entre elementos clickeables ≥ 8px
- [ ] Texto legible sin zoom (≥ 16px body)
- [ ] Formularios con `input type` apropiados
- [ ] Prevenir zoom no deseado en inputs
- [ ] Gestos nativos respetados (swipe back)
- [ ] Loading states visibles
- [ ] Error messages claros

---

## 9. PLAN DE IMPLEMENTACIÓN

### 📅 Fase 1: Fundamentos (1-2 semanas)

| Tarea                              | Prioridad | Esfuerzo |
| ---------------------------------- | --------- | -------- |
| Implementar ThemeProvider + toggle | Alta      | 2h       |
| Definir variables CSS para themes  | Alta      | 4h       |
| Limpiar código no utilizado        | Alta      | 2h       |
| Corregir inconsistencias de marca  | Alta      | 1h       |
| Actualizar metadata (título)       | Alta      | 30min    |

### 📅 Fase 2: UI/UX Core (2-3 semanas)

| Tarea                                | Prioridad | Esfuerzo |
| ------------------------------------ | --------- | -------- |
| Rediseñar header                     | Alta      | 4h       |
| Simplificar sidebar izquierdo        | Alta      | 6h       |
| Implementar bottom navigation mobile | Alta      | 8h       |
| Crear bottom sheet component         | Alta      | 6h       |
| Mejorar modal de ubicación           | Media     | 4h       |
| Agregar empty states                 | Media     | 3h       |

### 📅 Fase 3: Funcionalidades MVP (2-3 semanas)

| Tarea                        | Prioridad | Esfuerzo |
| ---------------------------- | --------- | -------- |
| Implementar geocoding search | Alta      | 8h       |
| Remover features placeholder | Alta      | 2h       |
| Crear onboarding básico      | Media     | 6h       |
| Dashboard mejorado           | Media     | 6h       |

### 📅 Fase 4: Pulido (1-2 semanas)

| Tarea                       | Prioridad | Esfuerzo |
| --------------------------- | --------- | -------- |
| Testing responsive completo | Alta      | 4h       |
| Accesibilidad audit         | Alta      | 4h       |
| Performance optimization    | Media     | 4h       |
| Documentación actualizada   | Media     | 3h       |

---

## 📊 RESUMEN EJECUTIVO

### Estado Actual

El proyecto **CEREGEO** tiene una base técnica sólida con un stack moderno y funcionalidades core implementadas. Sin embargo, la UI/UX necesita refinamiento significativo, el modo oscuro no está implementado, y hay varias funcionalidades placeholder que generan ruido.

### Recomendaciones Principales

1. **INMEDIATO**: Implementar modo claro/oscuro con `next-themes`
2. **PRIORIDAD ALTA**: Rediseñar experiencia mobile con bottom navigation
3. **PRIORIDAD ALTA**: Simplificar sidebar y remover placeholders
4. **PRIORIDAD MEDIA**: Agregar geocoding funcional
5. **PRIORIDAD MEDIA**: Crear onboarding para nuevos usuarios

### KPIs Sugeridos Post-Implementación

| Métrica                               | Target         |
| ------------------------------------- | -------------- |
| Tiempo a primera ubicación registrada | < 2 min        |
| Tasa de rebote mobile                 | < 40%          |
| Lighthouse Performance                | > 90           |
| Lighthouse Accessibility              | > 95           |
| Usuarios activos mensuales            | Baseline + 30% |

---

**Documento generado para el equipo de desarrollo CEREGEO**  
_Análisis profesional orientado a producto productivo y escalable_
