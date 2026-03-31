-- Allow NULL orden_bateo for bench/substitute players not in the batting order
ALTER TABLE public.lineup_partidos
  ALTER COLUMN orden_bateo DROP NOT NULL;

ALTER TABLE public.lineup_partidos
  DROP CONSTRAINT IF EXISTS lineup_partidos_orden_bateo_check;

ALTER TABLE public.lineup_partidos
  ADD CONSTRAINT lineup_partidos_orden_bateo_check
  CHECK (orden_bateo IS NULL OR orden_bateo BETWEEN 1 AND 20);
