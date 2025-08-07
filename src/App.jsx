import { useEffect } from 'react';
import { supabase } from './api/supabaseClient.js'; // Importamos nuestro cliente

function App() {

  useEffect(() => {
    // Esta función asíncrona se ejecutará cuando el componente se monte
    const verificarConexion = async () => {
      console.log("Intentando conectar con Supabase...");

      // Hacemos una consulta simple a la tabla 'jugadores'
      const { data, error } = await supabase
        .from('jugadores')
        .select('*');

      if (error) {
        // Si hay un error, lo mostramos en la consola
        console.error("❌ Error en la conexión o consulta:", error.message);
      } else {
        // Si todo sale bien, mostramos los datos (o un array vacío)
        console.log("✅ Conexión exitosa. Datos recibidos:", data);
      }
    };

    verificarConexion();
  }, []); // El array vacío asegura que solo se ejecute una vez

  return (
    <div className="App">
      <h1>Prueba de Conexión con Supabase</h1>
      <p>Revisa la consola de tu navegador para ver el resultado.</p>
    </div>
  );
}

export default App;