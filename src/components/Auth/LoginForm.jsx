import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginForm({ toggleMode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/admin'); // Rediriger vers l'espace admin/cours après connexion
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
      <h2 className="text-3xl font-serif font-bold text-historia-blue mb-6 text-center">Connexion</h2>
      
      {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
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
          className="w-full bg-historia-gold hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-600">
        Pas encore de compte ?{' '}
        <button onClick={toggleMode} className="text-historia-gold font-bold hover:underline">
          Créer un compte
        </button>
      </div>
    </div>
  );
}
