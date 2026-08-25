import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, User, LogOut, Menu, X, Compass, PlayCircle, Settings, Home, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const [lastChapter, setLastChapter] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const chapterId = localStorage.getItem('historia_last_chapter');
    setLastChapter(chapterId);
    // Fermer le menu mobile lors d'un changement de route
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <>
      <nav className="bg-historia-blue text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center relative w-full">
            {/* Menu hamburger à gauche (Mobile uniquement) */}
            <button 
              className="md:hidden p-1 text-historia-gold"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-8 w-8" />
            </button>

            {/* Logo centré sur mobile, à gauche sur Desktop */}
            <div className="absolute left-1/2 -translate-x-1/2 md:static md:transform-none flex items-center">
              <Link to="/" className="flex items-center space-x-3 group">
                <img 
                  src="/favicon.svg" 
                  alt="Historia Logo" 
                  className="h-9 w-9 rounded-xl shadow-md group-hover:scale-105 transition-transform" 
                />
                <span className="font-serif text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-500">
                  Historia
                </span>
              </Link>
            </div>
            
            {/* Nav Desktop (cachée sur mobile, repoussée à droite) */}
            <div className="hidden md:flex items-center space-x-6 ml-auto">
              <Link to="/courses" className="hover:text-historia-gold transition-colors font-bold tracking-wide">Époques</Link>
              
              {lastChapter && (
                <Link to={`/lesson/${lastChapter}`} className="text-historia-gold hover:text-yellow-300 transition-colors font-bold tracking-wide flex items-center">
                  Continuer <span className="ml-1 text-lg leading-none">→</span>
                </Link>
              )}
              
              {(profile?.role === 'admin' || profile?.role === 'editeur') && (
                <Link to="/admin" className="hover:text-historia-gold transition-colors font-bold tracking-wide">Admin</Link>
              )}

              {user ? (
                <div className="flex items-center space-x-4 ml-4 border-l border-slate-600 pl-4">
                  <div className="flex items-center space-x-2 text-slate-300">
                    <User className="h-5 w-5" />
                    <span className="font-bold text-white">{profile?.name || user.email.split('@')[0]}</span>
                  </div>
                  <button onClick={signOut} className="text-slate-400 hover:text-red-400 transition-colors" title="Se déconnecter">
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <Link to="/auth" className="bg-historia-gold text-historia-blue font-bold px-4 py-2 rounded hover:bg-yellow-500 transition-colors">
                  Connexion
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Menu Mobile (Tiroir) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex md:hidden">
          {/* Backdrop sombre avec flou */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          
          {/* Panneau latéral (blanc, glisse de la gauche) */}
          <div className="relative w-[85%] max-w-sm bg-white h-full flex flex-col shadow-2xl animate-fade-in-left">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
               <div className="flex items-center space-x-3 text-historia-blue">
                 <img src="/favicon.svg" alt="Historia Logo" className="h-8 w-8 rounded-lg shadow-sm" />
                 <span className="font-serif text-2xl font-bold tracking-wider">Historia</span>
               </div>
               <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-slate-800 p-1">
                 <X className="w-6 h-6" />
               </button>
            </div>
            
            <div className="flex flex-col py-4 px-4 overflow-y-auto space-y-1">
              
              <Link to="/" className={`flex items-center space-x-4 p-4 rounded-xl font-bold transition-colors ${location.pathname === '/' ? 'bg-slate-100 text-historia-blue' : 'text-slate-600 hover:bg-slate-50'}`}>
                 <Home className={`w-6 h-6 ${location.pathname === '/' ? 'text-historia-blue' : 'text-slate-400'}`} />
                 <span>Accueil</span>
              </Link>

              <Link to="/courses" className={`flex items-center space-x-4 p-4 rounded-xl font-bold transition-colors ${location.pathname === '/courses' ? 'bg-slate-100 text-historia-blue' : 'text-slate-600 hover:bg-slate-50'}`}>
                 <Compass className={`w-6 h-6 ${location.pathname === '/courses' ? 'text-historia-blue' : 'text-slate-400'}`} />
                 <span>Époques</span>
              </Link>
              
              {lastChapter && (
                <Link to={`/lesson/${lastChapter}`} className="flex items-center space-x-4 p-4 rounded-xl font-bold text-historia-gold hover:bg-yellow-50 transition-colors">
                   <PlayCircle className="w-6 h-6 text-historia-gold" />
                   <span>Continuer la lecture</span>
                </Link>
              )}
              
              {(profile?.role === 'admin' || profile?.role === 'editeur') && (
                <Link to="/admin" className={`flex items-center space-x-4 p-4 rounded-xl font-bold transition-colors ${location.pathname.startsWith('/admin') ? 'bg-slate-100 text-historia-blue' : 'text-slate-600 hover:bg-slate-50'}`}>
                   <Settings className={`w-6 h-6 ${location.pathname.startsWith('/admin') ? 'text-historia-blue' : 'text-slate-400'}`} />
                   <span>Administration</span>
                </Link>
              )}

            </div>

            <div className="mt-auto border-t border-slate-100 p-4">
              {user ? (
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-3 px-4 py-2">
                    <div className="w-10 h-10 bg-historia-blue rounded-full flex items-center justify-center text-white font-bold shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-bold text-slate-800 truncate">{profile?.name || user.email.split('@')[0]}</p>
                      <p className="text-xs text-slate-500 capitalize">{profile?.role || 'Lecteur'}</p>
                    </div>
                  </div>
                  <button onClick={signOut} className="flex items-center space-x-4 p-4 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-colors w-full text-left">
                     <LogOut className="w-6 h-6 text-red-400" />
                     <span>Déconnexion</span>
                  </button>
                </div>
              ) : (
                <Link to="/auth" className="flex items-center justify-center space-x-2 bg-historia-blue text-white p-4 rounded-xl font-bold hover:bg-slate-800 transition-colors">
                  <LogIn className="w-5 h-5" />
                  <span>Connexion</span>
                </Link>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
