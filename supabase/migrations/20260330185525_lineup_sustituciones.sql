-- Migration: lineup_partidos y sustituciones_partidos
-- Fecha: 2026-03-30

-- =============================================
-- Tabla: lineup_partidos
-- =============================================
CREATE TABLE IF NOT EXISTS public.lineup_partidos (
  id            BIGSERIAL PRIMARY KEY,
  partido_id    BIGINT NOT NULL REFERENCES public.partidos(id) ON DELETE CASCADE,
  jugador_id    BIGINT NOT NULL REFERENCES public.jugadores(id) ON DELETE CASCADE,
  equipo_id     BIGINT NOT NULL REFERENCES public.equipos(id) ON DELETE CASCADE,
  orden_bateo   SMALLINT NOT NULL CHECK (orden_bateo BETWEEN 1 AND 20),
  posicion_campo TEXT NOT NULL CHECK (posicion_campo IN ('P','C','1B','2B','3B','SS','LF','CF','RF','DH')),
  es_titular    BOOLEAN NOT NULL DEFAULT TRUE,
  activo        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para lineup_partidos
CREATE INDEX IF NOT EXISTS idx_lineup_partido_id   ON public.lineup_partidos (partido_id);
CREATE INDEX IF NOT EXISTS idx_lineup_equipo_id    ON public.lineup_partidos (equipo_id);
CREATE INDEX IF NOT EXISTS idx_lineup_jugador_id   ON public.lineup_partidos (jugador_id);

-- =============================================
-- Tabla: sustituciones_partidos
-- =============================================
CREATE TABLE IF NOT EXISTS public.sustituciones_partidos (
  id                BIGSERIAL PRIMARY KEY,
  partido_id        BIGINT NOT NULL REFERENCES public.partidos(id) ON DELETE CASCADE,
  equipo_id         BIGINT NOT NULL REFERENCES public.equipos(id) ON DELETE CASCADE,
  jugador_sale_id   BIGINT NOT NULL REFERENCES public.jugadores(id) ON DELETE CASCADE,
  jugador_entra_id  BIGINT NOT NULL REFERENCES public.jugadores(id) ON DELETE CASCADE,
  inning            SMALLINT NOT NULL CHECK (inning BETWEEN 1 AND 15),
  orden_bateo       SMALLINT NOT NULL CHECK (orden_bateo BETWEEN 1 AND 20),
  posicion_campo    TEXT NOT NULL CHECK (posicion_campo IN ('P','C','1B','2B','3B','SS','LF','CF','RF','DH')),
  notas             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para sustituciones_partidos
CREATE INDEX IF NOT EXISTS idx_sust_partido_id  ON public.sustituciones_partidos (partido_id);
CREATE INDEX IF NOT EXISTS idx_sust_equipo_id   ON public.sustituciones_partidos (equipo_id);

-- =============================================
-- RLS: lineup_partidos
-- =============================================
ALTER TABLE public.lineup_partidos ENABLE ROW LEVEL SECURITY;

-- Lectura: cualquier usuario autenticado puede leer lineup de su equipo
CREATE POLICY "lineup_select_own_team"
  ON public.lineup_partidos
  FOR SELECT
  TO authenticated
  USING (
    equipo_id IN (
      SELECT id FROM public.equipos WHERE propietario_id = auth.uid()
    )
  );

-- Insertar: solo el dueño del equipo
CREATE POLICY "lineup_insert_own_team"
  ON public.lineup_partidos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    equipo_id IN (
      SELECT id FROM public.equipos WHERE propietario_id = auth.uid()
    )
  );

-- Actualizar: solo el dueño del equipo
CREATE POLICY "lineup_update_own_team"
  ON public.lineup_partidos
  FOR UPDATE
  TO authenticated
  USING (
    equipo_id IN (
      SELECT id FROM public.equipos WHERE propietario_id = auth.uid()
    )
  );

-- Borrar: solo el dueño del equipo
CREATE POLICY "lineup_delete_own_team"
  ON public.lineup_partidos
  FOR DELETE
  TO authenticated
  USING (
    equipo_id IN (
      SELECT id FROM public.equipos WHERE propietario_id = auth.uid()
    )
  );

-- =============================================
-- RLS: sustituciones_partidos
-- =============================================
ALTER TABLE public.sustituciones_partidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sust_select_own_team"
  ON public.sustituciones_partidos
  FOR SELECT
  TO authenticated
  USING (
    equipo_id IN (
      SELECT id FROM public.equipos WHERE propietario_id = auth.uid()
    )
  );

CREATE POLICY "sust_insert_own_team"
  ON public.sustituciones_partidos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    equipo_id IN (
      SELECT id FROM public.equipos WHERE propietario_id = auth.uid()
    )
  );

CREATE POLICY "sust_update_own_team"
  ON public.sustituciones_partidos
  FOR UPDATE
  TO authenticated
  USING (
    equipo_id IN (
      SELECT id FROM public.equipos WHERE propietario_id = auth.uid()
    )
  );

CREATE POLICY "sust_delete_own_team"
  ON public.sustituciones_partidos
  FOR DELETE
  TO authenticated
  USING (
    equipo_id IN (
      SELECT id FROM public.equipos WHERE propietario_id = auth.uid()
    )
  );
