# Prettier Configuration

Este proyecto utiliza Prettier para mantener un formato de código consistente.

## Configuración

El proyecto incluye los siguientes archivos de configuración:

- `.prettierrc`: Configuración de Prettier
- `.prettierignore`: Archivos y directorios excluidos del formateo

## Scripts disponibles

### Formatear todo el código
```bash
npm run format
```

### Verificar formato sin cambiar archivos
```bash
npm run format:check
```

## Configuración actual

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "jsxSingleQuote": true,
  "quoteProps": "as-needed"
}
```

## Archivos excluidos

Los siguientes archivos y directorios están excluidos del formateo:

- `node_modules/`
- `dist/`
- `build/`
- Archivos de log
- Archivos de configuración del sistema
- Archivos de IDE
- `package-lock.json`

## Integración con ESLint

Prettier se ejecuta después de ESLint para asegurar que el código esté formateado correctamente.

## Recomendaciones

1. Ejecuta `npm run format` antes de hacer commit
2. Configura tu editor para formatear automáticamente con Prettier
3. Usa `npm run format:check` en CI/CD para verificar el formato
