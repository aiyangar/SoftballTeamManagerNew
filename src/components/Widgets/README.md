# Widgets Reutilizables

## PaymentStatusWidget

Widget reutilizable para mostrar el estado de pagos en diferentes partes de la aplicación.

### Props

| Prop            | Tipo      | Default    | Descripción                                                     |
| --------------- | --------- | ---------- | --------------------------------------------------------------- |
| `paymentTotals` | `Object`  | `{}`       | Objeto con totales de pagos `{ totalUmpire, totalInscripcion }` |
| `umpireTarget`  | `number`  | `550`      | Objetivo del umpire                                             |
| `size`          | `string`  | `'medium'` | Tamaño del widget: `'small'`, `'medium'`, `'large'`             |
| `showTitle`     | `boolean` | `true`     | Si mostrar el título "Estado de Pagos"                          |
| `className`     | `string`  | `''`       | Clases CSS adicionales                                          |

### Ejemplos de Uso

#### Tamaño pequeño (para tarjetas)

```jsx
<PaymentStatusWidget
  paymentTotals={paymentTotals[game.id]}
  umpireTarget={game.umpire || 550}
  size='small'
  showTitle={true}
  className='text-center'
/>
```

#### Tamaño mediano (para formularios)

```jsx
<PaymentStatusWidget
  paymentTotals={paymentTotals}
  umpireTarget={paymentTotals.umpireTarget}
  size='medium'
  showTitle={true}
/>
```

#### Tamaño grande (para modales)

```jsx
<PaymentStatusWidget
  paymentTotals={paymentTotals[selectedGame.id]}
  umpireTarget={selectedGame.umpire || 550}
  size='large'
  showTitle={true}
/>
```

#### Sin título (para dashboards)

```jsx
<PaymentStatusWidget
  paymentTotals={paymentTotals}
  umpireTarget={550}
  size='small'
  showTitle={false}
  className='bg-transparent'
/>
```

### Características

- **Responsive**: Se adapta a diferentes tamaños de pantalla
- **Colores dinámicos**: El progreso del umpire cambia de color según el porcentaje alcanzado
- **Formato de números**: Los montos se formatean automáticamente con separadores de miles
- **Animaciones**: Transiciones suaves en la barra de progreso
- **Personalizable**: Múltiples opciones de configuración

### Lugares donde se usa actualmente

1. **ScheduleCard** - Tamaño pequeño para mostrar en tarjetas de partidos
2. **PaymentForm** - Tamaño mediano en el formulario de pagos
3. **ScheduleHistoryModal** - Tamaño grande en el modal de detalles
4. **Dashboard** - Tamaño pequeño sin título para mostrar resumen

### Estructura de datos esperada

```javascript
const paymentTotals = {
  totalUmpire: 300, // Total recaudado para umpire
  totalInscripcion: 150, // Total recaudado para inscripción
};
```
