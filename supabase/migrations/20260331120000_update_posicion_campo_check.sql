-- Update posicion_campo check constraint to include CLF, CRF, BD, CD
ALTER TABLE public.lineup_partidos
  DROP CONSTRAINT IF EXISTS lineup_partidos_posicion_campo_check;

ALTER TABLE public.lineup_partidos
  ADD CONSTRAINT lineup_partidos_posicion_campo_check
  CHECK (posicion_campo IN ('P','C','1B','2B','3B','SS','LF','CLF','CRF','RF','DH','BD','CD'));

ALTER TABLE public.sustituciones_partidos
  DROP CONSTRAINT IF EXISTS sustituciones_partidos_posicion_campo_check;

ALTER TABLE public.sustituciones_partidos
  ADD CONSTRAINT sustituciones_partidos_posicion_campo_check
  CHECK (posicion_campo IN ('P','C','1B','2B','3B','SS','LF','CLF','CRF','RF','DH','BD','CD'));
