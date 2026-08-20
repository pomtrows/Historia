import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function CoursesPage() {
  const [epochs, setEpochs] = useState([]);
  const [chapters, setChapters] = useState({});
  const [loading, setLoading] = useState(true);
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

  // Mock data fallback if DB is empty
  const mockEpochs = [
    { id: '1', title: 'La Préhistoire', description: "De l'aube de l'humanité jusqu'à l'invention de l'écriture.", order: 1 },
    { id: '2', title: "L'Antiquité Ancienne", description: 'Les premières grandes civilisations de Mésopotamie et d\'Égypte.', order: 2 },
    { id: '3', title: "L'Antiquité Classique", description: 'La splendeur de la Grèce antique et de l\'Empire Romain.', order: 3 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch epochs
        const { data: epochsData, error: epochsError } = await supabase
          .from('epochs')
          .select('*')
          .order('order', { ascending: true });

        if (epochsError && epochsError.code !== '42P01') throw epochsError;

        // Fetch chapters (just titles, epoch_ids, order and content to check if empty)
        const { data: chaptersData, error: chaptersError } = await supabase
          .from('chapters')
          .select('id, title, epoch_id, order, content')
          .order('order', { ascending: true });
        
        if (chaptersError && chaptersError.code !== '42P01') throw chaptersError;

        if (epochsData && epochsData.length > 0) {
          setEpochs(epochsData);
          
          // Group chapters by epoch_id
          const grouped = {};
          if (chaptersData) {
            chaptersData.forEach(chap => {
              if (!grouped[chap.epoch_id]) grouped[chap.epoch_id] = [];
              grouped[chap.epoch_id].push(chap);
            });
          }
          setChapters(grouped);
        } else {
          // Utiliser les données mockées si la DB est vide
          setEpochs(mockEpochs);
          setChapters({
            '1': [
              { id: '1', title: "L'Aube de l'Humanité (Démo)", order: 1 },
              { id: 'fake-2', title: "La révolution Néolithique", order: 2 },
            ]
          });
        }
      } catch (err) {
        console.error("Erreur lors du chargement des cours:", err);
        // Fallback en cas d'erreur réseau
        setEpochs(mockEpochs);
        setChapters({
          '1': [{ id: '1', title: "L'Aube de l'Humanité (Démo)", order: 1 }]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-xl font-serif text-historia-blue">Chargement des époques...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-historia-blue mb-4">Le Programme d'Histoire</h1>
        <p className="text-lg text-slate-600">Choisissez une époque pour commencer votre voyage dans le temps.</p>
      </div>

      <div className="space-y-12">
        {epochs.map((epoch) => (
          <div key={epoch.id} id={`epoch-${epoch.id}`} className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            <div 
              className="bg-historia-blue p-6 text-white flex flex-row items-center justify-between gap-4 cursor-pointer hover:bg-slate-800 transition-colors"
              onClick={() => toggleEpoch(epoch.id)}
            >
              <div>
                <span className="text-historia-gold font-bold tracking-wider uppercase text-sm mb-1 block">Époque {epoch.order}</span>
                <h2 className="text-3xl font-serif font-bold">{epoch.title}</h2>
                <p className="text-slate-300 mt-2">{epoch.description}</p>
              </div>
              <div className="text-historia-gold">
                {expandedEpochs.includes(epoch.id) ? (
                  <ChevronUp className="w-8 h-8" />
                ) : (
                  <ChevronDown className="w-8 h-8" />
                )}
              </div>
            </div>
            
            {expandedEpochs.includes(epoch.id) && (
              <div className="p-6">
                <h3 className="font-bold text-slate-700 mb-4 border-b pb-2">Chapitres disponibles :</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {chapters[epoch.id]?.length > 0 ? (
                    chapters[epoch.id].map(chap => {
                      const hasContent = chap.content && chap.content.length > 100 && chap.content !== '<p>Commencez à rédiger la leçon ici...</p>';
                      
                      if (hasContent) {
                        return (
                          <Link 
                            key={chap.id} 
                            to={`/lesson/${chap.id}`}
                            className="flex items-center p-4 rounded-lg border border-slate-200 hover:border-historia-gold hover:shadow-md transition-all group bg-white"
                          >
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold group-hover:bg-historia-gold group-hover:text-white transition-colors mr-4 shrink-0">
                              {chap.order}
                            </div>
                            <span className="font-serif text-lg text-historia-blue group-hover:text-historia-gold transition-colors">
                              {chap.title}
                            </span>
                          </Link>
                        );
                      } else {
                        return (
                          <div 
                            key={chap.id} 
                            className="flex items-center p-4 rounded-lg border border-slate-100 bg-slate-50 opacity-75 cursor-not-allowed"
                            title="Ce chapitre est en cours de rédaction"
                          >
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 font-bold mr-4 shrink-0">
                              {chap.order}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-serif text-lg text-slate-500">
                                {chap.title}
                              </span>
                              <span className="text-xs font-bold text-historia-gold uppercase tracking-wider">En rédaction ✍️</span>
                            </div>
                          </div>
                        );
                      }
                    })
                  ) : (
                    <p className="text-slate-500 italic p-4 bg-slate-50 rounded-lg">Aucun chapitre disponible pour cette époque pour le moment. L'éditeur y travaille !</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
