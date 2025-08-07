# Configuración de Supabase

## Pasos para configurar Supabase en tu proyecto:

### 1. Crear un proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Espera a que se complete la configuración

### 2. Obtener las credenciales
1. En tu proyecto de Supabase, ve a **Settings** > **API**
2. Copia la **Project URL** y la **anon public** key

### 3. Configurar las variables de entorno
1. Renombra el archivo `env.local` a `.env.local`
2. Reemplaza los valores en `.env.local`:
   ```
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
   ```

### 4. Verificar la conexión
Puedes usar la función `testSupabaseConnection()` en tu código para verificar que la conexión funciona:

```javascript
import { testSupabaseConnection } from './src/api/supabaseClient.js';

// En tu componente o función
testSupabaseConnection().then(isConnected => {
  if (isConnected) {
    console.log('Supabase está configurado correctamente');
  }
});
```

### 5. Crear tablas en Supabase
Ve a **Table Editor** en tu proyecto de Supabase y crea las tablas que necesites para tu aplicación.

### Notas importantes:
- El archivo `.env.local` no se sube a Git (está en .gitignore)
- Nunca compartas tus claves de Supabase
- Para producción, usa las variables de entorno de tu plataforma de hosting
