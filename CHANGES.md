# Cambios — Sprint UX & Nuevas Funcionalidades

> Rama: `desarrollo` | Fecha: 2026-04-01

---

## Requisitos implementados

### 1. Reducción de botones en la UI

**Problema:** Demasiados botones visibles simultáneamente en la cabecera y en los modales.

**Cambios:**
- **`src/components/Menu.jsx`** — Eliminado el botón "Home" redundante del header. El logo en `Layout.jsx` ya navega al Dashboard, por lo que el botón era innecesario.
- **`src/components/Modals/ScheduleHistoryModal.jsx`** — Los 6 botones de acción del modal de partido (Editar, Asistencia, Pagos, Lineup, Terminar, Eliminar) se redujeron a 4 acciones principales visibles (**Asistencia, Pagos, Lineup, Terminar**) más un **menú kebab (⋮)** que agrupa las acciones destructivas/poco frecuentes: Editar y Eliminar.

---

### 2. Ícono de la PWA (tarea de assets — sin cambios de código)

**Problema:** Los íconos de la PWA no se parecen al logo de la app.

**Acción requerida (manual):**
Exportar `src/assets/MySoftballClubLogoV2.png` en los siguientes tamaños y reemplazar los archivos en `public/`:

| Archivo | Tamaño |
|---|---|
| `public/pwa-192x192.png` | 192 × 192 px |
| `public/pwa-512x512.png` | 512 × 512 px |
| `public/apple-touch-icon.png` | 180 × 180 px |

No se requieren cambios en `vite.config.js` ni en `src/config/pwaManifest.js`.

---

### 3. Compartir alineación / turnos al bat como imagen

**`src/components/Modals/LineupModal.jsx`**

- Se agregó un botón **"Compartir"** en la fila de acciones del acordeón del lineup (junto a los botones de "+ Agregar jugador" y "⇄ Sustitución"), alineado a la derecha. Solo aparece cuando hay un lineup guardado en la BD.
- Al presionar el botón, se genera una **imagen PNG** usando la Canvas API (sin dependencias adicionales para la generación):
  - Barra de acento verde en la parte superior
  - Header con ícono ⚾, texto "LINEUP", nombre del rival y fecha
  - Sección **TITULARES**: número de turno, número de playera (badge ámbar), nombre, posición (badge rosa)
  - Sección **BANCA**: jugadores suplentes con indicador "relevado" si aplica
  - Footer con "My Softball Club"
- **En móvil (Android / iOS PWA):** abre el sheet nativo de compartir con la imagen adjunta (`navigator.share({ files: [...] })`).
- **En escritorio:** descarga la imagen como `lineup-[rival].png`.

---

### 4. Monto máximo de inscripción por equipo y por jugador

#### Migraciones de base de datos requeridas (ejecutar en Supabase)

```sql
ALTER TABLE equipos ADD COLUMN inscripcion_por_jugador numeric(10,2) DEFAULT NULL;
ALTER TABLE jugadores ADD COLUMN inscripcion_max numeric(10,2) DEFAULT NULL;
```

#### Cambios de código

| Archivo | Cambio |
|---|---|
| `src/components/Forms/TeamForm.jsx` | Renombrado campo a "Meta total de inscripción del equipo". Agregado nuevo campo **"Monto máximo de inscripción por jugador ($)"** (`inscripcion_por_jugador`) — es el límite por defecto para todos los jugadores del equipo. |
| `src/components/Forms/PlayerForm.jsx` | Agregado campo opcional **"Monto personalizado de inscripción ($)"** (`inscripcion_max`) — permite definir un límite diferente para jugadores que se inscriben tarde. Muestra como placeholder el monto del equipo si está configurado. |
| `src/pages/Players.jsx` | Fetch de `inscripcion_por_jugador` del equipo; si está configurado, se usa directamente como `inscripcionTarget` en lugar del cálculo dinámico. Estado `inscripcionMax` conectado al formulario de jugador. |
| `src/pages/Teams.jsx` | CRUD actualizado para incluir `inscripcion_por_jugador` en crear/editar equipo. |
| `src/components/Forms/PaymentForm.jsx` | Al cargar: fetch de `inscripcion_por_jugador` del equipo. Al seleccionar jugador: fetch de `inscripcion_max` del jugador. El input de inscripción muestra el límite aplicable (`player.inscripcion_max ?? team.inscripcion_por_jugador`) y el monto faltante. El atributo `max` del input impide ingresar montos mayores al límite. |

**Jerarquía del límite:** `jugadores.inscripcion_max` > `equipos.inscripcion_por_jugador` > sin límite.

---

### 5. Catálogo de equipos de la liga (sin necesidad de partido)

#### Migración de base de datos requerida (ejecutar en Supabase)

```sql
CREATE TABLE equipos_liga (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE equipos_liga ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own league teams"
  ON equipos_liga
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

#### Cambios de código

| Archivo | Cambio |
|---|---|
| `src/components/Forms/LeagueTeamForm.jsx` | **Nuevo componente** — formulario inline para agregar equipos rivales al catálogo. |
| `src/pages/Teams.jsx` | Nueva sección **"Equipos de la Liga"** con lista de equipos rivales, edición inline y eliminación. Los equipos se pueden registrar sin necesidad de tener un partido agendado. |
| `src/components/Forms/ScheduleForm.jsx` | El campo `equipo_contrario` cambió de texto libre a un `<select>` con los equipos del catálogo. Incluye la opción "Otro (escribir manualmente)..." para mantener compatibilidad con datos existentes. |
| `src/pages/Schedule.jsx` | Fetch de `equipos_liga` al cargar la página; se pasan como prop `leagueTeams` al `ScheduleForm`. |

---

## Sugerencia implementada — Barra de navegación inferior (móvil)

**`src/components/BottomNav.jsx`** — Nuevo componente con 4 accesos directos: Dashboard, Jugadores, Partidos, Equipos. Usa `NavLink` para resaltar la sección activa.

**`src/components/Layout.jsx`** — Importa y renderiza `BottomNav`. Solo visible en pantallas `< md` (se oculta en escritorio donde ya existe el menú hamburguesa). Se agregó `pb-20` al contenedor principal en móvil para que el contenido no quede tapado por la barra.

---

## Resumen de archivos modificados

```
src/
├── components/
│   ├── BottomNav.jsx                        ← NUEVO
│   ├── Layout.jsx                           ← modificado
│   ├── Menu.jsx                             ← modificado
│   ├── Forms/
│   │   ├── LeagueTeamForm.jsx               ← NUEVO
│   │   ├── PaymentForm.jsx                  ← modificado
│   │   ├── PlayerForm.jsx                   ← modificado
│   │   ├── ScheduleForm.jsx                 ← modificado
│   │   └── TeamForm.jsx                     ← modificado
│   └── Modals/
│       ├── LineupModal.jsx                  ← modificado
│       └── ScheduleHistoryModal.jsx         ← modificado
└── pages/
    ├── Players.jsx                          ← modificado
    ├── Schedule.jsx                         ← modificado
    └── Teams.jsx                            ← modificado
```

---

## Pendientes (acción manual del usuario)

1. **Ejecutar las 3 migraciones SQL** en el panel de Supabase (ver secciones 4 y 5).
2. **Reemplazar los íconos PWA** en `public/` con versiones derivadas del logo (ver sección 2).
