import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ChapterNav from './ChapterNav';

// Mock data pour /lesson/1 au cas où la table n'existe pas ou est vide
const mockVideos = [
  {
    id: 1,
    title: "L'art pariétal expliqué",
    description: "Une plongée fascinante dans les grottes de Lascaux et la technique de nos ancêtres.",
    url: "https://www.youtube.com/embed/aJcbL7oK3v8",
  },
  {
    id: 2,
    title: "La préhistoire racontée",
    description: "Résumé de la période paléolithique et de l'évolution de l'homme.",
    url: "https://www.youtube.com/embed/nLzEa1z2DUM",
  }
];

export default function VideoViewer() {
  const { id: chapterId } = useParams();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chapterInfo, setChapterInfo] = useState(null);

  // Helper pour extraire l'ID youtube d'une URL pour l'iframe si ce n'est pas déjà un lien embed
  const getEmbedUrl = (url) => {
    if (!url) return '';
    // Si c'est déjà un lien nocookie, on le retourne
    if (url.includes('youtube-nocookie.com/embed/')) return url;
    
    // Si c'est un lien embed classique, on le transforme en nocookie
    if (url.includes('youtube.com/embed/')) {
      return url.replace('youtube.com/embed/', 'youtube-nocookie.com/embed/');
    }
    
    let videoId = '';
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1];
      const ampersandPosition = videoId.indexOf('&');
      if (ampersandPosition !== -1) {
        videoId = videoId.substring(0, ampersandPosition);
      }
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1];
      const questionPosition = videoId.indexOf('?');
      if (questionPosition !== -1) {
        videoId = videoId.substring(0, questionPosition);
      }
    }
    
    return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : url;
  };

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        // Charger les infos du chapitre
        const { data: chapData } = await supabase
          .from('chapters')
          .select('title, epoch_id')
          .eq('id', chapterId)
          .maybeSingle();
        if (chapData) {
          setChapterInfo(chapData);
        } else if (chapterId === "1") {
          setChapterInfo({ title: "L'Aube de l'Humanité", epoch_id: "1" });
        }

        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .eq('chapter_id', chapterId)
          .order('id', { ascending: true });

        if (error) {
          // Si la table 'videos' n'existe pas, on passe au catch
          throw error;
        }

        if (data && data.length > 0) {
          setVideos(data);
        } else {
          if (chapterId === "1") {
            setVideos(mockVideos);
          } else {
            setVideos([]);
          }
        }
      } catch (err) {
        console.error("Erreur chargement vidéos (ou table inexistante):", err);
        if (chapterId === "1") {
          setVideos(mockVideos);
        } else {
          setVideos([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [chapterId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-historia-blue">
        <Loader2 className="w-10 h-10 animate-spin mr-3" />
        <span className="font-serif text-xl">Chargement des vidéos...</span>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
         <div className="mb-6">
           <Link to={`/courses#epoch-${chapterInfo?.epoch_id || '1'}`} className="inline-flex items-center text-slate-500 hover:text-historia-blue font-bold transition-colors">
             <ArrowLeft className="w-5 h-5 mr-2" /> Retour aux époques
           </Link>
         </div>
         <header className="mb-8 text-center">
           <h1 className="text-4xl md:text-5xl font-serif font-bold text-historia-blue mb-4">{chapterInfo?.title || "Vidéos"}</h1>
           <p className="text-lg text-slate-500 italic font-serif">Ressources audiovisuelles et documentaires</p>
         </header>
         <ChapterNav chapterId={chapterId} />
         <div className="text-xl text-slate-500 italic mt-10 text-center">Aucune vidéo disponible pour ce chapitre.</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-6">
        <Link to={`/courses#epoch-${chapterInfo?.epoch_id || '1'}`} className="inline-flex items-center text-slate-500 hover:text-historia-blue font-bold transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" /> Retour aux époques
        </Link>
      </div>
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-historia-blue mb-4">{chapterInfo?.title || "Vidéos"}</h1>
        <p className="text-lg text-slate-500 italic font-serif">Ressources audiovisuelles et documentaires ({videos.length} vidéos)</p>
      </header>

      <ChapterNav chapterId={chapterId} />

      <div className="space-y-16">
        {videos.map((video) => (
          <div key={video.id} className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-100 flex flex-col items-center max-w-4xl mx-auto">
            <h3 className="font-serif text-2xl md:text-3xl font-bold text-historia-blue mb-6 w-full text-left">{video.title}</h3>
            
            <div className="w-full aspect-video rounded-xl overflow-hidden shadow-md bg-slate-900 border-2 border-[#2b2b2b]">
              <iframe 
                width="100%" 
                height="100%" 
                src={getEmbedUrl(video.url)} 
                title={video.title} 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
            
            {video.description && (
              <div className="w-full mt-6 text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">
                {video.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
