import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronUp, BookOpen, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Cache mémoire client pour affichage instantané (0ms) lors de la navigation
let memoryCoursesCache = null;

export default function CoursesPage() {
  const [epochs, setEpochs] = useState(memoryCoursesCache?.epochs || []);
  const [chapters, setChapters] = useState(memoryCoursesCache?.chapters || {});
  const [loading, setLoading] = useState(!memoryCoursesCache);
  const [expandedEpochs, setExpandedEpochs] = useState([]);
  const location = useLocation();

  useEffect(() => {
    if (location.hash && epochs.length > 0) {
      const targetId = location.hash.replace('#epoch-', '');
      if (targetId) {
        setExpandedEpochs(prev => [...new Set([...prev, targetId])]);
        setTimeout(() => {
          const el = document.getElementById(`epoch-${targetId}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [location.hash, epochs]);

  const toggleEpoch = (epochId) => {
    setExpandedEpochs(prev => 
      prev.includes(epochId) 
        ? prev.filter(id => id !== epochId)
        : [...prev, epochId]
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      // Si déjà en cache mémoire, chargement en arrière-plan sans bloquer
      if (!memoryCoursesCache) {
        setLoading(true);
      }

      try {
        // REQUÊTE OPTIMISÉE : Jointure unique et légère (AUCUN champ 'content' volumineux téléchargé)
        const { data: epochsWithChapters, error } = await supabase
          .from('epochs')
          .select('id, order, title, description, image_url, chapters(id, title, order)')
          .order('order', { ascending: true });

        if (error) throw error;

        if (epochsWithChapters && epochsWithChapters.length > 0) {
          const sortedEpochs = [...epochsWithChapters].sort((a, b) => (a.order || 0) - (b.order || 0));
          const grouped = {};

          sortedEpochs.forEach(ep => {
            grouped[ep.id] = (ep.chapters || []).sort((a, b) => (a.order || 0) - (b.order || 0));
          });

          // Mise à jour du state et du cache mémoire
          memoryCoursesCache = { epochs: sortedEpochs, chapters: grouped };
          setEpochs(sortedEpochs);
          setChapters(grouped);
        }
      } catch (err) {
        console.error("Erreur lors du chargement ultra-rapide des cours:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading && epochs.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-16 animate-pulse">
          <div className="h-10 bg-slate-200 rounded-lg w-72 mx-auto mb-4"></div>
          <div className="h-5 bg-slate-100 rounded w-96 mx-auto"></div>
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-pulse flex items-center justify-between">
              <div className="space-y-3 w-3/4">
                <div className="h-4 bg-amber-100 rounded w-24"></div>
                <div className="h-8 bg-slate-200 rounded w-64"></div>
                <div className="h-4 bg-slate-100 rounded w-full"></div>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <span className="text-xs font-bold uppercase tracking-widest text-historia-gold bg-amber-50 px-3 py-1 rounded-full border border-amber-200 mb-3 inline-block">
          Syllabus Universitaire & Récits Monumentaux
        </span>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-historia-blue mb-4">Le Programme d'Histoire</h1>
        <p className="text-lg text-slate-600">Choisissez une époque pour explorer ses chapitres, frises, quiz et reliques d'art.</p>
      </div>

      <div className="space-y-8">
        {epochs.map((epoch) => {
          const chapList = chapters[epoch.id] || [];
          const isExpanded = expandedEpochs.includes(epoch.id);

          return (
            <div 
              key={epoch.id} 
              id={`epoch-${epoch.id}`} 
              className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden transition-all hover:shadow-lg"
            >
              <div 
                className="bg-gradient-to-r from-slate-900 via-historia-blue to-slate-800 p-6 text-white flex flex-row items-center justify-between gap-4 cursor-pointer select-none"
                onClick={() => toggleEpoch(epoch.id)}
              >
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-historia-gold font-bold tracking-wider uppercase text-xs px-2.5 py-0.5 rounded-full bg-amber-950/60 border border-amber-600/30">
                      Époque {epoch.order}
                    </span>
                    <span className="text-slate-400 text-xs flex items-center gap-1 font-sans">
                      <BookOpen className="w-3.5 h-3.5" />
                      {chapList.length} chapitres
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-amber-50">{epoch.title}</h2>
                  <p className="text-slate-300 text-sm md:text-base mt-2 max-w-3xl font-light leading-relaxed">{epoch.description}</p>
                </div>
                <div className="text-historia-gold p-2 rounded-full hover:bg-white/10 transition-colors shrink-0">
                  {isExpanded ? (
                    <ChevronUp className="w-7 h-7" />
                  ) : (
                    <ChevronDown className="w-7 h-7" />
                  )}
                </div>
              </div>
              
              {isExpanded && (
                <div className="p-6 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
                    <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-4 h-4 text-historia-gold" />
                      Chapitres & Parcours de l'époque :
                    </h3>
                    <span className="text-xs text-slate-500 font-medium">
                      {chapList.length} leçons disponibles
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {chapList.length > 0 ? (
                      chapList.map(chap => (
                        <Link 
                          key={chap.id} 
                          to={`/lesson/${chap.id}`}
                          className="flex items-center p-4 rounded-xl border border-slate-200 hover:border-historia-gold hover:shadow-md transition-all group bg-white"
                        >
                          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold group-hover:bg-historia-gold group-hover:text-white transition-colors mr-3.5 shrink-0 text-sm">
                            {chap.order}
                          </div>
                          <span className="font-serif text-base text-slate-800 group-hover:text-amber-800 transition-colors font-medium">
                            {chap.title}
                          </span>
                        </Link>
                      ))
                    ) : (
                      <p className="text-slate-500 italic p-4 bg-slate-50 rounded-lg">Aucun chapitre disponible pour cette époque pour le moment.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
