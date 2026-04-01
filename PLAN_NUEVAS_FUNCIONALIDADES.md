# Plan: Nuevas Funcionalidades — Softball Team Manager

## Contexto

El rediseño visual (Material Minimalista + Responsive 21:9 + estandarización de botones) ya fue completado.
Este plan cubre las 6 funcionalidades nuevas identificadas en el roadmap como siguiente etapa de mejora de UX.

## Regla de trabajo

Al terminar cada fase, marcar esa fase como terminada, haz un resumen de los cambios realizados y menciona cuál es la siguiente fase, posteriormente ejecutar `/clear`. Cada fase inicia con este plan como única referencia.

## Estado actual del codebase (al momento de escribir este plan)

- **Mensajes de error/éxito:** `useState` inline en cada página + JSX con `div` de Tailwind. Auto-dismiss de success via `setTimeout`.
- **Confirmaciones destructivas:** `window.confirm()` en `Players.jsx:~769` y `alert()` en `Teams.jsx:~146`.
- **localStorage:** No se usa en ningún archivo.
- **Filtros de jugadores:** `useState` local en `Players.jsx` — se pierden al navegar o recargar.
- **Toast library:** No instalada.
- **PWA:** No configurada. `public/` solo tiene `vite.svg`. No hay `manifest.json`.
- **Vite config:** Solo `react()` y `tailwindcss()` como plugins.

---

## Fase A — Toast Notifications ✅ COMPLETADA

**Objetivo:** Reemplazar todos los `<div>` de error/éxito inline con un sistema de toasts centralizado.
**Impacto:** Alta — limpia código de 9 archivos, mejora UX inmediatamente.

### A1 · Instalar dependencia ✅

```bash
npm install react-hot-toast
```

### A2 · Configurar provider en `src/main.jsx` ✅

Agregar `<Toaster>` junto al `RouterProvider`:

```jsx
import { Toaster } from 'react-hot-toast';

// Dentro del render:
<Toaster
  position="top-right"
  toastOptions={{
    style: {
      background: '#1e1e2e',
      color: '#e2e8f0',
      border: '1px solid #313147',
    },
    success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
    error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
  }}
/>
```

### A3 · Crear hook `src/hooks/useToast.js` ✅

Thin wrapper para no acoplar la librería directamente en cada componente:

```js
import toast from 'react-hot-toast';

export const useToast = () => ({
  success: (msg) => toast.success(msg),
  error:   (msg) => toast.error(msg),
  info:    (msg) => toast(msg),
});
```

### A4 · Migrar páginas ✅

En cada archivo:
1. Eliminar `const [error, setError] = useState(null)` y `const [success, setSuccess] = useState(null)`
2. Eliminar los `useEffect` de auto-dismiss de success
3. Eliminar los bloques JSX de error/success (`{error && <div>...`)
4. Importar `useToast` y reemplazar `setError(msg)` → `toast.error(msg)`, `setSuccess(msg)` → `toast.success(msg)`

| Archivo | Estado que eliminar |
|---------|-------------------|
| `src/pages/Players.jsx` | `error` + `success` |
| `src/pages/Teams.jsx` | `error` + `success` |
| `src/pages/Schedule.jsx` | `error` + `success` |
| `src/pages/Dashboard.jsx` | `error` |
| `src/pages/AdminPanel.jsx` | `error` + `success` |
| `src/pages/MyAccount.jsx` | `error` + `success` |
| `src/components/Forms/PaymentForm.jsx` | `error` + `successMessage` |
| `src/components/Forms/PlayerForm.jsx` | `error` |
| `src/components/Forms/ScheduleForm.jsx` | `error` |

### A5 · Verificación ✅

- `npm run lint` — sin errores
- `npm run build` — build exitoso
- Probar: crear jugador → toast success verde aparece arriba derecha
- Probar: error de red → toast error rojo aparece arriba derecha

---

## Fase B — Confirm Dialog ✅ COMPLETADA

**Objetivo:** Reemplazar `window.confirm()` y `alert()` nativos con un modal de confirmación reutilizable.
**Impacto:** Media — elimina diálogos del browser que rompen la experiencia visual.

### B1 · Crear componente `src/components/Modals/ConfirmModal.jsx` ✅

Props:
- `isOpen` — boolean
- `title` — string
- `message` — string
- `confirmLabel` — string (default: `'Confirmar'`)
- `cancelLabel` — string (default: `'Cancelar'`)
- `onConfirm` — function
- `onCancel` — function
- `variant` — `'danger'` | `'warning'` | `'default'`

Estructura visual:
```
[overlay con backdrop-blur]
  [modal centrado, max-w-sm]
    [ícono según variant] [title]
    [message]
    [Cancelar: btn btn-secondary] [Confirmar: btn btn-danger | btn-primary]
```

Usar las clases `.modal-overlay` y `.modal-container` existentes en `index.css`.

### B2 · Crear hook `src/hooks/useConfirm.js` ✅

El hook devuelve `{ confirmProps, confirm }` donde `confirm(options)` retorna una `Promise<boolean>`.
Esto permite el patrón `const ok = await confirm({ ... })` en los handlers:

```js
// Uso en página:
const { confirmProps, confirm } = useConfirm();

const deletePlayer = async (player) => {
  const ok = await confirm({
    title: 'Eliminar jugador',
    message: `¿Eliminar a ${player.nombre}? Esta acción no se puede deshacer.`,
    confirmLabel: 'Sí, eliminar',
    variant: 'danger',
  });
  if (!ok) return;
  // ...lógica de eliminación
};

// En el JSX:
<ConfirmModal {...confirmProps} />
```

### B3 · Migrar usos actuales ✅

| Archivo | Línea aprox. | Acción actual | Reemplazar con |
|---------|-------------|---------------|----------------|
| `src/pages/Players.jsx` | ~769 | `if (!confirm('¿Estás seguro...'))` en `deletePlayer` | `useConfirm` + `ConfirmModal` |
| `src/pages/Teams.jsx` | ~146 | `alert('próximamente')` en `handleDeleteTeam` | Eliminar el alert; el botón delete sigue pendiente de implementación real |

### B4 · Verificación ✅

- Eliminar jugador → aparece modal de confirmación (no diálogo del browser)
- Cancelar → jugador NO se elimina
- Confirmar → jugador se elimina y aparece toast success (si Fase A ya está hecha)

---

## Fase C — Filtros Persistentes ✅ COMPLETADA

**Objetivo:** Los filtros de jugadores no se pierden al navegar o recargar.
**Impacto:** Media — mejora QoL para usuarios que filtran frecuentemente.

### C1 · Crear hook `src/hooks/useLocalStorage.js` ✅

```js
import { useState } from 'react';

export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setAndPersist = (newValue) => {
    const resolved = typeof newValue === 'function' ? newValue(value) : newValue;
    setValue(resolved);
    try {
      localStorage.setItem(key, JSON.stringify(resolved));
    } catch { /* cuota excedida, continuar sin persistir */ }
  };

  return [value, setAndPersist];
}
```

### C2 · Migrar `src/pages/Players.jsx` ✅

Reemplazar:
```js
const [filters, setFilters] = useState({ nombre: '', numero: '', posiciones: [], posicionMatchType: 'any' });
const [showFilters, setShowFilters] = useState(false);
```

Con:
```js
import { useLocalStorage } from '../hooks/useLocalStorage';

const [filters, setFilters] = useLocalStorage('players_filters', {
  nombre: '', numero: '', posiciones: [], posicionMatchType: 'any'
});
const [showFilters, setShowFilters] = useLocalStorage('players_show_filters', false);
```

### C3 · Botón "Limpiar filtros" ✅

Verificar si ya existe. Si no existe, agregar un botón que resetee al valor por defecto:
```jsx
<button
  className='btn btn-ghost text-xs'
  onClick={() => setFilters({ nombre: '', numero: '', posiciones: [], posicionMatchType: 'any' })}
>
  Limpiar filtros
</button>
```

### C4 · Verificación ✅

- Aplicar filtros → navegar a Dashboard → volver a Players → filtros siguen aplicados
- Recargar página → filtros siguen aplicados
- "Limpiar filtros" → filtros vuelven a su estado vacío

---

## Fase D — Skeleton Loading ✅ COMPLETADA

**Objetivo:** Mostrar esqueletos animados mientras cargan los datos.
**Impacto:** Media — percepción de velocidad más profesional.

### D1 · Crear componente base `src/components/UI/Skeleton.jsx` ✅

```jsx
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-surface-700 rounded ${className}`} />
);
export default Skeleton;
```

### D2 · Crear skeletons de cards ✅

Cada skeleton replica la forma y proporciones de su card real, usando `Skeleton` como bloque de construcción.

**`src/components/Cards/DashboardCardSkeleton.jsx`**
- Mismas dimensiones que `DashboardCard` (`min-h-[18rem]`)
- Barra de título, área de contenido, barra inferior

**`src/components/Cards/PlayerCardSkeleton.jsx`**
- Mismas dimensiones que `PlayerCard`
- Círculo (avatar/número), líneas de nombre y posición

**`src/components/Cards/ScheduleCardSkeleton.jsx`**
- Mismas dimensiones que `ScheduleCard`
- Líneas de fecha, equipos, estado

### D3 · Migrar páginas ✅

Reemplazar el estado de carga vacío actual con grids de skeletons.

| Archivo | Loading state | Grid de skeletons |
|---------|--------------|-------------------|
| `src/pages/Dashboard.jsx` | `loadingTeam` | 4× `DashboardCardSkeleton` en grid `grid-cols-1 fold:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` |
| `src/pages/Players.jsx` | `loadingPlayers` | 8× `PlayerCardSkeleton` en el mismo grid que `PlayerCardsGrid` |
| `src/pages/Schedule.jsx` | loading inicial | 4× `ScheduleCardSkeleton` |
| `src/pages/Teams.jsx` | loading inicial | 4× `DashboardCardSkeleton` |

Patrón de uso:
```jsx
if (loading) return (
  <div className="grid grid-cols-1 fold:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 4 }).map((_, i) => <DashboardCardSkeleton key={i} />)}
  </div>
);
```

### D4 · Verificación ✅

- Recargar cualquier página con datos → ver animación de skeleton antes de los datos
- Skeleton desaparece correctamente cuando llegan los datos
- Sin errores de layout (skeleton debe tener mismas dimensiones que la card real)

---

## Fase E — Sticky Header ✅ COMPLETADA

**Objetivo:** El header (logo + menú) se queda fijo al hacer scroll.
**Impacto:** Baja — mejora navegación en páginas con mucho contenido (Schedule, Players).

### E1 · Modificar `src/components/Layout.jsx`

El header actual está dentro del scroll normal. Agregar:

```jsx
<header className="sticky top-0 z-40 bg-surface-900/95 backdrop-blur-sm border-b border-surface-border">
  {/* contenido del header/menu */}
</header>
```

- `sticky top-0` — se queda fijo al llegar al top del viewport
- `z-40` — encima del contenido pero debajo de modales (`z-50`)
- `bg-surface-900/95` — fondo semitransparente para dar sensación de profundidad
- `backdrop-blur-sm` — blur del contenido detrás al hacer scroll

### E2 · Verificar comportamiento en móvil

En pantallas pequeñas el header sticky consume espacio vertical valioso. Confirmar que:
- El primer card/elemento de contenido no queda oculto detrás del header
- En landscape móvil no queda demasiado espacio ocupado

### E3 · Verificación

- Scroll en Schedule (página más larga) → header visible todo el tiempo
- Scroll en Players con muchos jugadores → header visible
- Modales abren por encima del header sticky (z-index correcto)

---

## Fase F — PWA (Progressive Web App)

**Objetivo:** La app sea instalable en móvil/desktop desde el navegador.
**Impacto:** Baja para usuarios web, Alta para usuarios móvil frecuentes.

### F1 · Instalar plugin

```bash
npm install -D vite-plugin-pwa
```

### F2 · Configurar `vite.config.js`

```js
import { VitePWA } from 'vite-plugin-pwa';

// Agregar al array plugins:
VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
  manifest: {
    name: 'Softball Team Manager',
    short_name: 'SoftballMgr',
    description: 'Gestión de equipos de softball',
    theme_color: '#0f0f0f',
    background_color: '#0f0f0f',
    display: 'standalone',
    start_url: '/',
    icons: [
      { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
      { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
  },
})
```

### F3 · Crear iconos

Generar y colocar en `public/`:
- `pwa-192x192.png` — ícono de app 192×192px
- `pwa-512x512.png` — ícono de app 512×512px
- `apple-touch-icon.png` — 180×180px para iOS

### F4 · Verificación

- `npm run build` → sin errores
- Abrir build en Chrome → DevTools → Application → Manifest → sin errores
- Lighthouse PWA audit → score ≥ 90
- En Chrome mobile → aparece prompt "Agregar a pantalla de inicio"

---

## Resumen ejecutivo

### Orden de prioridad recomendado

| Prioridad | Fase | Impacto UX | Esfuerzo | Archivos afectados |
|-----------|------|-----------|----------|-------------------|
| 🔴 Alta | **A — Toasts** | Muy alto | Medio | 9 archivos |
| 🔴 Alta | **B — Confirm Dialog** | Alto | Bajo | 2 archivos + 2 nuevos |
| 🟡 Media | **C — Filtros persistentes** | Medio | Muy bajo | 1 archivo + 1 nuevo hook |
| 🟡 Media | **D — Skeletons** | Medio | Medio | 4 páginas + 4 nuevos componentes |
| 🟢 Baja | **E — Sticky Header** | Bajo | Muy bajo | 1 archivo |
| 🟢 Baja | **F — PWA** | Bajo/Alto* | Alto | config + assets |

> *PWA: impacto bajo para usuarios desktop, alto para usuarios móvil que usan la app frecuentemente.

### Archivos nuevos a crear

| Archivo | Fase |
|---------|------|
| `src/hooks/useToast.js` | A |
| `src/hooks/useConfirm.js` | B |
| `src/components/Modals/ConfirmModal.jsx` | B |
| `src/hooks/useLocalStorage.js` | C |
| `src/components/UI/Skeleton.jsx` | D |
| `src/components/Cards/DashboardCardSkeleton.jsx` | D |
| `src/components/Cards/PlayerCardSkeleton.jsx` | D |
| `src/components/Cards/ScheduleCardSkeleton.jsx` | D |

### Archivos modificados por fase

| Fase A | Fase B | Fase C | Fase D | Fase E | Fase F |
|--------|--------|--------|--------|--------|--------|
| `src/main.jsx` | `src/pages/Players.jsx` | `src/pages/Players.jsx` | `src/pages/Dashboard.jsx` | `src/components/Layout.jsx` | `vite.config.js` |
| `src/pages/Players.jsx` | `src/pages/Teams.jsx` | | `src/pages/Players.jsx` | | `public/pwa-*.png` |
| `src/pages/Teams.jsx` | | | `src/pages/Schedule.jsx` | | |
| `src/pages/Schedule.jsx` | | | `src/pages/Teams.jsx` | | |
| `src/pages/Dashboard.jsx` | | | | | |
| `src/pages/AdminPanel.jsx` | | | | | |
| `src/pages/MyAccount.jsx` | | | | | |
| `src/components/Forms/PaymentForm.jsx` | | | | | |
| `src/components/Forms/PlayerForm.jsx` | | | | | |
| `src/components/Forms/ScheduleForm.jsx` | | | | | |
