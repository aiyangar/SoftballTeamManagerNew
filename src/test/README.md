# Pruebas de Integración - Softball Team Manager

Este directorio contiene las pruebas de integración para la aplicación de gestión de equipos de softball.

## Estructura de Pruebas

```
src/test/
├── setup.js                    # Configuración global de pruebas
├── integration/                # Pruebas de integración
│   ├── AuthContext.test.jsx    # Pruebas del contexto de autenticación
│   ├── AutoNavigator.test.jsx  # Pruebas de navegación automática
│   ├── ProtectedRoute.test.jsx # Pruebas de rutas protegidas
│   ├── Router.test.jsx         # Pruebas del sistema de rutas
│   ├── Forms.test.jsx          # Pruebas de formularios
│   ├── EndToEnd.test.jsx       # Pruebas end-to-end
│   └── index.test.jsx          # Índice de todas las pruebas
└── README.md                   # Este archivo
```

## Tipos de Pruebas

### 1. Pruebas de Contexto de Autenticación (`AuthContext.test.jsx`)
- Verificación del estado de carga inicial
- Manejo de sesiones autenticadas y no autenticadas
- Manejo de errores de autenticación
- Funciones de signin, signup y signout

### 2. Pruebas de Navegación Automática (`AutoNavigator.test.jsx`)
- Comportamiento durante el estado de carga
- Redirección al dashboard cuando está autenticado
- Redirección al signin cuando no está autenticado
- Manejo de errores de autenticación
- Limpieza de suscripciones

### 3. Pruebas de Rutas Protegidas (`ProtectedRoute.test.jsx`)
- Verificación de autenticación antes de mostrar contenido
- Redirección al signin cuando no está autenticado
- Renderizado de contenido cuando está autenticado
- Manejo de múltiples elementos hijos

### 4. Pruebas del Sistema de Rutas (`Router.test.jsx`)
- Renderizado de rutas públicas
- Protección de rutas privadas
- Navegación entre diferentes páginas
- Manejo de rutas específicas (equipos, jugadores, calendario, etc.)

### 5. Pruebas de Formularios (`Forms.test.jsx`)
- Validación de campos requeridos
- Validación de formatos (email, números)
- Renderizado correcto de todos los formularios
- Envío exitoso con datos válidos

### 6. Pruebas End-to-End (`EndToEnd.test.jsx`)
- Flujos completos de autenticación
- Navegación entre páginas
- Gestión de datos
- Cierre de sesión
- Manejo de errores

## Comandos de Ejecución

### Ejecutar todas las pruebas
```bash
npm test
```

### Ejecutar solo pruebas de integración
```bash
npm test src/test/integration
```

### Ejecutar pruebas con interfaz visual
```bash
npm run test:ui
```

### Ejecutar pruebas con cobertura
```bash
npm run test:coverage
```

### Ejecutar pruebas en modo watch
```bash
npm test -- --watch
```

## Configuración

### Dependencias de Pruebas
- `@testing-library/react`: Utilidades para probar componentes React
- `@testing-library/jest-dom`: Matchers adicionales para Jest
- `@testing-library/user-event`: Simulación de eventos de usuario
- `vitest`: Framework de pruebas
- `jsdom`: Entorno DOM para pruebas

### Mocks Configurados
- **Supabase**: Mock completo del cliente de Supabase
- **React Router**: Mock de funciones de navegación
- **Componentes de Página**: Mocks simplificados para pruebas de integración

## Cobertura de Pruebas

Las pruebas de integración cubren:

- ✅ Autenticación y autorización
- ✅ Navegación y enrutamiento
- ✅ Formularios y validación
- ✅ Manejo de errores
- ✅ Flujos completos de usuario
- ✅ Integración entre componentes
- ✅ Contextos de React

## Mejores Prácticas

1. **Aislamiento**: Cada prueba es independiente y no depende de otras
2. **Mocks**: Uso de mocks para servicios externos (Supabase)
3. **Cleanup**: Limpieza automática de mocks entre pruebas
4. **Descriptivos**: Nombres de pruebas claros y descriptivos
5. **Cobertura**: Pruebas tanto de casos exitosos como de errores

## Debugging

Para debuggear las pruebas:

1. Usar `console.log` en las pruebas
2. Ejecutar con `--reporter=verbose` para más detalles
3. Usar `debugger` en el código de las pruebas
4. Revisar los mocks si hay problemas de integración

## Contribución

Al agregar nuevas funcionalidades:

1. Crear pruebas de integración correspondientes
2. Mantener la cobertura de pruebas alta
3. Seguir las convenciones de nomenclatura
4. Documentar nuevos casos de prueba
