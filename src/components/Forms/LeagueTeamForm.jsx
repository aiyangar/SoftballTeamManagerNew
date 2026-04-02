import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../../supabaseClient';
import { UserAuth } from '../../context/AuthContext';

const LeagueTeamForm = ({ onSaved }) => {
  const { session } = UserAuth() || {};
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setLoading(true);
    const { error } = await supabase
      .from('equipos_liga')
      .insert([{ nombre: nombre.trim(), user_id: session.user.id }]);
    setLoading(false);
    if (error) {
      toast.error('Error al agregar equipo: ' + error.message);
    } else {
      setNombre('');
      onSaved();
    }
  };

  return (
    <form onSubmit={handleSubmit} className='flex gap-2 mt-4'>
      <input
        type='text'
        value={nombre}
        onChange={e => setNombre(e.target.value)}
        placeholder='Nombre del equipo rival'
        className='flex-1 p-2 border border-gray-600 rounded-md bg-gray-800 text-white text-sm'
        required
      />
      <button
        type='submit'
        disabled={loading}
        className='btn btn-primary text-sm'
      >
        {loading ? 'Guardando...' : 'Agregar'}
      </button>
    </form>
  );
};

export default LeagueTeamForm;
