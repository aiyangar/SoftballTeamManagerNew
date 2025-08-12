-- Script para agregar la columna propietario_id a la tabla jugadores
-- Ejecuta este script en el SQL Editor de Supabase

-- Agregar la columna propietario_id a la tabla jugadores
ALTER TABLE jugadores 
ADD COLUMN propietario_id UUID REFERENCES auth.users(id);

-- Crear un índice para mejorar el rendimiento de las consultas por propietario
CREATE INDEX idx_jugadores_propietario_id ON jugadores(propietario_id);

-- Agregar una política RLS (Row Level Security) para que los usuarios solo vean sus propios jugadores
-- Primero habilitar RLS en la tabla si no está habilitado
ALTER TABLE jugadores ENABLE ROW LEVEL SECURITY;

-- Crear política para que los usuarios solo puedan ver sus propios jugadores
CREATE POLICY "Users can view their own players" ON jugadores
    FOR SELECT USING (auth.uid() = propietario_id);

-- Crear política para que los usuarios solo puedan insertar jugadores con su propio propietario_id
CREATE POLICY "Users can insert their own players" ON jugadores
    FOR INSERT WITH CHECK (auth.uid() = propietario_id);

-- Crear política para que los usuarios solo puedan actualizar sus propios jugadores
CREATE POLICY "Users can update their own players" ON jugadores
    FOR UPDATE USING (auth.uid() = propietario_id);

-- Crear política para que los usuarios solo puedan eliminar sus propios jugadores
CREATE POLICY "Users can delete their own players" ON jugadores
    FOR DELETE USING (auth.uid() = propietario_id);

-- Comentario: Después de ejecutar este script, la tabla jugadores tendrá:
-- - Nueva columna propietario_id que referencia auth.users(id)
-- - Índice para optimizar consultas
-- - Políticas RLS para seguridad de datos
