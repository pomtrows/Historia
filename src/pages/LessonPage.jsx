import React, { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import TimelineWidget from '../components/Course/TimelineWidget';
import ChapterNav from '../components/Course/ChapterNav';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function LessonPage() {
  const { id } = useParams();
  const location = useLocation();
  const [chapter, setChapter] = useState(null);
  const [nextChapterId, setNextChapterId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zoomedImg, setZoomedImg] = useState(null);

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        setLoading(true);
        // Si l'id est "1", on charge une démo en dur si la DB est vide, sinon on tente de charger depuis la BD
        const { data, error } = await supabase
          .from('chapters')
          .select('*')
          .eq('id', id)
          .single();

        if (error && error.code !== '22P02') throw error; 
        
        setChapter(data);

        if (data && data.epoch_id) {
          try {
            const { data: nextInEpoch } = await supabase
              .from('chapters')
              .select('id')
              .eq('epoch_id', data.epoch_id)
              .gt('"order"', data.order)
              .order('"order"', { ascending: true })
              .limit(1)
              .maybeSingle();
              
            if (nextInEpoch) {
              setNextChapterId(nextInEpoch.id);
            } else {
              const { data: currEpoch } = await supabase.from('epochs').select('order').eq('id', data.epoch_id).single();
              if (currEpoch) {
                const { data: nextEpoch } = await supabase.from('epochs').select('id').gt('"order"', currEpoch.order).order('"order"', { ascending: true }).limit(1).maybeSingle();
                if (nextEpoch) {
                  const { data: nextChapInNextEpoch } = await supabase.from('chapters').select('id').eq('epoch_id', nextEpoch.id).order('"order"', { ascending: true }).limit(1).maybeSingle();
                  if (nextChapInNextEpoch) {
                    setNextChapterId(nextChapInNextEpoch.id);
                  } else {
                    setNextChapterId(null);
                  }
                } else {
                  setNextChapterId(null);
                }
              } else {
                setNextChapterId(null);
              }
            }
          } catch (e) {
            console.error('Erreur next chapter:', e);
          }
        }
      } catch (err) {
        console.error('Erreur chargement chapitre:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [id]);

  useEffect(() => {
    if (loading) return;

    if (location.hash === '#frise') {
      const el = document.getElementById('frise');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (location.hash === '#lecon') {
      const el = document.getElementById('lecon');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Restaurer le scroll précédent s'il n'y a pas d'ancre spécifique
      const savedScroll = localStorage.getItem(`historia_scroll_${id}`);
      if (savedScroll) {
        setTimeout(() => {
          window.scrollTo({ top: parseInt(savedScroll, 10), behavior: 'auto' });
        }, 100);
      }
    }

    // Sauvegarder globalement le dernier chapitre consulté
    localStorage.setItem('historia_last_chapter', id);

    // Sauvegarder la position de lecture
    let scrollTimer = null;
    const handleScroll = () => {
      if (scrollTimer) return;
      scrollTimer = setTimeout(() => {
        localStorage.setItem(`historia_scroll_${id}`, window.scrollY);
        scrollTimer = null;
      }, 500); // Throttling de 500ms pour préserver les performances
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimer) clearTimeout(scrollTimer);
    };
  }, [loading, id, location.hash]);

  const handleImageClick = (e) => {
    if (e.target.tagName === 'IMG') {
      setZoomedImg(e.target.src);
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-xl font-serif text-historia-blue">Chargement du parchemin...</div>;
  }

  // Zoom Modal Component inline
  const zoomModal = zoomedImg && (
    <div 
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out opacity-0 animate-fade-in"
      onClick={() => setZoomedImg(null)}
    >
      <img 
        src={zoomedImg} 
        alt="Agrandissement" 
        className="max-w-full max-h-full object-contain scale-95 animate-scale-in"
      />
    </div>
  );

  // Si on est sur /lesson/1 et qu'il n'y a pas de chapitre en BD, on affiche le cours démo de la préhistoire.
  if (!chapter && id === "1") {
    return (
      <>
        <div onClick={handleImageClick}>
          <DemoLesson />
        </div>
        {zoomModal}
      </>
    );
  }

  if (!chapter) {
    return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-xl text-red-500">Chapitre introuvable.</div>;
  }

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-4 md:py-12" onClick={handleImageClick}>
        <div className="mb-6">
          <Link to={`/courses#epoch-${chapter.epoch_id || '1'}`} className="inline-flex items-center text-slate-500 hover:text-historia-blue font-bold transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" /> Retour aux époques
          </Link>
        </div>
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-historia-blue mb-4">{chapter.title}</h1>
        </header>

        <ChapterNav chapterId={id} />

        <div id="lecon" className="scroll-mt-8">
          {chapter.map_url && (
            <section className="mb-12 rounded-xl overflow-hidden shadow-2xl border-4 border-slate-100">
              <div className="bg-slate-200 h-96 flex items-center justify-center relative overflow-hidden">
                <img 
                  src={chapter.map_url} 
                  alt="Carte du chapitre" 
                  className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity cursor-zoom-in"
                  referrerPolicy="no-referrer"
                />
              </div>
            </section>
          )}


        {/* Rendu dynamique du HTML de TipTap */}
        <article 
          className="prose prose-lg md:prose-xl max-w-none prose-headings:font-serif prose-headings:text-historia-blue prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-8 prose-h2:pt-6 prose-h2:border-t prose-h2:border-slate-200 prose-h3:text-xl md:prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-6 prose-p:text-slate-800 prose-p:leading-[2.05] md:prose-p:leading-[2.15] prose-p:mb-8 prose-p:text-lg space-y-6 [&_img]:cursor-zoom-in"
          dangerouslySetInnerHTML={{ 
            __html: (chapter.content || '')
              .replace(/<h[12][^>]*>\s*(?:<strong>)?\s*Chapitre\s*\d*\s*:[^<]*(?:<\/strong>)?\s*<\/h[12]>/gi, '')
              .replace(/<h[12][^>]*>\s*(?:<strong>)?\s*CHAPITRE\s*\d*\s*:[^<]*(?:<\/strong>)?\s*<\/h[12]>/gi, '')
          }}
        />
        </div>

        <div className="mt-16 flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={`/lesson/${id}/quiz`} className="bg-historia-blue text-white px-8 py-4 rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-lg text-center">
            Lancer le Quiz
          </Link>
          <Link to={`/lesson/${id}/annex`} className="bg-white border-2 border-historia-gold text-historia-gold px-8 py-4 rounded-lg font-bold hover:bg-yellow-50 transition-colors shadow-lg text-center">
            Art
          </Link>
        </div>
        
        <div className="mt-12 flex flex-col sm:flex-row justify-between items-center border-t border-slate-200 pt-8">
          <Link to={`/courses#epoch-${chapter.epoch_id || '1'}`} className="inline-flex items-center text-slate-500 hover:text-historia-blue font-bold transition-colors mb-4 sm:mb-0">
            <ArrowLeft className="w-5 h-5 mr-2" /> Retour aux époques
          </Link>
          
          {nextChapterId && (
            <Link to={`/lesson/${nextChapterId}`} className="inline-flex items-center bg-slate-100 hover:bg-slate-200 text-historia-blue px-6 py-3 rounded-lg font-bold transition-colors">
              Chapitre Suivant <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          )}
        </div>
      </div>
      {zoomModal}
    </>
  );
}

// Composant fallback contenant notre leçon de démo originale
function DemoLesson() {
  const { id } = useParams();
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-4 md:py-12">
      <div className="mb-6">
        <Link to={`/courses#epoch-1`} className="inline-flex items-center text-slate-500 hover:text-historia-blue font-bold transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" /> Retour aux époques
        </Link>
      </div>
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-historia-blue mb-4">Chapitre 1 : L'Aube de l'Humanité</h1>
        <p className="text-lg text-slate-500 italic font-serif">Époque 1 : La Préhistoire</p>
      </header>

      <ChapterNav chapterId={id || "1"} />

      <div id="lecon" className="scroll-mt-8">

      <section className="mb-12 rounded-xl overflow-hidden shadow-2xl border-4 border-slate-100">
        <div className="bg-slate-200 h-96 flex items-center justify-center relative overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200" 
            alt="Carte de la Vallée du Grand Rift" 
            className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="bg-white p-4 text-center text-sm text-slate-600 italic">
          Fig 1. La vallée du Grand Rift, berceau des premiers hominidés. (Image d'illustration)
        </div>
      </section>

      <article className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-historia-blue prose-p:text-slate-700 prose-p:leading-relaxed space-y-6">
        <p className="first-letter:text-5xl first-letter:font-bold first-letter:font-serif first-letter:text-historia-gold first-letter:mr-3 first-letter:float-left">
          Il y a environ 7 millions d'années, sur le continent africain, se joue l'un des événements les plus fascinants de l'histoire de la vie sur Terre. Dans la région de la vallée du Grand Rift, une fracture géologique monumentale qui balafre l'Afrique de l'Est, des primates commencent à s'adapter à un nouvel environnement.
        </p>
        <p>
          Face à la disparition progressive des denses forêts au profit de la savane, certains de ces primates se dressent sur leurs deux pattes arrière pour voir au-dessus des hautes herbes. C'est le début de la bipédie, et avec elle, le long et passionnant cheminement de l'humanité.
        </p>

        <h2 className="text-2xl mt-12 mb-6 border-b pb-2">Toumaï, le pionnier mystérieux</h2>
        <p>
          Découvert dans le désert du Djourab au Tchad en 2001, <em>Sahelanthropus tchadensis</em>, surnommé affectueusement <strong>Toumaï</strong> ("espoir de vie" en langue gorane), est considéré par beaucoup de paléoanthropologues comme l'un de nos plus anciens ancêtres connus. 
        </p>
        <p>
          Bien que son crâne tienne dans le creux d'une main et possède un volume cérébral similaire à celui d'un chimpanzé (environ 350 cm³), un détail anatomique crucial le distingue : la position de son trou occipital. L'orifice par lequel la moelle épinière rejoint le cerveau est situé vers l'avant, ce qui suggère fortement qu'il marchait debout.
        </p>

        <div className="my-10 p-8 bg-yellow-50 border-l-4 border-historia-gold rounded-r-lg shadow-inner">
          <h4 className="font-serif font-bold text-historia-gold text-xl mb-3 flex items-center">
            💡 L'anecdote du professeur
          </h4>
          <p className="text-slate-700 italic m-0">
            Saviez-vous que la découverte de Toumaï a totalement bouleversé la célèbre théorie de "l'East Side Story" du paléontologue Yves Coppens ? Cette théorie affirmait que nos ancêtres étaient nés exclusivement à l'Est du Rift. L'apparition de Toumaï au Tchad, soit à plus de 2500 km à l'Ouest, a prouvé que l'histoire de nos origines était bien plus complexe et panafricaine qu'on ne le croyait !
          </p>
        </div>

        <h2 className="text-2xl mt-12 mb-6 border-b pb-2">Lucy et les Australopithèques</h2>
        <p>
          Faisons un bond dans le temps pour nous retrouver il y a 3,2 millions d'années, dans la dépression de l'Afar, en Éthiopie. C'est là que repose <strong>Lucy</strong>, la plus célèbre des <em>Australopithecus afarensis</em>. Découverte en 1974 par Donald Johanson, elle a longtemps été considérée comme la "grand-mère de l'humanité". 
        </p>
        <p>
          Bien que l'on sache aujourd'hui qu'elle n'est probablement qu'une branche cousine de notre lignée directe, son squelette, incroyablement complet pour l'époque (à 40%), nous a énormément appris. 
        </p>
        <p>
          Lucy mesurait à peine 1 mètre 10. Elle grimpait encore habilement aux arbres pour fuir les prédateurs de la savane ou pour y dormir, mais son bassin et ses jambes prouvent qu'elle marchait indéniablement sur ses deux pieds.
        </p>

        <figure className="my-14">
          <div className="bg-slate-200 rounded-lg flex items-center justify-center overflow-hidden border-4 border-historia-gold/20 shadow-xl">
             <img 
              src="https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1200" 
              alt="Reconstitution d'Australopithecus afarensis" 
              className="w-full max-h-[500px] object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <figcaption className="text-center text-sm text-slate-500 mt-4 italic">Une reconstitution artistique de la savane africaine à l'aube de l'humanité.</figcaption>
        </figure>

        <h2 className="text-2xl mt-12 mb-6 border-b pb-2">L'émergence du genre Homo</h2>
        <p>
          Vers 2,5 millions d'années, un changement climatique majeur refroidit et assèche l'Afrique. Les forêts reculent drastiquement au profit d'immenses savanes ouvertes. C'est dans ce contexte difficile, qui exige plus de ressources et d'ingéniosité, qu'émerge le genre <em>Homo</em>. 
        </p>
        <p>
          <strong>Homo habilis</strong> ("l'homme habile") est le premier à fabriquer des outils en pierre taillée de manière systématique (la culture de l'Oldowayen). Ces outils, bien que rudimentaires (de simples galets aménagés appelés choppers), lui permettent de découper la viande et de casser les os pour en extraire la moelle. Cet apport en protéines est crucial : il va fournir l'énergie nécessaire au développement croissant de son cerveau.
        </p>
        <p>
          Mais le véritable marathonien de la préhistoire, c'est <strong>Homo erectus</strong> ("l'homme dressé"). Apparu il y a environ 1,9 million d'années, il est nettement plus grand et possède un cerveau volumineux (jusqu'à 1000 cm³). Il fabrique des outils magnifiques et symétriques : les bifaces. 
        </p>
        <p>
          Plus impressionnant encore, c'est lui qui va, pour la première fois vers -400 000 ans, réussir à dompter et utiliser le feu. Cette maîtrise va transformer ses nuits, son alimentation, et l'aider à quitter le berceau africain pour entamer la grande conquête de l'Eurasie.
        </p>
      </article>
      </div>

      <div className="mt-16 flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/lesson/1/quiz" className="bg-historia-blue text-white px-8 py-4 rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-lg text-center">
          Lancer le Quiz (20 questions)
        </Link>
        <Link to="/lesson/1/annex" className="bg-white border-2 border-historia-gold text-historia-gold px-8 py-4 rounded-lg font-bold hover:bg-yellow-50 transition-colors shadow-lg text-center">
          Art : L'Art pariétal
        </Link>
      </div>

      <div className="mt-12 flex flex-col sm:flex-row justify-between items-center border-t border-slate-200 pt-8">
        <Link to={`/courses#epoch-1`} className="inline-flex items-center text-slate-500 hover:text-historia-blue font-bold transition-colors mb-4 sm:mb-0">
          <ArrowLeft className="w-5 h-5 mr-2" /> Retour aux époques
        </Link>
      </div>
    </div>
  );
}
