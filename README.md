# Softball Team Manager

Una aplicación web moderna para la gestión completa de equipos de softball, desarrollada con React y Supabase.

**Versión Actual: 0.13.0**

## 🏟️ Características

### Gestión de Equipos

- Crear y administrar equipos de softball
- Asignar jugadores a equipos
- Gestionar información del equipo (nombre, categoría, etc.)
- **Nuevo**: Estadísticas automáticas de record (Victorias, Derrotas, Empates)

### Gestión de Jugadores

- Registro completo de jugadores
- Perfiles detallados con información personal y deportiva
- Historial de rendimiento y estadísticas
- Gestión de pagos y membresías
- **Nuevo**: Componentes modulares para mejor organización y mantenibilidad
- **Nuevo**: Filtros avanzados por nombre, número y posiciones
- **Nuevo**: Cálculo dinámico de meta de inscripción por equipo

### Programación de Partidos

- Crear y gestionar calendario de partidos
- Programar entrenamientos
- Notificaciones de eventos
- Vista de calendario interactiva
- **Nuevo**: Sistema de asistencia integrado
- **Nuevo**: Gestión de pagos por partido
- **Nuevo**: Finalización de partidos con resultados

### Panel de Administración

- Gestión de usuarios y permisos
- Configuraciones del sistema
- Reportes y estadísticas
- Control de acceso administrativo

### Sistema de Autenticación

- Registro e inicio de sesión seguro
- Protección de rutas
- Gestión de sesiones con Supabase
- **Nuevo**: Deshabilitación de auto-registro para mayor seguridad

### Interfaz de Usuario

- Modales optimizados con scroll interno y sin interferir con el scroll principal
- Footer de versión visible en todas las páginas principales
- Diseño responsivo y moderno con Tailwind CSS
- Componentes reutilizables y modulares
- **Nuevo**: Arquitectura modular mejorada con separación de páginas y componentes
- **Nuevo**: Cards clickeables con modales detallados
- **Nuevo**: Filtros y ordenamiento avanzados

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 19 + Vite
- **Estilos**: Tailwind CSS 4
- **Base de Datos**: Supabase
- **Autenticación**: Supabase Auth
- **Enrutamiento**: React Router DOM
- **Linting**: ESLint

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js (versión 18 o superior)
- npm o yarn
- Cuenta de Supabase

### Pasos de Instalación

1. **Clonar el repositorio**

   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd SoftballTeamManagerNew
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   Crear un archivo `.env` en la raíz del proyecto:

   ```env
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
   VITE_ADMIN_EMAIL=correo_electronico_del_administrador
   ```

4. **Ejecutar en modo desarrollo**

   ```bash
   npm run dev
   ```

5. **Construir para producción**
   ```bash
   npm run build
   ```

## 📁 Estructura del Proyecto

```
src/
├── pages/               # Páginas principales de la aplicación
│   ├── AdminPanel.jsx   # Panel de administración
│   ├── Dashboard.jsx    # Dashboard principal
│   ├── Players.jsx      # Gestión de jugadores (contenedor principal)
│   ├── Schedule.jsx     # Programación de partidos
│   ├── Signin.jsx       # Inicio de sesión
│   ├── Signup.jsx       # Registro de usuarios
│   └── Teams.jsx        # Gestión de equipos
├── components/          # Componentes reutilizables
│   ├── Menu.jsx         # Menú de navegación
│   ├── ProtectedRoute.jsx # Ruta protegida
│   ├── PlayerFilters.jsx # Filtros de jugadores
│   ├── Layout.jsx       # Layout principal
│   ├── Cards/           # Tarjetas individuales
│   │   ├── PlayerCard.jsx # Tarjeta individual de jugador
│   │   ├── DashboardCard.jsx # Tarjeta individual del dashboard
│   │   ├── ScheduleCard.jsx # Tarjeta individual de partido
│   │   └── TeamCard.jsx # Tarjeta individual de equipo
│   ├── CardGrids/       # Grids de tarjetas
│   │   ├── PlayerCardsGrid.jsx # Grid de tarjetas de jugadores
│   │   ├── DashboardCardsGrid.jsx # Grid de tarjetas del dashboard
│   │   ├── ScheduleCardsGrid.jsx # Grid de tarjetas de partidos
│   │   └── TeamCardsGrid.jsx # Grid de tarjetas de equipos
│   ├── Forms/           # Formularios
│   │   ├── PlayerForm.jsx # Formulario de jugador
│   │   ├── ScheduleForm.jsx # Formulario de creación/edición de partidos
│   │   ├── TeamForm.jsx # Formulario de creación/edición de equipos
│   │   └── PaymentForm.jsx # Formulario de pagos
│   ├── Modals/          # Modales
│   │   ├── PlayerHistoryModal.jsx # Modal de historial de jugador
│   │   ├── ScheduleHistoryModal.jsx # Modal de detalles del partido
│   │   └── TeamHistoryModal.jsx # Modal de detalles del equipo
│   └── Widgets/         # Widgets especializados
│       ├── PaymentStatusWidget.jsx # Widget de estado de pagos
│       └── README.md # Documentación de widgets
├── hooks/               # Hooks personalizados
│   └── useModal.js      # Hook para manejo de modales
├── context/             # Contextos de React
│   ├── AuthContext.jsx  # Contexto de autenticación
│   ├── TeamContext.jsx  # Contexto de equipos
│   └── useTeam.js       # Hook personalizado para equipos
├── App.jsx              # Componente principal
├── main.jsx             # Punto de entrada
├── router.jsx           # Configuración de rutas
├── supabaseClient.js    # Cliente de Supabase
└── version.js           # Configuración de versión
```

## 🔧 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción
- `npm run lint` - Ejecuta el linter para verificar el código

## 🔐 Configuración de Supabase

1. Crear un proyecto en [Supabase](https://supabase.com)
2. Configurar las tablas necesarias en la base de datos
3. Configurar autenticación y políticas de seguridad
4. **Importante**: Deshabilitar el auto-registro para mayor seguridad
5. Obtener las credenciales de la API y agregarlas al archivo `.env`

### Estructura de Base de Datos

La aplicación requiere las siguientes tablas principales:

- `equipos` - Información de equipos
- `jugadores` - Información de jugadores
- `partidos` - Programación de partidos
- `asistencia_partidos` - Control de asistencia
- `pagos` - Gestión de pagos
- `posiciones` - Posiciones de béisbol/softball
- `jugador_posiciones` - Relación jugador-posiciones

## 📖 Documentación

### Manual de Usuario

Para instrucciones detalladas sobre cómo usar la aplicación, consulta el **[Manual de Usuario](MANUAL_USUARIO.md)** que incluye:

- 🔐 **Acceso al Sistema**: Registro e inicio de sesión
- 📋 **Flujo de Trabajo Completo**: 6 pasos principales para gestionar un equipo
- 📊 **Dashboard y Reportes**: Información disponible y navegación
- 🔧 **Funciones Adicionales**: Gestión de posiciones, historiales y múltiples equipos
- ⚠️ **Notas Importantes**: Seguridad, funcionalidades y consejos de uso
- 🆘 **Soporte**: Solución de problemas comunes

### Documentación Técnica

Para más información sobre el proyecto, consulta los archivos de documentación incluidos.

## 📝 Notas de Desarrollo

- La aplicación utiliza React 19 con las últimas características
- Tailwind CSS 4 para estilos modernos y responsivos
- Supabase para backend como servicio (BaaS)
- Sistema de rutas protegidas para seguridad
- **Nuevo**: Arquitectura modular mejorada con separación clara entre páginas y componentes
- **Nuevo**: Componentes de jugadores, dashboard, schedule y teams modularizados para mejor mantenibilidad
- Modales optimizados con hook personalizado `useModal`
- Menu footer de versión consistente
- **Nuevo**: Sistema de filtros y ordenamiento avanzado
- **Nuevo**: Cálculo dinámico de metas de inscripción por equipo
- **Nuevo**: Gestión completa de asistencia y pagos por partido

## 🆕 Changelog

### Versión 0.13.0

- ✅ **Correcciones de Errores:**
  - Corregido error 400 en consulta a tabla `equipos` (columna `total_inscripcion` → `inscripcion`)
  - Eliminados todos los logs de debugging de `Players.jsx` y `Schedule.jsx`
  - Optimizado manejo de errores sin mostrar información sensible en consola
  - Mejorada estabilidad general de la aplicación

- ✅ **Mejoras de Seguridad:**
  - Deshabilitado auto-registro de usuarios para mayor control
  - Implementada aprobación manual de usuarios por administrador
  - Mejorado sistema de autenticación y autorización

- ✅ **Optimizaciones de Rendimiento:**
  - Eliminados console.log y console.error innecesarios
  - Mejorado manejo de errores con comentarios informativos
  - Optimizadas consultas a base de datos

### Versión 0.12.0

- ✅ **Reorganización de Estructura de Componentes:**
  - Creadas subcarpetas organizativas en `src/components/`:
    - `Cards/` - Tarjetas individuales (PlayerCard, DashboardCard, ScheduleCard, TeamCard)
    - `CardGrids/` - Grids de tarjetas (PlayerCardsGrid, DashboardCardsGrid, ScheduleCardsGrid, TeamCardsGrid)
    - `Forms/` - Formularios (PlayerForm, ScheduleForm, TeamForm, PaymentForm)
    - `Modals/` - Modales (PlayerHistoryModal, ScheduleHistoryModal, TeamHistoryModal)
    - `Widgets/` - Widgets especializados (PaymentStatusWidget)
  - Actualizados todos los imports para reflejar la nueva estructura
  - Mejorada la organización y escalabilidad del proyecto
  - Componentes agrupados por funcionalidad para mejor mantenibilidad

### Versión 0.11.0

- ✅ **Modularización de Teams:**
  - Separado `Teams.jsx` en componentes modulares más pequeños y reutilizables:
    - `TeamCard.jsx` - Tarjeta individual de equipo
    - `TeamCardsGrid.jsx` - Grid de tarjetas de equipos
    - `TeamForm.jsx` - Formulario de creación/edición de equipos
    - `TeamHistoryModal.jsx` - Modal de detalles del equipo
  - Mejorada la mantenibilidad y legibilidad del código
  - Componentes más enfocados y con responsabilidades específicas
  - **Nuevo**: Cards clickeables sin menú de acciones, botones de editar/eliminar en el modal
  - **Mejorado**: Diseño visual de las cards con mejor organización y estadísticas W-L-D
  - **Agregado**: Información detallada de record (Victorias, Derrotas, Empates) en el modal
  - **Implementado**: Cálculo automático de estadísticas W-L-D basado en partidos finalizados

### Versión 0.10.0

- ✅ **Reorganización de Estructura del Proyecto:**
  - Creada carpeta `src/pages/` para páginas principales de la aplicación
  - Movidas todas las páginas principales desde `src/components/` a `src/pages/`
  - Actualizados todos los imports para reflejar la nueva estructura
  - Mejorada la organización y escalabilidad del proyecto

- ✅ **Modularización de la Sección de Jugadores:**
  - Separado `Players.jsx` en componentes modulares más pequeños y reutilizables:
    - `PlayerCard.jsx` - Tarjeta individual de jugador
    - `PlayerCardsGrid.jsx` - Grid de tarjetas de jugadores
    - `PlayerForm.jsx` - Formulario de jugador
    - `PlayerFilters.jsx` - Filtros de jugadores
    - `PlayerHistoryModal.jsx` - Modal de historial de jugador

- ✅ **Modularización del Dashboard:**
  - Separado `Dashboard.jsx` en componentes modulares más pequeños y reutilizables:
    - `DashboardCard.jsx` - Tarjeta individual del dashboard
    - `DashboardCardsGrid.jsx` - Grid de tarjetas del dashboard
    - `PlayerHistoryModal.jsx` - Modal de historial de jugador
  - Mejorada la mantenibilidad y legibilidad del código
  - Componentes más enfocados y con responsabilidades específicas

- ✅ **Modularización de Schedule:**
  - Separado `Schedule.jsx` en componentes modulares más pequeños y reutilizables:
    - `ScheduleCard.jsx` - Tarjeta individual de partido
    - `ScheduleCardsGrid.jsx` - Grid de tarjetas de partidos
    - `ScheduleForm.jsx` - Formulario de creación/edición de partidos
    - `ScheduleHistoryModal.jsx` - Modal de detalles del partido
  - Mejorada la mantenibilidad y legibilidad del código
  - Componentes más enfocados y con responsabilidades específicas

- ✅ **Mejoras en la Arquitectura:**
  - Separación clara entre páginas (vistas principales) y componentes reutilizables
  - Mejor organización del código para facilitar el desarrollo futuro
  - Imports actualizados en todo el proyecto para mantener la funcionalidad

### Versión 0.8.0

- ✅ **Nuevas Funcionalidades:**
  - Agregado componente `VersionFooter` que muestra el número de versión en todas las páginas
  - Implementado hook personalizado `useModal` para gestión mejorada de modales
  - Optimización de modales con scroll interno y eliminación del scroll principal
  - Modales con altura del 90% del viewport y centrados en pantalla

- ✅ **Mejoras en UI/UX:**
  - Estructura consistente de modales con `modal-container`, `modal-header` y `modal-content`
  - Mejor experiencia de usuario en dispositivos móviles
  - Footer de versión fijo en la parte inferior de todas las páginas principales

- ✅ **Componentes Actualizados:**
  - `Dashboard.jsx` - Agregado footer de versión
  - `Teams.jsx` - Agregado footer de versión
  - `Players.jsx` - Agregado footer de versión y modal optimizado
  - `Schedule.jsx` - Agregado footer de versión y modales optimizados
  - `AdminPanel.jsx` - Agregado footer de versión
  - `Signin.jsx` - Agregado footer de versión
  - `Signup.jsx` - Agregado footer de versión
  - `PaymentForm.jsx` - Modal optimizado (sin footer por ser modal)

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas sobre la aplicación, contacta al equipo de desarrollo.

## 🔧 Solución de Problemas

### Error 400 en consultas a Supabase
- Verificar que las columnas referenciadas en las consultas existan en la base de datos
- Asegurar que los nombres de las columnas coincidan exactamente con la estructura de la base de datos
- Revisar las políticas de seguridad de Supabase para las tablas correspondientes

### Problemas de Autenticación
- Verificar que las variables de entorno estén configuradas correctamente
- Asegurar que el auto-registro esté deshabilitado si se requiere aprobación manual
- Revisar las políticas de autenticación en Supabase

### Problemas de Rendimiento
- Los logs de debugging han sido eliminados para mejorar el rendimiento
- Verificar que las consultas a la base de datos estén optimizadas
- Revisar el uso de memoria en componentes grandes
