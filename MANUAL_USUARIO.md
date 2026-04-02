# Manual de Usuario — Softball Team Manager

**Versión:** 0.14.0 | **Fecha:** Abril 2026

---

## Introducción

**Softball Team Manager** es una aplicación web para gestionar equipos de softball: jugadores, partidos, asistencia, pagos y estadísticas del equipo, todo desde el celular.

---

## Navegación

La app tiene dos formas de navegar:

**Barra inferior** (siempre visible):

| Ícono | Sección |
|-------|---------|
| 🏠 Inicio | Dashboard con resumen del equipo |
| 👥 Jugadores | Lista y gestión de jugadores |
| ⚾ Partidos | Calendario y gestión de partidos |
| 🏟️ Equipos | Lista y gestión de equipos |

**Menú hamburguesa** (esquina superior derecha):

![Menú hamburguesa](docs/screenshots/06-menu.png)

Contiene el selector de equipo activo, acceso a Administración (solo admin), Mi Cuenta y Cerrar Sesión.

---

## Acceso al Sistema

### Inicio de Sesión

![Login](docs/screenshots/00-login.png)

1. Ingresa tu correo electrónico y contraseña
2. Toca **"Iniciar Sesión"**
3. Serás redirigido al Dashboard

> El registro de nuevas cuentas requiere aprobación del administrador.

---

## Dashboard

![Dashboard](docs/screenshots/01-dashboard.png)

Vista general del equipo activo. Muestra:

- **Total de Jugadores** — cantidad y estado del equipo
- **Próximo Partido** — fecha, lugar y oponente
- **Pago de la Inscripción** — total recaudado vs meta
- **Último Partido** — resultado del partido más reciente
- **Historial de Resultados** — victorias, derrotas, empates
- **Top Contribuyentes** — jugadores con mayores pagos
- **Top Asistencias** — jugadores con más partidos asistidos
- **Estadísticas Generales** — total partidos, promedio asistencia, % victoria

Toca cualquier card para ir directamente a la sección correspondiente.

---

## Gestión de Equipos

![Equipos](docs/screenshots/04-equipos.png)

### Crear un Equipo

1. Toca **"+ Agregar Equipo"**
2. Ingresa el nombre y el costo de inscripción (opcional)
3. Toca **"Crear Equipo"**

### Seleccionar el Equipo Activo

Usa el selector en el menú hamburguesa para cambiar entre equipos. Todas las operaciones (jugadores, partidos, pagos) aplican al equipo seleccionado.

### Detalles del Equipo

Toca una card de equipo para ver:
- Estadísticas W-L-D (Victorias-Derrotas-Empates)
- Número de jugadores
- Estado de pagos de inscripción
- Botones de editar y eliminar

---

## Gestión de Jugadores

![Jugadores](docs/screenshots/02-jugadores.png)

### Agregar un Jugador

1. Toca **"+ Agregar Jugador"**
2. Completa los campos:
   - Nombre completo (obligatorio)
   - Número de camiseta
   - Teléfono / Email
   - Posiciones (máximo 3)
3. Toca **"Crear Jugador"**

### Buscar y Filtrar

Usa los filtros para encontrar jugadores por:
- Nombre (búsqueda parcial)
- Número de camiseta
- Posición (una o varias)

### Editar o Eliminar

Toca la card del jugador → se abre el modal de detalles → usa los botones **Editar** o **Eliminar**.

### Ver Historial del Jugador

Desde el modal de detalles toca **"Ver Historial"** para ver:
- Todos los partidos en que asistió
- Todos los pagos realizados (umpire e inscripción)
- Porcentaje de asistencia y totales

### Exportar / Importar Jugadores

- **Exportar**: Genera un CSV con todos los jugadores del equipo
- **Importar**: Carga jugadores desde otro equipo

---

## Gestión de Partidos

![Partidos](docs/screenshots/03-partidos.png)

### Agregar un Partido

1. Toca **"+ Agregar Partido"**
2. Completa:
   - Equipo contrario (obligatorio)
   - Fecha (obligatorio)
   - Lugar (obligatorio)
   - Pago al umpire (obligatorio)
3. Toca **"Registrar Partido"**

### Detalles del Partido

Toca una card de partido para abrir el modal con:

#### Asistencia
1. Toca **"Marcar Asistencia"**
2. Selecciona los jugadores que asistieron
3. Toca **"Guardar Asistencia"**

Si ya hay asistencia registrada, usa **"Cargar Asistencia Existente"** para editarla.

#### Pagos
1. Toca **"Registrar Pago"**
2. Selecciona el jugador, el monto y el tipo (umpire o inscripción)
3. Toca **"Registrar Pago"**

El modal muestra el total pagado vs el objetivo por partido.

#### Finalizar Partido
1. Toca **"Finalizar Partido"**
2. Ingresa el marcador (carreras tu equipo / carreras oponente)
3. Toca **"Finalizar Partido"**

Los partidos finalizados muestran el resultado y actualizan las estadísticas W-L-D del equipo.

#### Compartir Alineación
Desde el modal de un partido finalizado puedes generar y compartir una imagen con la alineación del equipo.

---

## Mi Cuenta

![Mi Cuenta](docs/screenshots/05-mi-cuenta.png)

Accede desde el menú hamburguesa → **"Mi Cuenta"**.

Muestra:
- Correo electrónico registrado
- Fecha de registro y última actualización
- Estado de la cuenta

### Cambiar Contraseña

1. Ingresa tu contraseña actual
2. Ingresa la nueva contraseña (mínimo 6 caracteres)
3. Confírmala
4. Toca **"Cambiar Contraseña"**

> Después de cambiar la contraseña deberás iniciar sesión nuevamente.

---

## Consejos de Uso

1. **Selecciona siempre un equipo** en el menú hamburguesa antes de operar
2. **Registra asistencia antes que pagos** para mejor organización
3. **Finaliza los partidos** para que las estadísticas W-L-D se actualicen
4. **Usa los filtros** en Jugadores para encontrar rápidamente a alguien
5. **Revisa el Dashboard** para tener el estado general del equipo de un vistazo

---

## Solución de Problemas

| Problema | Solución |
|----------|----------|
| No puedo acceder | Verifica que tu cuenta haya sido aprobada por el administrador |
| No veo mis jugadores | Confirma que tienes el equipo correcto seleccionado en el menú |
| Error al guardar | Revisa que todos los campos obligatorios estén completos |
| No encuentro un jugador | Usa los filtros de búsqueda por nombre, número o posición |
| Los datos no se actualizan | Recarga la página; si persiste, cierra sesión y vuelve a entrar |

---

**Softball Team Manager v0.14.0**
