import React from 'react';
import { Link } from 'react-router-dom';
import { PenTool, Users, Database, Palette } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AdminPanel() {
  const { profile } = useAuth();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-serif font-bold text-historia-blue">Espace Éditeur & Administrateur</h1>
        <span className="bg-historia-blue text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
          Mode : {profile?.role || 'Admin (Démo)'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        
        {/* Card Éditeur de leçon */}
        <Link to="/admin/editor" className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 hover:border-historia-gold hover:shadow-xl transition-all group">
          <div className="w-14 h-14 bg-yellow-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <PenTool className="w-7 h-7 text-historia-gold" />
          </div>
          <h2 className="text-xl font-bold text-historia-blue mb-2">1. Leçons (Cours principal)</h2>
          <p className="text-slate-600">Accédez à l'éditeur de texte riche pour rédiger vos chapitres, ajouter des cartes et des images.</p>
        </Link>

        {/* Card Gestion des Quiz */}
        <Link to="/admin/quiz" className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 hover:border-historia-gold hover:shadow-xl transition-all group">
          <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Database className="w-7 h-7 text-blue-500" />
          </div>
          <h2 className="text-xl font-bold text-historia-blue mb-2">2. Quiz de Mémorisation</h2>
          <p className="text-slate-600">Sélectionnez un chapitre existant et ajoutez-y des questions à choix multiples avec leurs explications.</p>
        </Link>

        {/* Card Gestion des Annexes */}
        <Link to="/admin/annexes" className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 hover:border-historia-gold hover:shadow-xl transition-all group">
          <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Palette className="w-7 h-7 text-purple-500" />
          </div>
          <h2 className="text-xl font-bold text-historia-blue mb-2">3. Art</h2>
          <p className="text-slate-600">Enrichissez vos chapitres avec des œuvres d'art liées à l'époque : peintures, sculptures, architecture.</p>
        </Link>

        {/* Card Gestion Utilisateurs */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 hover:border-red-500 hover:shadow-xl transition-all cursor-pointer group">
          <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Users className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-historia-blue mb-2">4. Gestion des Utilisateurs</h2>
          <p className="text-slate-600">Réservé aux administrateurs : assignez des rôles (élève, éditeur, admin) ou supprimez des comptes.</p>
        </div>

      </div>
    </div>
  );
}
