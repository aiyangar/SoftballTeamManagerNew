-- Add batea_por_id to lineup_partidos for Bateador Designado (BD) tracking
ALTER TABLE public.lineup_partidos
  ADD COLUMN IF NOT EXISTS batea_por_id BIGINT REFERENCES public.jugadores(id) ON DELETE SET NULL;
