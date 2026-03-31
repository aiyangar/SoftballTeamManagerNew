# Plan: Orden de Bateo y Cambios (Sustituciones)

## Fase 1 — Base de Datos

- [x] Crear tabla `lineup_partidos` en Supabase
- [x] Crear tabla `sustituciones_partidos` en Supabase
- [x] Configurar RLS policies en ambas tablas
- [x] Verificar con inserción manual de prueba

## Fase 2 — Lógica en Schedule.jsx

- [ ] Agregar `numero` al `fetchPlayers`
- [ ] Agregar estados para lineup y sustituciones
- [ ] Implementar `fetchLineup`
- [ ] Implementar `saveLineup`
- [ ] Implementar `saveSubstitution`
- [ ] Agregar handlers de apertura/cierre de modales
- [ ] Actualizar el `useModal` call

## Fase 3 — Componentes nuevos

- [ ] Crear `src/components/Modals/LineupModal.jsx`
- [ ] Crear `src/components/Modals/SubstitutionModal.jsx`

## Fase 4 — Integración

- [ ] Modificar `ScheduleHistoryModal.jsx` — agregar botón "Lineup"
- [ ] Modificar `ScheduleHistoryModal.jsx` — agregar acordeón de resumen
- [ ] Conectar `LineupModal` y `SubstitutionModal` en el JSX de `Schedule.jsx`
- [ ] Pruebas end-to-end del flujo completo

## Fase 5 — Pulido

- [ ] Loading spinners en `LineupModal`
- [ ] Validar que no se guarde un lineup vacío
- [ ] Validar que no haya sustitución si no hay jugadores disponibles
- [ ] Advertencia si se intenta sustituir sin lineup previo
- [ ] Bloquear toda edición cuando `partido.finalizado = true`

---

## Referencia rápida

### Tablas

**`lineup_partidos`**
| Columna | Tipo | Notas |
|---|---|---|
| id | BIGSERIAL PK | |
| partido_id | BIGINT FK | → partidos |
| jugador_id | BIGINT FK | → jugadores |
| equipo_id | BIGINT FK | → equipos |
| orden_bateo | SMALLINT | 1–20 |
| posicion_campo | TEXT | P, C, 1B, 2B, 3B, SS, LF, CF, RF, DH |
| es_titular | BOOLEAN | false = sustituto |
| activo | BOOLEAN | false = fue relevado |
| created_at | TIMESTAMPTZ | |

**`sustituciones_partidos`**
| Columna | Tipo | Notas |
|---|---|---|
| id | BIGSERIAL PK | |
| partido_id | BIGINT FK | → partidos |
| equipo_id | BIGINT FK | → equipos |
| jugador_sale_id | BIGINT FK | → jugadores |
| jugador_entra_id | BIGINT FK | → jugadores |
| inning | SMALLINT | 1–15 |
| orden_bateo | SMALLINT | hereda el del que sale |
| posicion_campo | TEXT | |
| notas | TEXT | opcional |
| created_at | TIMESTAMPTZ | |

### Archivos clave
| Archivo | Acción |
|---|---|
| `src/pages/Schedule.jsx` | Modificar |
| `src/components/Modals/ScheduleHistoryModal.jsx` | Modificar |
| `src/components/Modals/LineupModal.jsx` | Crear |
| `src/components/Modals/SubstitutionModal.jsx` | Crear |
