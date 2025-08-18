# Softball Team Manager

Una aplicación web moderna para la gestión completa de equipos de softball, desarrollada con React y Supabase.

## 🏟️ Características

### Gestión de Equipos
- Crear y administrar equipos de softball
- Asignar jugadores a equipos
- Gestionar información del equipo (nombre, categoría, etc.)

### Gestión de Jugadores
- Registro completo de jugadores
- Perfiles detallados con información personal y deportiva
- Historial de rendimiento y estadísticas
- Gestión de pagos y membresías

### Programación de Partidos
- Crear y gestionar calendario de partidos
- Programar entrenamientos
- Notificaciones de eventos
- Vista de calendario interactiva

### Panel de Administración
- Gestión de usuarios y permisos
- Configuraciones del sistema
- Reportes y estadísticas
- Control de acceso administrativo

### Sistema de Autenticación
- Registro e inicio de sesión seguro
- Protección de rutas
- Gestión de sesiones con Supabase

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
├── components/          # Componentes de React
│   ├── AdminPanel.jsx   # Panel de administración
│   ├── Dashboard.jsx    # Dashboard principal
│   ├── Menu.jsx         # Menú de navegación
│   ├── PaymentForm.jsx  # Formulario de pagos
│   ├── Players.jsx      # Gestión de jugadores
│   ├── ProtectedRoute.jsx # Ruta protegida
│   ├── Schedule.jsx     # Programación de partidos
│   ├── Signin.jsx       # Inicio de sesión
│   ├── Signup.jsx       # Registro de usuarios
│   └── Teams.jsx        # Gestión de equipos
├── context/             # Contextos de React
│   ├── AuthContext.jsx  # Contexto de autenticación
│   └── TeamContext.jsx  # Contexto de equipos
├── App.jsx              # Componente principal
├── main.jsx             # Punto de entrada
├── router.jsx           # Configuración de rutas
└── supabaseClient.js    # Cliente de Supabase
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
4. Obtener las credenciales de la API y agregarlas al archivo `.env`

## 📝 Notas de Desarrollo

- La aplicación utiliza React 19 con las últimas características
- Tailwind CSS 4 para estilos modernos y responsivos
- Supabase para backend como servicio (BaaS)
- Sistema de rutas protegidas para seguridad
- Componentes modulares y reutilizables

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
