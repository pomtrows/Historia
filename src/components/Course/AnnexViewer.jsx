import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ChapterNav from './ChapterNav';

// Mock data pour /lesson/1
const mockAnnexes = [
  {
    id: 1,
    title: "La Grotte de Lascaux",
    description: "Surnommée la \"chapelle Sixtine de l'art pariétal\", la grotte de Lascaux (Dordogne, France) abrite des peintures polychromes spectaculaires. Les artistes préhistoriques utilisaient des pigments naturels (ocre jaune, ocre rouge, bioxyde de manganèse pour le noir) pour peindre de gigantesques taureaux, des chevaux et des cerfs.\n\nNote : Remarquez l'utilisation de la perspective tordue, où le corps de l'animal est de profil mais les cornes sont vues de face pour plus de clarté.",
    image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Lascaux_painting.jpg/800px-Lascaux_painting.jpg",
    century: "Vers 17 000 av. J.-C."
  },
  {
    id: 2,
    title: "La Cueva de las Manos",
    description: "Située en Argentine, la \"Grotte des Mains\" est célèbre pour ses centaines d'empreintes de mains négatives. Pour réaliser cela, nos ancêtres plaçaient leur main sur la paroi et soufflaient des pigments pulvérisés à l'aide d'un os creux ou directement avec la bouche, agissant comme un aérosol préhistorique.\n\nNote : C'est la signature intemporelle de l'humanité : \"J'étais ici\".",
    image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Cueva_de_las_Manos_in_Santa_Cruz_province_-_Argentina.jpg/800px-Cueva_de_las_Manos_in_Santa_Cruz_province_-_Argentina.jpg",
    century: "Vers 9 000 av. J.-C."
  }
];

export default function AnnexViewer() {
  const { id: chapterId } = useParams();
  const [annexes, setAnnexes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lightbox state (stores the URL directly)
  const [lightboxIndex, setLightboxIndex] = useState(null);
  
  // Isoler la galerie courante en fonction de l'image ouverte
  const currentAnnex = annexes.find(a => [a.image_url, ...(a.gallery || [])].includes(lightboxIndex));
  const currentGalleryImages = currentAnnex ? [currentAnnex.image_url, ...(currentAnnex.gallery || [])].filter(Boolean) : [];

  const openLightbox = (url) => setLightboxIndex(url);
  const closeLightbox = () => setLightboxIndex(null);
  
  const nextImage = (e) => {
    e?.stopPropagation();
    if (currentGalleryImages.length > 0 && lightboxIndex) {
      const currentIndex = currentGalleryImages.indexOf(lightboxIndex);
      if (currentIndex !== -1) {
        setLightboxIndex(currentGalleryImages[(currentIndex + 1) % currentGalleryImages.length]);
      }
    }
  };
  
  const prevImage = (e) => {
    e?.stopPropagation();
    if (currentGalleryImages.length > 0 && lightboxIndex) {
      const currentIndex = currentGalleryImages.indexOf(lightboxIndex);
      if (currentIndex !== -1) {
        setLightboxIndex(currentGalleryImages[(currentIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length]);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, currentGalleryImages.length]);

  useEffect(() => {
    const fetchAnnexes = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('annexes')
          .select('*')
          .eq('chapter_id', chapterId)
          .order('id', { ascending: true });

        if (error && error.code !== '22P02') throw error;

        if (data && data.length > 0) {
          const formattedAnnexes = data.map(a => ({
            id: a.id,
            title: a.title,
            description: a.content,
            image_url: a.artworks?.image_url,
            century: a.artworks?.century,
            gallery: a.artworks?.gallery || []
          }));
          setAnnexes(formattedAnnexes);
        } else {
          if (chapterId === "1") {
            setAnnexes(mockAnnexes);
          } else {
            setAnnexes([]);
          }
        }
      } catch (err) {
        console.error("Erreur chargement annexes:", err);
        if (chapterId === "1") {
          setAnnexes(mockAnnexes);
        } else {
          setAnnexes([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnnexes();
  }, [chapterId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-historia-blue">
        <Loader2 className="w-10 h-10 animate-spin mr-3" />
        <span className="font-serif text-xl">Recherche dans les archives...</span>
      </div>
    );
  }

  if (annexes.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
         <header className="mb-8">
           <h1 className="text-4xl md:text-5xl font-serif font-bold text-historia-blue mb-4">Art</h1>
           <p className="text-lg text-slate-500 italic font-serif">Découvertes et chefs-d'œuvre du chapitre</p>
         </header>
         <ChapterNav chapterId={chapterId} />
         <div className="text-xl text-slate-500 italic mt-10">Aucun contenu d'art disponible pour ce chapitre.</div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-historia-blue mb-4">Art</h1>
          <p className="text-lg text-slate-500 italic font-serif">Découvertes et chefs-d'œuvre du chapitre</p>
        </header>

        <ChapterNav chapterId={chapterId} />

        <div className="space-y-20">
          {annexes.map((annex, index) => {
            const isReversed = index % 2 !== 0;
            return (
              <div key={annex.id} className={`flex flex-col ${isReversed ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 items-start bg-white p-6 rounded-2xl shadow-lg border border-slate-100`}>
                
                {/* Colonne Image + Miniatures */}
                <div className="w-full md:w-2/5 lg:w-1/3 flex-shrink-0 mx-auto flex flex-col gap-4">
                  {/* Image Principale */}
                  <div 
                    className="overflow-hidden rounded-xl bg-slate-900 border-4 border-[#2b2b2b] shadow-2xl cursor-pointer group"
                    onClick={() => openLightbox(annex.image_url)}
                  >
                    <img 
                      src={annex.image_url} 
                      alt={annex.title} 
                      className="w-full h-auto max-h-[400px] object-cover group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Miniatures de la Galerie */}
                  {annex.gallery && annex.gallery.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {annex.gallery.map((img, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => openLightbox(img)}
                          className="aspect-square rounded-lg overflow-hidden shadow-sm border border-slate-200 group cursor-pointer bg-slate-900"
                        >
                          <img 
                            src={img} 
                            alt={`Galerie ${idx + 1}`} 
                            className="w-full h-full object-cover group-hover:scale-125 group-hover:opacity-80 transition-all duration-500"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Colonne Texte */}
                <div className="w-full md:w-3/5 lg:w-2/3 mt-2 md:mt-0">
                  {annex.century && (
                    <span className="text-historia-gold font-bold tracking-wider uppercase text-sm mb-2 block">{annex.century}</span>
                  )}
                  <h3 className="font-serif text-3xl font-bold text-historia-blue mb-4">{annex.title}</h3>
                  <div 
                    className="text-slate-600 leading-relaxed space-y-4 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: annex.description }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm" 
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button 
            className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors z-50" 
            onClick={closeLightbox}
          >
            <X className="w-8 h-8" />
          </button>

          {/* Zone de clic Gauche */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-1/4 z-40 cursor-pointer flex items-center justify-start pl-4 md:pl-8 group"
            onClick={prevImage}
          >
            <div className="p-3 rounded-full bg-black/30 text-white/50 group-hover:text-white group-hover:bg-black/60 transition-all">
              <ChevronLeft className="w-10 h-10" />
            </div>
          </div>

          {/* Zone de clic Droite */}
          <div 
            className="absolute right-0 top-0 bottom-0 w-1/4 z-40 cursor-pointer flex items-center justify-end pr-4 md:pr-8 group"
            onClick={nextImage}
          >
            <div className="p-3 rounded-full bg-black/30 text-white/50 group-hover:text-white group-hover:bg-black/60 transition-all">
              <ChevronRight className="w-10 h-10" />
            </div>
          </div>

          {/* Main Image */}
          <div className="relative max-w-[80vw] max-h-full p-4 md:p-12 flex items-center justify-center z-30 pointer-events-none">
            <img 
              src={lightboxIndex}
              alt={`Plein écran`}
              className="max-h-[85vh] max-w-[80vw] object-contain shadow-2xl rounded pointer-events-auto cursor-pointer"
              onClick={closeLightbox} 
              referrerPolicy="no-referrer"
              title="Cliquez pour fermer"
            />
          </div>
        </div>
      )}
    </>
  );
}
