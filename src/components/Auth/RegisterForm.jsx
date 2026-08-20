import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function RegisterForm({ toggleMode }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signUp(email, password, name);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Pour Supabase, si la confirmation par email est activée, on prévient l'utilisateur
      alert('Compte créé ! (Si vous avez activé la confirmation par email dans Supabase, veuillez vérifier votre boîte de réception)');
      navigate('/');
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
      <h2 className="text-3xl font-serif font-bold text-historia-blue mb-6 text-center">Inscription</h2>
      
      {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Nom / Pseudo</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-historia-gold outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-historia-gold outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-historia-gold outline-none"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-historia-blue hover:bg-slate-800 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50"
        >
          {loading ? 'Création...' : 'Créer mon compte'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-600">
        Déjà un compte ?{' '}
        <button onClick={toggleMode} className="text-historia-blue font-bold hover:underline">
          Se connecter
        </button>
      </div>
    </div>
  );
}
