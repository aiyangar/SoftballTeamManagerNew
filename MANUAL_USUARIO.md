# 📖 Manual de Usuario - Softball Team Manager

**Versión:** 0.8.0  
**Fecha:** Diciembre 2024

---

## 🎯 Introducción

El **Softball Team Manager** es una aplicación web moderna diseñada para la gestión completa de equipos de softball. Esta herramienta permite administrar jugadores, programar partidos, registrar asistencia, gestionar pagos y hacer seguimiento del rendimiento del equipo.

### 🚀 Características Principales

- ✅ **Gestión de Equipos**: Crear y administrar múltiples equipos
- ✅ **Gestión de Jugadores**: Registrar jugadores con información detallada
- ✅ **Programación de Partidos**: Crear y gestionar calendario de juegos
- ✅ **Control de Asistencia**: Registrar asistencia de jugadores a partidos
- ✅ **Gestión de Pagos**: Administrar pagos de umpire e inscripción
- ✅ **Dashboard Informativo**: Vista general del estado del equipo
- ✅ **Historial de Jugadores**: Seguimiento completo de participación y pagos

---

## 🔐 Acceso al Sistema

### Registro de Usuario
1. Accede a la aplicación en tu navegador
2. Haz clic en **"Registrarse"** en la página de inicio
3. Completa el formulario con tu información:
   - **Correo electrónico** (obligatorio)
   - **Contraseña** (mínimo 6 caracteres)
4. Haz clic en **"Crear cuenta"**
5. **Importante**: Tu cuenta debe ser aprobada por el administrador antes de poder acceder

### Inicio de Sesión
1. Ve a la página de **"Iniciar Sesión"**
2. Ingresa tu correo electrónico y contraseña
3. Haz clic en **"Iniciar Sesión"**
4. Una vez autenticado, serás redirigido al Dashboard

---

## 📋 Flujo de Trabajo Completo

### **Paso 1: Crear un Equipo Nuevo**

#### 1.1 Acceder a Gestión de Equipos
- Desde el Dashboard, haz clic en **"Gestión de Equipos"** en el menú
- O navega directamente a `/teams`

#### 1.2 Crear Nuevo Equipo
1. Haz clic en el botón **"Agregar Equipo"**
2. Completa el formulario:
   - **Nombre del Equipo** (obligatorio): Ej. "Los Tigres"
   - **Costo de Inscripción** (opcional): Monto total para el torneo
3. Haz clic en **"Crear Equipo"**

#### 1.3 Seleccionar Equipo para Trabajar
- Una vez creado, el equipo aparecerá en la lista
- Haz clic en el **selector de equipo** en la parte superior para activarlo
- El equipo seleccionado será el que uses para todas las operaciones

---

### **Paso 2: Crear los Jugadores**

#### 2.1 Acceder a Gestión de Jugadores
- Desde el Dashboard, haz clic en **"Gestión de Jugadores"**
- O navega a `/players`

#### 2.2 Registrar Nuevo Jugador
1. Haz clic en **"Agregar Jugador"**
2. Completa la información:
   - **Nombre completo** (obligatorio)
   - **Número de camiseta** (opcional)
   - **Teléfono** (opcional)
   - **Correo electrónico** (opcional)
   - **Posiciones** (máximo 3): Selecciona de la lista disponible
3. Haz clic en **"Crear Jugador"**

#### 2.3 Gestionar Jugadores Existentes
- **Ver lista**: Todos los jugadores aparecen en una tabla
- **Editar**: Haz clic en el menú de acciones (⋮) y selecciona "Editar"
- **Eliminar**: Usa el menú de acciones y selecciona "Eliminar"
- **Ver historial**: Haz clic en "Ver Historial" para ver asistencia y pagos

---

### **Paso 3: Crear los Partidos**

#### 3.1 Acceder a Gestión de Partidos
- Desde el Dashboard, haz clic en **"Gestión de Partidos"**
- O navega a `/schedule`

#### 3.2 Programar Nuevo Partido
1. Haz clic en **"Agregar Partido"**
2. Completa la información:
   - **Equipo Contrario** (obligatorio): Nombre del equipo rival
   - **Fecha del Partido** (obligatorio): Selecciona la fecha
   - **Lugar** (obligatorio): Campo o ubicación del partido
   - **Pago al Umpire** (obligatorio): Monto a pagar al árbitro
3. Haz clic en **"Registrar Partido"**

#### 3.3 Gestionar Partidos Existentes
- **Ver lista**: Todos los partidos aparecen ordenados por fecha
- **Editar**: Usa el menú de acciones para modificar detalles
- **Eliminar**: Elimina partidos que no se realizarán

---

### **Paso 4: Marcar Asistencia**

#### 4.1 Registrar Asistencia de Jugadores
1. En la lista de partidos, busca el partido correspondiente
2. Haz clic en el menú de acciones (⋮) del partido
3. Selecciona **"Marcar Asistencia"**
4. En el formulario que aparece:
   - Marca las casillas de los jugadores que asistirán
   - Desmarca los que no asistirán
5. Haz clic en **"Guardar Asistencia"**

#### 4.2 Actualizar Asistencia
- Si necesitas modificar la asistencia:
  1. Haz clic en **"Marcar Asistencia"** nuevamente
  2. Modifica las selecciones según sea necesario
  3. Guarda los cambios

---

### **Paso 5: Registrar Pagos**

#### 5.1 Acceder al Formulario de Pagos
1. En la lista de partidos, busca el partido correspondiente
2. Haz clic en el menú de acciones (⋮)
3. Selecciona **"Registrar Pago"**

#### 5.2 Registrar Pago de Umpire
1. En el formulario de pagos:
   - Selecciona el **jugador** que realizó el pago
   - Ingresa el **monto del umpire** pagado
   - Selecciona el **método de pago** (Efectivo, Transferencia, etc.)
2. Haz clic en **"Registrar Pago"**

#### 5.3 Registrar Pago de Inscripción
1. En el mismo formulario:
   - Selecciona el **jugador** que realizó el pago
   - Ingresa el **monto de inscripción** pagado
   - Selecciona el **método de pago**
2. Haz clic en **"Registrar Pago"**

#### 5.4 Ver Totales de Pagos
- El sistema muestra automáticamente:
  - Total pagado de umpire
  - Total pagado de inscripción
  - Monto objetivo de umpire por partido
  - Estado de pagos por jugador

---

### **Paso 6: Finalizar Partido**

#### 6.1 Registrar Resultado del Partido
1. En la lista de partidos, busca el partido a finalizar
2. Haz clic en el menú de acciones (⋮)
3. Selecciona **"Finalizar Partido"**
4. En el formulario:
   - Ingresa las **carreras de tu equipo**
   - Ingresa las **carreras del equipo contrario**
5. Haz clic en **"Finalizar Partido"**

#### 6.2 Ver Detalles del Partido
- Una vez finalizado, puedes:
  1. Hacer clic en **"Ver Detalles"** en el menú de acciones
  2. Ver información completa:
     - Asistencia registrada
     - Pagos realizados
     - Resultado del partido
     - Estadísticas

---

## 📊 Dashboard y Reportes

### Información Disponible en el Dashboard
- **Total de Jugadores**: Número de jugadores registrados
- **Próximo Juego**: Detalles del próximo partido programado
- **Total Pagado Registro**: Estado de pagos de inscripción
- **Último Partido**: Resultado del último partido jugado
- **Estadísticas del Equipo**: Victorias, derrotas y empates
- **Top Contribuyentes**: Jugadores que más han pagado
- **Top Asistencia**: Jugadores con mejor asistencia

### Navegación Rápida
- **Dashboard**: Vista general del equipo
- **Gestión de Equipos**: Administrar equipos
- **Gestión de Jugadores**: Gestionar jugadores
- **Gestión de Partidos**: Programar y gestionar partidos
- **Panel de Administración**: Funciones administrativas

---

## 🔧 Funciones Adicionales

### Gestión de Posiciones
- Los jugadores pueden seleccionar hasta **3 posiciones**
- Las posiciones disponibles incluyen: Pitcher, Catcher, Primera Base, etc.
- Se pueden editar las posiciones en cualquier momento

### Historial de Jugadores
- **Asistencia**: Registro completo de asistencia a partidos
- **Pagos**: Historial de todos los pagos realizados
- **Estadísticas**: Resumen de participación

### Gestión de Múltiples Equipos
- Puedes crear y gestionar **múltiples equipos**
- Cambia entre equipos usando el selector en la parte superior
- Cada equipo mantiene su información independiente

---

## ⚠️ Notas Importantes

### Seguridad
- **Autenticación requerida**: Debes iniciar sesión para acceder
- **Aprobación de cuenta**: Tu cuenta debe ser aprobada por el administrador
- **Datos seguros**: Toda la información se almacena de forma segura

### Funcionalidades del Sistema
- **Modales optimizados**: Los formularios aparecen en ventanas modales sin afectar la navegación
- **Scroll interno**: Los modales tienen su propio scroll para mejor usabilidad
- **Responsive**: La aplicación funciona en dispositivos móviles y de escritorio
- **Versión**: El número de versión (0.8.0) se muestra en el pie de página

### Consejos de Uso
1. **Selecciona siempre un equipo** antes de trabajar con jugadores o partidos
2. **Registra la asistencia** antes de registrar pagos para mejor organización
3. **Finaliza los partidos** después de registrar todos los datos
4. **Revisa el Dashboard** regularmente para mantener un seguimiento del equipo

---

## 🆘 Soporte

### Problemas Comunes
- **No puedo acceder**: Verifica que tu cuenta haya sido aprobada
- **No veo mi equipo**: Asegúrate de haber seleccionado un equipo en el selector
- **Error al guardar**: Verifica que todos los campos obligatorios estén completos

### Contacto
Para soporte técnico o preguntas sobre el sistema, contacta al administrador del sistema.

---

**Softball Team Manager v0.8.0** - Desarrollado para la gestión eficiente de equipos de softball.
