import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import TimelineWidget from '../components/Course/TimelineWidget';
import ChapterNav from '../components/Course/ChapterNav';

export default function TimelinePage() {
  const { id } = useParams();
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data si chapitre 1 (fallback)
  const mockTimeline = [
    {
      id: 1,
      year_label: "~ 7 Millions d'années",
      title: "Séparation de la lignée humaine",
      description: "Toumaï (Sahelanthropus tchadensis) au Tchad, potentiellement le premier hominidé bipède."
    },
    {
      id: 2,
      year_label: "~ 3.2 Millions d'années",
      title: "Australopithecus afarensis",
      description: "Lucy est découverte en Éthiopie. Elle prouve une bipédie quasi-permanente."
    },
    {
      id: 3,
      year_label: "~ 2.5 Millions d'années",
      title: "Homo habilis et l'outil",
      description: "Apparition des premiers outils en pierre taillée (Oldowayen)."
    },
    {
      id: 4,
      year_label: "~ 400 000 ans",
      title: "Maîtrise du feu",
      description: "Homo erectus dompte le feu, transformant l'alimentation et la sécurité."
    }
  ];

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('chapters')
          .select('title, epoch_id, timeline_data')
          .eq('id', id)
          .single();

        if (error && error.code !== '22P02') throw error; 
        
        if (data) {
          setChapter(data);
        } else if (id === "1") {
          setChapter({ title: "L'Aube de l'Humanité", epoch_id: '1', timeline_data: mockTimeline });
        }
      } catch (err) {
        console.error('Erreur chargement chapitre:', err);
        if (id === "1") {
          setChapter({ title: "L'Aube de l'Humanité", epoch_id: '1', timeline_data: mockTimeline });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-historia-blue">
        <Loader2 className="w-10 h-10 animate-spin mr-3" />
        <span className="font-serif text-xl">Déroulement du parchemin...</span>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
         <div className="mb-6 text-left">
           <Link to="/courses" className="inline-flex items-center text-slate-500 hover:text-historia-blue font-bold transition-colors">
             <ArrowLeft className="w-5 h-5 mr-2" /> Retour aux époques
           </Link>
         </div>
         <header className="mb-4">
           <h1 className="text-3xl md:text-4xl font-serif font-bold text-historia-blue mb-2">Frise</h1>
         </header>
         <ChapterNav chapterId={id} />
         <div className="text-xl text-slate-500 italic mt-10">Ce chapitre n'existe pas.</div>
      </div>
    );
  }

  const hasTimeline = chapter.timeline_data && chapter.timeline_data.length > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 md:py-12">
      <div className="mb-6">
        <Link to={`/courses#epoch-${chapter.epoch_id || '1'}`} className="inline-flex items-center text-slate-500 hover:text-historia-blue font-bold transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" /> Retour aux époques
        </Link>
      </div>
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-historia-blue mb-4">{chapter.title}</h1>
        <p className="text-lg text-slate-500 italic font-serif">Frise Chronologique des dates clés</p>
      </header>

      <ChapterNav chapterId={id} />

      {!hasTimeline ? (
        <div className="text-center mt-10">
          <div className="text-xl text-slate-500 italic">Aucune frise disponible pour ce chapitre.</div>
        </div>
      ) : (
        <div className="-mt-10">
          <TimelineWidget events={chapter.timeline_data} />
        </div>
      )}
    </div>
  );
}
