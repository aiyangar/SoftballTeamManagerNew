// Datos de prueba compartidos entre todos los tests

export const mockPlayers = [
  { id: 1, nombre: 'Juan García', numero: '5' },
  { id: 2, nombre: 'Pedro López', numero: '10' },
  { id: 3, nombre: 'Carlos Ruiz', numero: '23' },
  { id: 4, nombre: 'Miguel Soto', numero: '7' },
];

export const mockGame = {
  id: 42,
  equipo_contrario: 'Tigres',
  fecha_partido: '2026-04-01',
  lugar: 'Estadio Central',
  umpire: 550,
  equipo_id: 7,
  finalizado: false,
  resultado: null,
  carreras_equipo_local: null,
  carreras_equipo_contrario: null,
};

export const mockFinalizedGame = {
  ...mockGame,
  id: 99,
  finalizado: true,
  resultado: 'Victoria',
  carreras_equipo_local: 8,
  carreras_equipo_contrario: 3,
};

// Lineup completo tal como lo devuelve Supabase (con join a jugadores)
export const mockLineupFromDB = [
  {
    jugadores: { id: 1, nombre: 'Juan García', numero: '5' },
    orden_bateo: 1,
    posicion_campo: 'SS',
    es_titular: true,
    activo: true,
  },
  {
    jugadores: { id: 2, nombre: 'Pedro López', numero: '10' },
    orden_bateo: 2,
    posicion_campo: 'P',
    es_titular: true,
    activo: true,
  },
  {
    jugadores: { id: 3, nombre: 'Carlos Ruiz', numero: '23' },
    orden_bateo: 3,
    posicion_campo: '1B',
    es_titular: true,
    activo: true,
  },
];

// Lineup con una sustitución aplicada
export const mockLineupWithSub = [
  {
    jugadores: { id: 1, nombre: 'Juan García', numero: '5' },
    orden_bateo: 1,
    posicion_campo: 'SS',
    es_titular: true,
    activo: false, // relevado
  },
  {
    jugadores: { id: 2, nombre: 'Pedro López', numero: '10' },
    orden_bateo: 2,
    posicion_campo: 'P',
    es_titular: true,
    activo: true,
  },
  {
    jugadores: { id: 4, nombre: 'Miguel Soto', numero: '7' },
    orden_bateo: 1, // hereda turno del que salió
    posicion_campo: 'SS',
    es_titular: false, // sustituto
    activo: true,
  },
];

// gameDetailsData tal como se pasa a ScheduleHistoryModal
export const mockGameDetailsData = {
  attendance: [
    { jugadores: { id: 1, nombre: 'Juan García' } },
    { jugadores: { id: 2, nombre: 'Pedro López' } },
  ],
  payments: [],
  lineup: mockLineupFromDB,
};

export const mockPaymentTotals = {
  42: { totalUmpire: 330, totalInscripcion: 0 },
};
