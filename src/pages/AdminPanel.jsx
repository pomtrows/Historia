import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { 
  BookOpen, Clock, FileText, Sparkles, Video, 
  Save, Plus, Trash2, Edit2, Image as ImageIcon, 
  Heading1, Heading2, Bold, Italic, List, Quote, 
  ImagePlus, Loader2, CheckCircle, ExternalLink,
  ChevronDown, ChevronUp, ArrowUp, ArrowDown,
  AlertCircle, ArrowLeft, RefreshCw, X, FileCheck,
  Upload, Eye, LayoutDashboard, Layers, BarChart3,
  Search, ArrowUpDown
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// --- MENU BAR POUR L'ÉDITEUR TIPTAP ---
const TiptapMenuBar = ({ editor, onImageUpload, isUploadingImage }) => {
  if (!editor) return null;

  const addImageFromUrl = () => {
    const url = window.prompt("URL de l'image :");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onImageUpload(file);
    }
    e.target.value = '';
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-2.5 bg-slate-100/90 backdrop-blur rounded-xl border border-slate-200 sticky top-0 z-10 shadow-sm mb-4">
      <button 
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()} 
        className={`p-2 rounded-lg transition-colors ${editor.isActive('bold') ? 'bg-historia-blue text-white shadow-xs font-bold' : 'text-slate-700 hover:bg-slate-200'}`} 
        title="Gras"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button 
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()} 
        className={`p-2 rounded-lg transition-colors ${editor.isActive('italic') ? 'bg-historia-blue text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'}`} 
        title="Italique"
      >
        <Italic className="w-4 h-4" />
      </button>
      
      <div className="w-px h-6 bg-slate-300 mx-1"></div>

      <button 
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
        className={`p-2 rounded-lg transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-historia-blue text-white shadow-xs font-bold' : 'text-slate-700 hover:bg-slate-200'}`} 
        title="Titre 1 (Acte / Section)"
      >
        <Heading1 className="w-4 h-4" />
      </button>
      <button 
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
        className={`p-2 rounded-lg transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-historia-blue text-white shadow-xs font-bold' : 'text-slate-700 hover:bg-slate-200'}`} 
        title="Titre 2 (Sous-section)"
      >
        <Heading2 className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-slate-300 mx-1"></div>

      <button 
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()} 
        className={`p-2 rounded-lg transition-colors ${editor.isActive('blockquote') ? 'bg-historia-blue text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'}`} 
        title="Anecdote historique (Citation)"
      >
        <Quote className="w-4 h-4" />
      </button>
      <button 
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()} 
        className={`p-2 rounded-lg transition-colors ${editor.isActive('bulletList') ? 'bg-historia-blue text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'}`} 
        title="Liste à puces"
      >
        <List className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-slate-300 mx-1"></div>

      <button 
        type="button"
        onClick={addImageFromUrl} 
        className="p-2 rounded-lg text-historia-blue hover:bg-blue-50 transition-colors" 
        title="Insérer image via URL"
      >
        <ImageIcon className="w-4 h-4" />
      </button>
      
      <label 
        className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 cursor-pointer flex items-center justify-center transition-colors" 
        title="Téléverser une image (WebP automatique)"
      >
        {isUploadingImage ? <Loader2 className="w-4 h-4 animate-spin text-amber-600" /> : <ImagePlus className="w-4 h-4" />}
        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={isUploadingImage} />
      </label>
    </div>
  );
};

export default function AdminPanel() {
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Mode de vue : 'overview' (Synthèse globale) ou 'editor' (Studio d'Édition d'un chapitre)
  const [viewMode, setViewMode] = useState(searchParams.get('mode') || (searchParams.get('chapter') ? 'editor' : 'overview'));

  // Navigation par onglets dans l'éditeur (Leçon, Frise, Quiz, Art, Vidéo)
  const activeTab = searchParams.get('tab') || 'lesson';
  const setActiveTab = (tab) => {
    setSearchParams({ mode: 'editor', epoch: selectedEpochId, chapter: selectedChapterId, tab });
  };

  // Listes et Sélections
  const [epochs, setEpochs] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedEpochId, setSelectedEpochId] = useState(searchParams.get('epoch') || '');
  const [selectedChapterId, setSelectedChapterId] = useState(searchParams.get('chapter') || '');

  // -------------------------------------------------------------
  // ÉTAT DE LA SYNTHÈSE / TABLEAU DE BORD
  // -------------------------------------------------------------
  const [synthesisData, setSynthesisData] = useState([]);
  const [isLoadingSynthesis, setIsLoadingSynthesis] = useState(false);
  const [synthesisFilterEpoch, setSynthesisFilterEpoch] = useState('all');
  const [synthesisSearch, setSynthesisSearch] = useState('');

  // États de chargement & notification
  const [isLoadingChapters, setIsLoadingChapters] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // -------------------------------------------------------------
  // ÉTAT DE L'ONGLET 1 : LEÇON & COMPTEUR DE CARACTÈRES
  // -------------------------------------------------------------
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterOrder, setChapterOrder] = useState(1);
  const [chapterMapUrl, setChapterMapUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [editorTextLength, setEditorTextLength] = useState(0);
  const [editorWordCount, setEditorWordCount] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true
      })
    ],
    content: '',
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      setEditorTextLength(text.length);
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setEditorWordCount(words);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none focus:outline-none min-h-[450px] px-6 py-4'
      }
    }
  });

  // -------------------------------------------------------------
  // ÉTAT DE L'ONGLET 2 : FRISE CHRONOLOGIQUE
  // -------------------------------------------------------------
  const [timelineEvents, setTimelineEvents] = useState([]);

  // -------------------------------------------------------------
  // ÉTAT DE L'ONGLET 3 : QUIZ
  // -------------------------------------------------------------
  const [quizId, setQuizId] = useState(null);
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState([]);
  const [editingQuestionIdx, setEditingQuestionIdx] = useState(null);
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A',
    explanation: ''
  });

  // -------------------------------------------------------------
  // ÉTAT DE L'ONGLET 4 : ART & ANNEXES AVEC GESTION DES IMAGES
  // -------------------------------------------------------------
  const [annexes, setAnnexes] = useState([]);
  const [editingAnnexIdx, setEditingAnnexIdx] = useState(null);
  const [isUploadingAnnexImage, setIsUploadingAnnexImage] = useState(false);
  const [newAnnex, setNewAnnex] = useState({
    title: '',
    type: 'Fossile',
    century: '',
    image_url: '',
    content: '',
    gallery: []
  });

  // -------------------------------------------------------------
  // ÉTAT DE L'ONGLET 5 : VIDÉOS YOUTUBE
  // -------------------------------------------------------------
  const [videos, setVideos] = useState([]);
  const [editingVideoIdx, setEditingVideoIdx] = useState(null);
  const [newVideo, setNewVideo] = useState({
    title: '',
    url: '',
    description: ''
  });

  // --- CHARGEMENT INITIAL DES ÉPOQUES & DE LA SYNTHÈSE ---
  useEffect(() => {
    fetchEpochs();
    fetchSynthesisData();
  }, []);

  // --- CHARGEMENT DES CHAPITRES QUAND L'ÉPOQUE CHANGE ---
  useEffect(() => {
    if (selectedEpochId) {
      fetchChapters(selectedEpochId);
    } else {
      setChapters([]);
      setSelectedChapterId('');
    }
  }, [selectedEpochId]);

  // --- CHARGEMENT DU CONTENU COMPLET DU CHAPITRE SÉLECTIONNÉ ---
  useEffect(() => {
    if (selectedChapterId) {
      loadChapterFullData(selectedChapterId);
      if (viewMode === 'editor') {
        setSearchParams({ mode: 'editor', epoch: selectedEpochId, chapter: selectedChapterId, tab: activeTab });
      }
    }
  }, [selectedChapterId, viewMode]);

  // Récupérer la liste des époques
  async function fetchEpochs() {
    try {
      const { data, error } = await supabase.from('epochs').select('id, title, "order"').order('order');
      if (error) throw error;
      if (data && data.length > 0) {
        setEpochs(data);
        if (!selectedEpochId) {
          setSelectedEpochId(data[0].id);
        }
      }
    } catch (err) {
      console.error("Erreur époques :", err);
    }
  }

  // Récupérer les données complètes de synthèse pour le tableau de bord
  async function fetchSynthesisData() {
    setIsLoadingSynthesis(true);
    try {
      const [epRes, chapRes, quizRes, questionRes, annexRes, videoRes] = await Promise.all([
        supabase.from('epochs').select('id, title, "order"').order('order'),
        supabase.from('chapters').select('id, title, "order", epoch_id, content, timeline_data').order('order'),
        supabase.from('quizzes').select('id, chapter_id'),
        supabase.from('questions').select('id, quiz_id'),
        supabase.from('annexes').select('id, chapter_id'),
        supabase.from('videos').select('id, chapter_id')
      ]);

      const epochMap = {};
      (epRes.data || []).forEach(ep => {
        epochMap[ep.id] = ep;
      });

      const quizMap = {};
      (quizRes.data || []).forEach(q => { quizMap[q.id] = q.chapter_id; });

      const questionCountByChapter = {};
      (questionRes.data || []).forEach(qn => {
        const cId = quizMap[qn.quiz_id];
        if (cId) questionCountByChapter[cId] = (questionCountByChapter[cId] || 0) + 1;
      });

      const annexCountByChapter = {};
      (annexRes.data || []).forEach(a => {
        annexCountByChapter[a.chapter_id] = (annexCountByChapter[a.chapter_id] || 0) + 1;
      });

      const videoCountByChapter = {};
      (videoRes.data || []).forEach(v => {
        videoCountByChapter[v.chapter_id] = (videoCountByChapter[v.chapter_id] || 0) + 1;
      });

      const enriched = (chapRes.data || []).map(chap => {
        const cleanText = chap.content ? chap.content.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim() : '';
        const ep = epochMap[chap.epoch_id];
        return {
          ...chap,
          epochOrder: ep ? ep.order : 999,
          epochTitle: ep ? ep.title : 'Époque',
          charCount: cleanText.length,
          rawHtmlLength: chap.content ? chap.content.length : 0,
          datesCount: Array.isArray(chap.timeline_data) ? chap.timeline_data.length : 0,
          quizCount: questionCountByChapter[chap.id] || 0,
          annexCount: annexCountByChapter[chap.id] || 0,
          videoCount: videoCountByChapter[chap.id] || 0
        };
      });

      // Tri rigoureux : 1. Ordre de l'Époque (1, 2, 3...), 2. Ordre du Chapitre (1, 2, 3...)
      enriched.sort((a, b) => {
        if (a.epochOrder !== b.epochOrder) {
          return a.epochOrder - b.epochOrder;
        }
        return (a.order || 0) - (b.order || 0);
      });

      setSynthesisData(enriched);
    } catch (err) {
      console.error("Erreur chargement synthèse :", err);
    } finally {
      setIsLoadingSynthesis(false);
    }
  }

  // Récupérer la liste des chapitres pour l'époque choisie
  async function fetchChapters(epochId) {
    setIsLoadingChapters(true);
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('id, title, "order", epoch_id')
        .eq('epoch_id', epochId)
        .order('order');
      if (error) throw error;
      setChapters(data || []);
      if (data && data.length > 0) {
        if (!data.some(c => c.id === selectedChapterId)) {
          setSelectedChapterId(data[0].id);
        }
      } else {
        setSelectedChapterId('');
        resetAllFields();
      }
    } catch (err) {
      console.error("Erreur chapitres :", err);
    } finally {
      setIsLoadingChapters(false);
    }
  }

  // Charger toutes les données du chapitre sélectionné (Leçon, Frise, Quiz, Art, Vidéos)
  async function loadChapterFullData(chapterId) {
    setStatusMessage({ type: '', text: '' });
    setEditingAnnexIdx(null);
    setEditingQuestionIdx(null);
    setEditingVideoIdx(null);
    try {
      // 1. Leçon & Frise
      const { data: chapData, error: chapErr } = await supabase
        .from('chapters')
        .select('*')
        .eq('id', chapterId)
        .single();
      
      if (chapErr) throw chapErr;

      if (chapData) {
        setChapterTitle(chapData.title || '');
        setChapterOrder(chapData.order || 1);
        setChapterMapUrl(chapData.map_url || '');
        setTimelineEvents(Array.isArray(chapData.timeline_data) ? chapData.timeline_data : []);
        if (editor) {
          editor.commands.setContent(chapData.content || '');
          const text = editor.getText();
          setEditorTextLength(text.length);
          const words = text.trim() ? text.trim().split(/\s+/).length : 0;
          setEditorWordCount(words);
        }
      }

      // 2. Quiz & Questions
      const { data: quizData } = await supabase
        .from('quizzes')
        .select('id, title')
        .eq('chapter_id', chapterId)
        .maybeSingle();

      if (quizData) {
        setQuizId(quizData.id);
        setQuizTitle(quizData.title || `Quiz : ${chapData.title}`);
        const { data: qList } = await supabase
          .from('questions')
          .select('*')
          .eq('quiz_id', quizData.id)
          .order('id');
        setQuestions(qList || []);
      } else {
        setQuizId(null);
        setQuizTitle(`Quiz : ${chapData.title}`);
        setQuestions([]);
      }

      // 3. Annexes d'Art
      const { data: annexData } = await supabase
        .from('annexes')
        .select('*')
        .eq('chapter_id', chapterId)
        .order('id');
      
      const normalizedAnnexes = (annexData || []).map(a => ({
        id: a.id,
        title: a.title || '',
        type: a.type || 'Fossile',
        content: a.content || '',
        century: a.artworks?.century || '',
        image_url: a.artworks?.image_url || '',
        gallery: Array.isArray(a.artworks?.gallery) ? a.artworks.gallery : []
      }));
      setAnnexes(normalizedAnnexes);

      // 4. Vidéos YouTube
      const { data: videoData } = await supabase
        .from('videos')
        .select('*')
        .eq('chapter_id', chapterId)
        .order('id');
      setVideos(videoData || []);

    } catch (err) {
      console.error("Erreur chargement global du chapitre :", err);
      setStatusMessage({ type: 'error', text: "Erreur lors du chargement des données du chapitre." });
    }
  }

  function resetAllFields() {
    setChapterTitle('');
    setChapterOrder(1);
    setChapterMapUrl('');
    setTimelineEvents([]);
    if (editor) editor.commands.setContent('');
    setEditorTextLength(0);
    setEditorWordCount(0);
    setQuizId(null);
    setQuizTitle('');
    setQuestions([]);
    setAnnexes([]);
    setVideos([]);
  }

  // --- RÉORDONNEMENT D'ÉLÉMENTS DANS LES LISTES ---
  const moveItem = (list, setList, index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= list.length) return;
    const updated = [...list];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    setList(updated);
  };

  // --- COMPRESSION ET UPLOAD D'IMAGE ---
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Erreur compression image"));
        }, 'image/webp', 0.85);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Fichier image non valide"));
      };
      img.src = objectUrl;
    });
  };

  const handleLessonImageUpload = async (file) => {
    setIsUploadingImage(true);
    setStatusMessage({ type: 'info', text: "Compression et téléversement de l'image..." });
    try {
      const compressedBlob = await compressImage(file);
      const fileName = `lesson_${selectedChapterId}_${Date.now()}.webp`;
      const filePath = `lessons/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('historia-images')
        .upload(filePath, compressedBlob, { contentType: 'image/webp', upsert: false });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage.from('historia-images').getPublicUrl(filePath);
      if (editor && publicData?.publicUrl) {
        editor.chain().focus().setImage({ src: publicData.publicUrl }).run();
        setStatusMessage({ type: 'success', text: "Image insérée avec succès dans la leçon !" });
      }
    } catch (err) {
      console.error("Erreur upload image leçon :", err);
      setStatusMessage({ type: 'error', text: "Échec du téléversement de l'image." });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAnnexImageUpload = async (file, isMain = true, galleryIdx = null) => {
    setIsUploadingAnnexImage(true);
    setStatusMessage({ type: 'info', text: "Compression et téléversement de l'image..." });
    try {
      const compressedBlob = await compressImage(file);
      const fileName = `annex_${selectedChapterId}_${Date.now()}_${Math.random().toString(36).substring(7)}.webp`;
      const filePath = `annexes/uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('historia-images')
        .upload(filePath, compressedBlob, { contentType: 'image/webp', upsert: false });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage.from('historia-images').getPublicUrl(filePath);
      const uploadedUrl = publicData?.publicUrl;

      if (uploadedUrl) {
        if (isMain) {
          setNewAnnex(prev => ({ ...prev, image_url: uploadedUrl }));
        } else if (galleryIdx !== null) {
          const updatedGallery = [...newAnnex.gallery];
          updatedGallery[galleryIdx] = uploadedUrl;
          setNewAnnex(prev => ({ ...prev, gallery: updatedGallery }));
        } else {
          setNewAnnex(prev => ({ ...prev, gallery: [...prev.gallery, uploadedUrl] }));
        }
        setStatusMessage({ type: 'success', text: "Image téléversée avec succès !" });
      }
    } catch (err) {
      console.error("Erreur upload image annexe :", err);
      setStatusMessage({ type: 'error', text: "Échec du téléversement de l'image." });
    } finally {
      setIsUploadingAnnexImage(false);
    }
  };

  // --- ACTIONS DE SAUVEGARDE PAR ONGLET ---

  // 1. Sauvegarder la Leçon
  const handleSaveLesson = async () => {
    if (!selectedChapterId) return;
    setIsSaving(true);
    setStatusMessage({ type: '', text: '' });
    try {
      const htmlContent = editor ? editor.getHTML() : '';
      const { error } = await supabase.from('chapters').update({
        title: chapterTitle,
        order: parseInt(chapterOrder, 10),
        map_url: chapterMapUrl || null,
        content: htmlContent
      }).eq('id', selectedChapterId);

      if (error) throw error;
      setStatusMessage({ type: 'success', text: "Leçon enregistrée avec succès !" });
      fetchChapters(selectedEpochId);
      fetchSynthesisData();
    } catch (err) {
      console.error("Erreur sauvegarde leçon :", err);
      setStatusMessage({ type: 'error', text: "Échec de l'enregistrement de la leçon." });
    } finally {
      setIsSaving(false);
    }
  };

  // 2. Sauvegarder la Frise Chronologique
  const handleSaveTimeline = async () => {
    if (!selectedChapterId) return;
    setIsSaving(true);
    setStatusMessage({ type: '', text: '' });
    try {
      const { error } = await supabase.from('chapters').update({
        timeline_data: timelineEvents
      }).eq('id', selectedChapterId);

      if (error) throw error;
      setStatusMessage({ type: 'success', text: "Frise chronologique enregistrée avec succès !" });
      fetchSynthesisData();
    } catch (err) {
      console.error("Erreur sauvegarde frise :", err);
      setStatusMessage({ type: 'error', text: "Échec de l'enregistrement de la frise." });
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Sauvegarder le Quiz et ses Questions
  const handleSaveQuiz = async () => {
    if (!selectedChapterId) return;
    setIsSaving(true);
    setStatusMessage({ type: '', text: '' });
    try {
      let currentQuizId = quizId;
      if (!currentQuizId) {
        const { data: newQ, error: createQErr } = await supabase
          .from('quizzes')
          .insert({ chapter_id: selectedChapterId, title: quizTitle || `Quiz : ${chapterTitle}` })
          .select('id')
          .single();
        if (createQErr) throw createQErr;
        currentQuizId = newQ.id;
        setQuizId(currentQuizId);
      } else {
        await supabase.from('quizzes').update({ title: quizTitle }).eq('id', currentQuizId);
      }

      await supabase.from('questions').delete().eq('quiz_id', currentQuizId);
      if (questions.length > 0) {
        const toInsert = questions.map(q => ({
          quiz_id: currentQuizId,
          question_text: q.question_text,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          correct_option: q.correct_option,
          explanation: q.explanation || ''
        }));
        const { error: insErr } = await supabase.from('questions').insert(toInsert);
        if (insErr) throw insErr;
      }

      setStatusMessage({ type: 'success', text: `Quiz (${questions.length} questions) enregistré avec succès !` });
      fetchSynthesisData();
    } catch (err) {
      console.error("Erreur sauvegarde quiz :", err);
      setStatusMessage({ type: 'error', text: "Échec de l'enregistrement du quiz." });
    } finally {
      setIsSaving(false);
    }
  };

  // 4. Sauvegarder les Annexes d'Art
  const handleSaveAnnexes = async () => {
    if (!selectedChapterId) return;
    setIsSaving(true);
    setStatusMessage({ type: '', text: '' });
    try {
      await supabase.from('annexes').delete().eq('chapter_id', selectedChapterId);
      if (annexes.length > 0) {
        const toInsert = annexes.map(a => ({
          chapter_id: selectedChapterId,
          title: a.title,
          type: a.type || 'Fossile',
          content: a.content || '',
          artworks: {
            image_url: a.image_url || '',
            century: a.century || '',
            gallery: Array.isArray(a.gallery) ? a.gallery.filter(Boolean) : []
          }
        }));
        const { error } = await supabase.from('annexes').insert(toInsert);
        if (error) throw error;
      }
      setStatusMessage({ type: 'success', text: `Galerie d'Art (${annexes.length} œuvres) enregistrée avec succès !` });
      fetchSynthesisData();
    } catch (err) {
      console.error("Erreur sauvegarde annexes :", err);
      setStatusMessage({ type: 'error', text: "Échec de l'enregistrement des reliques d'art." });
    } finally {
      setIsSaving(false);
    }
  };

  // 5. Sauvegarder les Vidéos
  const handleSaveVideos = async () => {
    if (!selectedChapterId) return;
    setIsSaving(true);
    setStatusMessage({ type: '', text: '' });
    try {
      await supabase.from('videos').delete().eq('chapter_id', selectedChapterId);
      if (videos.length > 0) {
        const toInsert = videos.map(v => ({
          chapter_id: selectedChapterId,
          title: v.title,
          url: v.url,
          description: v.description || ''
        }));
        const { error } = await supabase.from('videos').insert(toInsert);
        if (error) throw error;
      }
      setStatusMessage({ type: 'success', text: `Vidéos (${videos.length}) enregistrées avec succès !` });
      fetchSynthesisData();
    } catch (err) {
      console.error("Erreur sauvegarde vidéos :", err);
      setStatusMessage({ type: 'error', text: "Échec de l'enregistrement des vidéos." });
    } finally {
      setIsSaving(false);
    }
  };

  // Helpers pour extraction YouTube
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  // Map des ordres d'époques pour garantie absolue de tri
  const epochOrderMap = epochs.reduce((acc, ep) => {
    acc[ep.id] = Number(ep.order || 999);
    return acc;
  }, {});

  // Filtrage ET Tri strict des données de synthèse : 1. Époque (1, 2, 3...) puis 2. Chapitre (1, 2, 3... 20)
  const filteredSynthesis = [...synthesisData]
    .filter(item => {
      const matchesEpoch = synthesisFilterEpoch === 'all' || item.epoch_id === synthesisFilterEpoch;
      const matchesSearch = synthesisSearch === '' || 
        item.title.toLowerCase().includes(synthesisSearch.toLowerCase()) || 
        String(item.order).includes(synthesisSearch);
      return matchesEpoch && matchesSearch;
    })
    .sort((a, b) => {
      const epOrderA = Number(a.epochOrder ?? epochOrderMap[a.epoch_id] ?? 999);
      const epOrderB = Number(b.epochOrder ?? epochOrderMap[b.epoch_id] ?? 999);
      if (epOrderA !== epOrderB) {
        return epOrderA - epOrderB;
      }
      return Number(a.order || 0) - Number(b.order || 0);
    });

  // Totaux statistiques calculés sur les données filtrées
  const totalStats = filteredSynthesis.reduce((acc, curr) => ({
    chapters: acc.chapters + 1,
    chars: acc.chars + curr.charCount,
    dates: acc.dates + curr.datesCount,
    quiz: acc.quiz + curr.quizCount,
    art: acc.art + curr.annexCount,
    videos: acc.videos + curr.videoCount
  }), { chapters: 0, chars: 0, dates: 0, quiz: 0, art: 0, videos: 0 });

  // Ouvrir un chapitre directement dans l'éditeur depuis le tableau de bord
  const handleOpenChapterInEditor = (chapter) => {
    setSelectedEpochId(chapter.epoch_id);
    setSelectedChapterId(chapter.id);
    setViewMode('editor');
    setSearchParams({ mode: 'editor', epoch: chapter.epoch_id, chapter: chapter.id, tab: 'lesson' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* HEADER DE L'ADMINISTRATION & SÉLECTEUR DE MODE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-serif font-bold text-historia-blue">Tableau de Bord & Administration</h1>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              {profile?.role || 'Admin'}
            </span>
          </div>
          <p className="text-slate-600 text-sm mt-1">
            Supervisez les volumes littéraires, quiz, frises et reliques, et éditez chaque chapitre en direct.
          </p>
        </div>

        {/* BOUTONS DE BASCULEMENT DE VUE (SYNTHÈSE vs ÉDITEUR) */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setViewMode('overview');
              setSearchParams({ mode: 'overview' });
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              viewMode === 'overview'
                ? 'bg-white text-historia-blue shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-historia-gold" />
            <span>📊 Synthèse & Tableaux</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setViewMode('editor');
              if (selectedChapterId) {
                setSearchParams({ mode: 'editor', epoch: selectedEpochId, chapter: selectedChapterId, tab: activeTab });
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              viewMode === 'editor'
                ? 'bg-white text-historia-blue shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit2 className="w-4 h-4 text-historia-blue" />
            <span>✏️ Studio d'Édition</span>
          </button>
        </div>
      </div>

      {/* NOTIFICATION D'ÉTAT GLOBALE */}
      {statusMessage.text && (
        <div className={`p-4 rounded-xl mb-6 flex items-center justify-between text-sm font-medium transition-all ${
          statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
          statusMessage.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage({ type: '', text: '' })} className="text-slate-400 hover:text-slate-600 text-xs uppercase font-bold">
            Fermer
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VUE 1 : PAGE DE SYNTHÈSE & TABLEAU DE BORD PAR ÉPOQUE                     */}
      {/* ========================================================================= */}
      {viewMode === 'overview' && (
        <div className="space-y-8">
          
          {/* CARTES STATISTIQUES RÉCAPITULATIVES */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                <BookOpen className="w-4 h-4 text-historia-blue" /> Chapitres
              </div>
              <p className="text-2xl font-bold text-historia-blue">{totalStats.chapters}</p>
              <span className="text-[11px] text-slate-400">Total répertorié</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                <FileCheck className="w-4 h-4 text-historia-gold" /> Caractères
              </div>
              <p className="text-2xl font-bold text-amber-700">{totalStats.chars.toLocaleString('fr-FR')}</p>
              <span className="text-[11px] text-slate-400">Volume brut total</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                <Clock className="w-4 h-4 text-amber-600" /> Frise
              </div>
              <p className="text-2xl font-bold text-slate-800">{totalStats.dates}</p>
              <span className="text-[11px] text-slate-400">Dates chronologiques</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                <FileText className="w-4 h-4 text-emerald-600" /> Quiz
              </div>
              <p className="text-2xl font-bold text-emerald-700">{totalStats.quiz}</p>
              <span className="text-[11px] text-slate-400">Questions QCM</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4 text-purple-600" /> Reliques & Art
              </div>
              <p className="text-2xl font-bold text-purple-800">{totalStats.art}</p>
              <span className="text-[11px] text-slate-400">Œuvres & fossiles</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                <Video className="w-4 h-4 text-green-600" /> Vidéos
              </div>
              <p className="text-2xl font-bold text-green-800">{totalStats.videos}</p>
              <span className="text-[11px] text-slate-400">Liens YouTube</span>
            </div>
          </div>

          {/* BARRE DE FILTRES : SÉLECTION PAR ÉPOQUE & RECHERCHE */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Filtres par Époque (Pills) */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSynthesisFilterEpoch('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  synthesisFilterEpoch === 'all'
                    ? 'bg-historia-blue text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Toutes les époques ({synthesisData.length})
              </button>
              
              {epochs.map(ep => {
                const count = synthesisData.filter(c => c.epoch_id === ep.id).length;
                return (
                  <button
                    key={ep.id}
                    type="button"
                    onClick={() => setSynthesisFilterEpoch(ep.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      synthesisFilterEpoch === ep.id
                        ? 'bg-historia-gold text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Époque {ep.order} : {ep.title} ({count})
                  </button>
                );
              })}
            </div>

            {/* Barre de recherche */}
            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Rechercher un chapitre..."
                value={synthesisSearch}
                onChange={(e) => setSynthesisSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-historia-gold"
              />
              {synthesisSearch && (
                <button onClick={() => setSynthesisSearch('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>

          {/* TABLEAU DE SYNTHÈSE COMPLET */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-historia-blue">Tableau Synthétique des Chapitres</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cliquez sur n'importe quel chapitre ou sur le bouton "Éditer" pour ouvrir son studio d'édition complet.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchSynthesisData}
                disabled={isLoadingSynthesis}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSynthesis ? 'animate-spin' : ''}`} />
                <span>Actualiser</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-12 text-center">#</th>
                    <th className="py-3.5 px-4 min-w-[280px]">Titre du Chapitre</th>
                    <th className="py-3.5 px-4 min-w-[150px]">Époque</th>
                    <th className="py-3.5 px-4 text-right">Volume Leçon</th>
                    <th className="py-3.5 px-4 text-center">Frise</th>
                    <th className="py-3.5 px-4 text-center">Quiz</th>
                    <th className="py-3.5 px-4 text-center">Reliques & Art</th>
                    <th className="py-3.5 px-4 text-center">Vidéos</th>
                    <th className="py-3.5 px-4 text-center w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredSynthesis.map((chap, idx) => {
                    const prevChap = idx > 0 ? filteredSynthesis[idx - 1] : null;
                    const isNewEpoch = !prevChap || prevChap.epoch_id !== chap.epoch_id;
                    const epochInfo = epochs.find(e => e.id === chap.epoch_id) || { order: chap.epochOrder, title: chap.epochTitle };

                    return (
                      <React.Fragment key={chap.id}>
                        {isNewEpoch && synthesisFilterEpoch === 'all' && (
                          <tr className="bg-slate-100/90 border-y-2 border-slate-300">
                            <td colSpan={9} className="py-2.5 px-4">
                              <div className="flex items-center justify-between">
                                <span className="font-bold font-serif text-historia-blue text-sm flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-full bg-historia-gold text-white flex items-center justify-center text-xs font-sans font-bold shadow-xs">
                                    {epochInfo.order}
                                  </span>
                                  Époque {epochInfo.order} : {epochInfo.title}
                                </span>
                                <span className="text-xs text-slate-500 font-semibold bg-white px-2.5 py-1 rounded-full border border-slate-200">
                                  {filteredSynthesis.filter(c => c.epoch_id === chap.epoch_id).length} chapitres
                                </span>
                              </div>
                            </td>
                          </tr>
                        )}
                        <tr 
                          className="hover:bg-amber-50/40 transition-colors group cursor-pointer"
                          onClick={() => handleOpenChapterInEditor(chap)}
                        >
                          <td className="py-3 px-4 text-center font-bold text-slate-400">
                            {chap.order}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-historia-blue group-hover:text-amber-800 transition-colors text-sm">
                              {chap.title}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold">
                              Ép. {epochInfo.order} : {epochInfo.title}
                            </span>
                          </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-bold text-slate-800">
                              {chap.charCount.toLocaleString('fr-FR')} car.
                            </span>
                            {chap.charCount >= 50000 ? (
                              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                                ✨ Monumental (50k+)
                              </span>
                            ) : chap.charCount >= 15000 ? (
                              <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded">
                                📜 Format Long
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">
                                Format Standard
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-xs ${chap.datesCount >= 10 ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-600'}`}>
                            🕒 {chap.datesCount}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-xs ${chap.quizCount >= 20 ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-100 text-slate-600'}`}>
                            📄 {chap.quizCount}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-xs ${chap.annexCount >= 10 ? 'bg-purple-100 text-purple-900' : 'bg-slate-100 text-slate-600'}`}>
                            ✨ {chap.annexCount}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-xs ${chap.videoCount > 0 ? 'bg-green-100 text-green-900' : 'bg-slate-100 text-slate-400'}`}>
                            🎥 {chap.videoCount}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenChapterInEditor(chap)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold transition-all"
                              title="Éditer ce chapitre"
                            >
                              <Edit2 className="w-3.5 h-3.5" /> Éditer
                            </button>
                            <Link
                              to={`/lesson/${chap.id}`}
                              target="_blank"
                              className="p-1 text-slate-400 hover:text-historia-blue rounded hover:bg-slate-100 transition-colors"
                              title="Voir la page publique"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}

                  {filteredSynthesis.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400 italic">
                        Aucun chapitre ne correspond aux critères de filtre.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VUE 2 : STUDIO D'ÉDITION MULTI-ONGLETS                                    */}
      {/* ========================================================================= */}
      {viewMode === 'editor' && (
        <div className="space-y-6">

          {/* BARRE DE RETOUR À LA SYNTHÈSE & SÉLECTION D'ÉPOQUE / CHAPITRE */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setViewMode('overview');
                  setSearchParams({ mode: 'overview' });
                }}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-historia-blue bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-all w-fit"
              >
                <ArrowLeft className="w-4 h-4" /> ← Retour à la Synthèse globale
              </button>

              {selectedChapterId && (
                <div className="flex items-center gap-2">
                  <Link 
                    to={`/lesson/${selectedChapterId}`} 
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-historia-blue font-bold rounded-lg text-xs transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Voir la leçon sur le site ↗
                  </Link>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sélecteur d'Époque */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  1. Époque Historique
                </label>
                <div className="relative">
                  <select
                    value={selectedEpochId}
                    onChange={(e) => setSelectedEpochId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 font-semibold focus:ring-2 focus:ring-historia-gold focus:outline-none appearance-none cursor-pointer pr-10"
                  >
                    {epochs.map(ep => (
                      <option key={ep.id} value={ep.id}>
                        Époque {ep.order} : {ep.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Sélecteur de Chapitre */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  2. Chapitre à Éditer
                </label>
                <div className="relative">
                  <select
                    value={selectedChapterId}
                    onChange={(e) => setSelectedChapterId(e.target.value)}
                    disabled={isLoadingChapters || chapters.length === 0}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 font-semibold focus:ring-2 focus:ring-historia-gold focus:outline-none appearance-none cursor-pointer pr-10 disabled:opacity-50"
                  >
                    {chapters.length === 0 ? (
                      <option value="">Aucun chapitre pour cette époque</option>
                    ) : (
                      chapters.map(c => (
                        <option key={c.id} value={c.id}>
                          Chapitre {c.order} : {c.title}
                        </option>
                      ))
                    )}
                  </select>
                  <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {selectedChapterId ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              
              {/* BARRE D'ONGLETS UNIFIÉE */}
              <div className="flex border-b border-slate-200 bg-slate-50/50 overflow-x-auto hide-scrollbar">
                
                {/* Onglet 1 : Leçon */}
                <button
                  type="button"
                  onClick={() => setActiveTab('lesson')}
                  className={`flex items-center gap-2 px-6 py-4 font-bold text-sm sm:text-base border-b-4 transition-all whitespace-nowrap ${
                    activeTab === 'lesson'
                      ? 'bg-yellow-50/80 text-historia-gold border-historia-gold'
                      : 'text-slate-500 hover:text-historia-gold hover:bg-slate-100/50 border-transparent'
                  }`}
                >
                  <BookOpen className="w-5 h-5" /> Leçon
                </button>

                {/* Onglet 2 : Frise */}
                <button
                  type="button"
                  onClick={() => setActiveTab('timeline')}
                  className={`flex items-center gap-2 px-6 py-4 font-bold text-sm sm:text-base border-b-4 transition-all whitespace-nowrap ${
                    activeTab === 'timeline'
                      ? 'bg-yellow-50/80 text-historia-gold border-historia-gold'
                      : 'text-slate-500 hover:text-historia-gold hover:bg-slate-100/50 border-transparent'
                  }`}
                >
                  <Clock className="w-5 h-5" /> Frise ({timelineEvents.length})
                </button>

                {/* Onglet 3 : Quiz */}
                <button
                  type="button"
                  onClick={() => setActiveTab('quiz')}
                  className={`flex items-center gap-2 px-6 py-4 font-bold text-sm sm:text-base border-b-4 transition-all whitespace-nowrap ${
                    activeTab === 'quiz'
                      ? 'bg-yellow-50/80 text-historia-gold border-historia-gold'
                      : 'text-slate-500 hover:text-historia-gold hover:bg-slate-100/50 border-transparent'
                  }`}
                >
                  <FileText className="w-5 h-5" /> Quiz ({questions.length})
                </button>

                {/* Onglet 4 : Art */}
                <button
                  type="button"
                  onClick={() => setActiveTab('art')}
                  className={`flex items-center gap-2 px-6 py-4 font-bold text-sm sm:text-base border-b-4 transition-all whitespace-nowrap ${
                    activeTab === 'art'
                      ? 'bg-yellow-50/80 text-historia-gold border-historia-gold'
                      : 'text-slate-500 hover:text-historia-gold hover:bg-slate-100/50 border-transparent'
                  }`}
                >
                  <Sparkles className="w-5 h-5" /> Art ({annexes.length})
                </button>

                {/* Onglet 5 : Vidéo */}
                <button
                  type="button"
                  onClick={() => setActiveTab('video')}
                  className={`flex items-center gap-2 px-6 py-4 font-bold text-sm sm:text-base border-b-4 transition-all whitespace-nowrap ${
                    activeTab === 'video'
                      ? 'bg-yellow-50/80 text-historia-gold border-historia-gold'
                      : 'text-slate-500 hover:text-historia-gold hover:bg-slate-100/50 border-transparent'
                  }`}
                >
                  <Video className="w-5 h-5" /> Vidéo ({videos.length})
                </button>

              </div>

              {/* CONTENU DE L'ONGLET ACTIF */}
              <div className="p-6 md:p-8">

                {/* ========================================================= */}
                {/* ONGLET 1 : ÉDITEUR DE LEÇON & COMPTEUR DE CARACTÈRES      */}
                {/* ========================================================= */}
                {activeTab === 'lesson' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-3">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          Titre du Chapitre
                        </label>
                        <input
                          type="text"
                          value={chapterTitle}
                          onChange={(e) => setChapterTitle(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-historia-blue focus:ring-2 focus:ring-historia-gold focus:outline-none"
                          placeholder="Ex: Chapitre 1 : L'Aube de l'Humanité"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          Numéro / Ordre
                        </label>
                        <input
                          type="number"
                          value={chapterOrder}
                          onChange={(e) => setChapterOrder(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-historia-gold focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        URL de la Carte Interactive (Optionnel)
                      </label>
                      <input
                        type="url"
                        value={chapterMapUrl}
                        onChange={(e) => setChapterMapUrl(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-historia-gold focus:outline-none"
                        placeholder="https://... (laisser vide si aucune carte)"
                      />
                    </div>

                    {/* Éditeur de texte riche Tiptap */}
                    <div className="border border-slate-300 rounded-2xl overflow-hidden bg-white shadow-inner">
                      <TiptapMenuBar 
                        editor={editor} 
                        onImageUpload={handleLessonImageUpload} 
                        isUploadingImage={isUploadingImage} 
                      />
                      <EditorContent editor={editor} />
                      
                      {/* BARRE D'ÉTAT & COMPTEUR DE CARACTÈRES EN DIRECT */}
                      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 font-medium">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1.5 font-bold text-slate-800">
                            <FileCheck className="w-4 h-4 text-historia-gold" />
                            <span>Caractères : <strong className="text-historia-blue text-sm">{editorTextLength.toLocaleString('fr-FR')}</strong></span>
                          </span>
                          <span>Mots : <strong className="text-slate-800">{editorWordCount.toLocaleString('fr-FR')}</strong></span>
                        </div>

                        <div>
                          {editorTextLength >= 50000 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                              ✨ Standard Monumental Atteint (50 000+ car.)
                            </span>
                          ) : editorTextLength >= 20000 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold">
                              📜 Format Long ({editorTextLength.toLocaleString('fr-FR')} / 50 000)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 font-bold">
                              Format Standard ({editorTextLength.toLocaleString('fr-FR')} / 50 000)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bouton d'enregistrement Leçon */}
                    <div className="flex justify-end pt-4">
                      <button
                        type="button"
                        onClick={handleSaveLesson}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-historia-blue hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                      >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 text-historia-gold" />}
                        Enregistrer la Leçon
                      </button>
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* ONGLET 2 : FRISE CHRONOLOGIQUE                            */}
                {/* ========================================================= */}
                {activeTab === 'timeline' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-historia-blue">Événements de la Frise</h2>
                        <p className="text-slate-500 text-sm">Gérez les repères temporels clés affichés sur la frise du chapitre.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTimelineEvents([...timelineEvents, { year_label: '', title: '', description: '' }])}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 font-bold rounded-xl text-sm transition-colors"
                      >
                        <Plus className="w-4 h-4 text-amber-700" /> Ajouter une Date
                      </button>
                    </div>

                    <div className="space-y-4">
                      {timelineEvents.map((evt, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative group">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Date / Repère
                              </label>
                              <input
                                type="text"
                                value={evt.year_label || ''}
                                onChange={(e) => {
                                  const updated = [...timelineEvents];
                                  updated[idx].year_label = e.target.value;
                                  setTimelineEvents(updated);
                                }}
                                placeholder="Ex: v. 315 000 av. J.-C."
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold text-amber-700 text-sm focus:ring-2 focus:ring-historia-gold focus:outline-none"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Titre de l'événement
                              </label>
                              <input
                                type="text"
                                value={evt.title || ''}
                                onChange={(e) => {
                                  const updated = [...timelineEvents];
                                  updated[idx].title = e.target.value;
                                  setTimelineEvents(updated);
                                }}
                                placeholder="Ex: Découverte de Jebel Irhoud"
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold text-historia-blue text-sm focus:ring-2 focus:ring-historia-gold focus:outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Description historique
                            </label>
                            <textarea
                              rows={2}
                              value={evt.description || ''}
                              onChange={(e) => {
                                const updated = [...timelineEvents];
                                updated[idx].description = e.target.value;
                                setTimelineEvents(updated);
                              }}
                              placeholder="Explication détaillée de l'événement..."
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-historia-gold focus:outline-none"
                            />
                          </div>

                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200/60">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => moveItem(timelineEvents, setTimelineEvents, idx, 'up')}
                                disabled={idx === 0}
                                className="p-1.5 text-slate-500 hover:text-amber-800 hover:bg-amber-100 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                title="Monter cette date"
                              >
                                <ArrowUp className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveItem(timelineEvents, setTimelineEvents, idx, 'down')}
                                disabled={idx === timelineEvents.length - 1}
                                className="p-1.5 text-slate-500 hover:text-amber-800 hover:bg-amber-100 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                title="Descendre cette date"
                              >
                                <ArrowDown className="w-4 h-4" />
                              </button>
                              <span className="text-xs text-slate-400 font-semibold ml-1">Ordre #{idx + 1}</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => setTimelineEvents(timelineEvents.filter((_, i) => i !== idx))}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg font-bold transition-colors"
                              title="Supprimer cette date"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Supprimer
                            </button>
                          </div>
                        </div>
                      ))}

                      {timelineEvents.length === 0 && (
                        <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
                          <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                          <p>Aucune date dans la frise pour ce chapitre.</p>
                          <button
                            type="button"
                            onClick={() => setTimelineEvents([{ year_label: '', title: '', description: '' }])}
                            className="mt-3 text-amber-700 font-bold text-sm hover:underline"
                          >
                            + Ajouter un premier repère temporel
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="button"
                        onClick={handleSaveTimeline}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-historia-blue hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                      >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 text-historia-gold" />}
                        Enregistrer la Frise
                      </button>
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* ONGLET 3 : ÉDITEUR DE QUIZ                                */}
                {/* ========================================================= */}
                {activeTab === 'quiz' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Titre du Quiz
                      </label>
                      <input
                        type="text"
                        value={quizTitle}
                        onChange={(e) => setQuizTitle(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-historia-blue text-lg focus:ring-2 focus:ring-historia-gold focus:outline-none"
                        placeholder="Quiz du Chapitre"
                      />
                    </div>

                    {/* Formulaire d'ajout / modification d'une question */}
                    <div className={`p-5 rounded-2xl border transition-all ${editingQuestionIdx !== null ? 'bg-amber-50 border-amber-400 shadow-sm' : 'bg-amber-50/50 border-amber-200'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-historia-blue text-sm uppercase tracking-wider flex items-center gap-2">
                          {editingQuestionIdx !== null ? (
                            <>
                              <Edit2 className="w-4 h-4 text-amber-700" />
                              <span>Modifier la Question #{editingQuestionIdx + 1}</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 text-amber-600" />
                              <span>Ajouter une Question au Quiz</span>
                            </>
                          )}
                        </h3>
                        {editingQuestionIdx !== null && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingQuestionIdx(null);
                              setNewQuestion({ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A', explanation: '' });
                            }}
                            className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" /> Annuler la modification
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Intitulé de la question..."
                          value={newQuestion.question_text}
                          onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900 text-sm focus:ring-2 focus:ring-historia-gold focus:outline-none"
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold shrink-0">A</span>
                            <input
                              type="text"
                              placeholder="Option A..."
                              value={newQuestion.option_a}
                              onChange={(e) => setNewQuestion({ ...newQuestion, option_a: e.target.value })}
                              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-historia-gold focus:outline-none"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold shrink-0">B</span>
                            <input
                              type="text"
                              placeholder="Option B..."
                              value={newQuestion.option_b}
                              onChange={(e) => setNewQuestion({ ...newQuestion, option_b: e.target.value })}
                              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-historia-gold focus:outline-none"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold shrink-0">C</span>
                            <input
                              type="text"
                              placeholder="Option C..."
                              value={newQuestion.option_c}
                              onChange={(e) => setNewQuestion({ ...newQuestion, option_c: e.target.value })}
                              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-historia-gold focus:outline-none"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold shrink-0">D</span>
                            <input
                              type="text"
                              placeholder="Option D..."
                              value={newQuestion.option_d}
                              onChange={(e) => setNewQuestion({ ...newQuestion, option_d: e.target.value })}
                              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-historia-gold focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Bonne Réponse
                            </label>
                            <select
                              value={newQuestion.correct_option}
                              onChange={(e) => setNewQuestion({ ...newQuestion, correct_option: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold text-emerald-700 text-sm focus:ring-2 focus:ring-historia-gold focus:outline-none"
                            >
                              <option value="A">Option A</option>
                              <option value="B">Option B</option>
                              <option value="C">Option C</option>
                              <option value="D">Option D</option>
                            </select>
                          </div>
                          <div className="sm:col-span-3">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Explication Pédagogique
                            </label>
                            <input
                              type="text"
                              placeholder="Explication détaillée de la réponse..."
                              value={newQuestion.explanation}
                              onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-historia-gold focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end pt-2 gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              if (!newQuestion.question_text.trim()) return;
                              if (editingQuestionIdx !== null) {
                                const updated = [...questions];
                                updated[editingQuestionIdx] = { ...newQuestion };
                                setQuestions(updated);
                                setEditingQuestionIdx(null);
                              } else {
                                setQuestions([...questions, { ...newQuestion }]);
                              }
                              setNewQuestion({ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A', explanation: '' });
                            }}
                            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm shadow-sm transition-all"
                          >
                            {editingQuestionIdx !== null ? "💾 Mettre à jour cette question" : "+ Ajouter cette question"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Liste des questions existantes */}
                    <div className="space-y-4">
                      <h3 className="font-bold text-slate-800 text-base">
                        Questions enregistrées ({questions.length})
                      </h3>

                      {questions.map((q, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <span className="font-bold text-historia-blue text-sm">
                              {idx + 1}. {q.question_text}
                            </span>
                            
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => moveItem(questions, setQuestions, idx, 'up')}
                                disabled={idx === 0}
                                className="p-1.5 text-slate-500 hover:text-amber-800 hover:bg-amber-100 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                title="Monter cette question"
                              >
                                <ArrowUp className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveItem(questions, setQuestions, idx, 'down')}
                                disabled={idx === questions.length - 1}
                                className="p-1.5 text-slate-500 hover:text-amber-800 hover:bg-amber-100 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                title="Descendre cette question"
                              >
                                <ArrowDown className="w-4 h-4" />
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingQuestionIdx(idx);
                                  setNewQuestion({ ...q });
                                  window.scrollTo({ top: 400, behavior: 'smooth' });
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold transition-colors ml-1"
                                title="Modifier cette question"
                              >
                                <Edit2 className="w-3.5 h-3.5" /> Modifier
                              </button>
                              <button
                                type="button"
                                onClick={() => setQuestions(questions.filter((_, i) => i !== idx))}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold transition-colors"
                                title="Supprimer la question"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Supprimer
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-2">
                            <div className={`p-1.5 rounded ${q.correct_option === 'A' ? 'bg-emerald-100 text-emerald-900 font-bold' : 'bg-white'}`}>
                              A: {q.option_a}
                            </div>
                            <div className={`p-1.5 rounded ${q.correct_option === 'B' ? 'bg-emerald-100 text-emerald-900 font-bold' : 'bg-white'}`}>
                              B: {q.option_b}
                            </div>
                            <div className={`p-1.5 rounded ${q.correct_option === 'C' ? 'bg-emerald-100 text-emerald-900 font-bold' : 'bg-white'}`}>
                              C: {q.option_c}
                            </div>
                            <div className={`p-1.5 rounded ${q.correct_option === 'D' ? 'bg-emerald-100 text-emerald-900 font-bold' : 'bg-white'}`}>
                              D: {q.option_d}
                            </div>
                          </div>

                          {q.explanation && (
                            <p className="text-xs text-slate-500 italic bg-white p-2 rounded border border-slate-100">
                              💡 {q.explanation}
                            </p>
                          )}
                        </div>
                      ))}

                      {questions.length === 0 && (
                        <p className="text-center py-8 text-slate-400 text-sm">
                          Aucune question dans ce quiz pour le moment.
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="button"
                        onClick={handleSaveQuiz}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-historia-blue hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                      >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 text-historia-gold" />}
                        Enregistrer le Quiz
                      </button>
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* ONGLET 4 : ÉDITEUR D'ART & RELIQUES (AVEC IMAGES & GALERIE)*/}
                {/* ========================================================= */}
                {activeTab === 'art' && (
                  <div className="space-y-6">
                    
                    {/* Formulaire ajout / modification d'une relique */}
                    <div className={`p-5 rounded-2xl border transition-all ${editingAnnexIdx !== null ? 'bg-purple-50 border-purple-400 shadow-sm' : 'bg-purple-50/40 border-purple-200'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-purple-900 text-sm uppercase tracking-wider flex items-center gap-2">
                          {editingAnnexIdx !== null ? (
                            <>
                              <Edit2 className="w-4 h-4 text-purple-700" />
                              <span>Modifier la Relique #{editingAnnexIdx + 1}</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 text-purple-600" />
                              <span>Ajouter une Relique / Œuvre d'Art</span>
                            </>
                          )}
                        </h3>
                        {editingAnnexIdx !== null && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAnnexIdx(null);
                              setNewAnnex({ title: '', type: 'Fossile', century: '', content: '', image_url: '', gallery: [] });
                            }}
                            className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" /> Annuler la modification
                          </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        
                        {/* Ligne 1 : Titre & Catégorie */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Titre de l'œuvre / Relique *
                            </label>
                            <input
                              type="text"
                              placeholder="Ex: Le Crâne de Toumaï"
                              value={newAnnex.title}
                              onChange={(e) => setNewAnnex({ ...newAnnex, title: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Type / Catégorie
                            </label>
                            <select
                              value={newAnnex.type}
                              onChange={(e) => setNewAnnex({ ...newAnnex, type: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            >
                              <option value="Fossile">Fossile</option>
                              <option value="Sculpture">Sculpture</option>
                              <option value="Art pariétal">Art pariétal</option>
                              <option value="Outil lithique">Outil lithique</option>
                              <option value="Parure">Parure</option>
                              <option value="Sépulture">Sépulture</option>
                              <option value="Architecture">Architecture</option>
                              <option value="Arme & Outil">Arme & Outil</option>
                              <option value="Céramique">Céramique</option>
                            </select>
                          </div>
                        </div>

                        {/* Ligne 2 : Période / Siècle */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Période / Datation (ex: "Vers 17 000 av. J.-C." ou "Paléolithique supérieur")
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Vers 315 000 av. J.-C."
                            value={newAnnex.century}
                            onChange={(e) => setNewAnnex({ ...newAnnex, century: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium text-purple-950"
                          />
                        </div>

                        {/* Ligne 3 : Image Principale (Upload ou URL) */}
                        <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-xs">
                          <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider mb-2 flex items-center justify-between">
                            <span>🖼️ Image Principale</span>
                            {newAnnex.image_url && <span className="text-xs text-emerald-600 font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Image définie</span>}
                          </label>

                          <div className="flex flex-col sm:flex-row gap-4 items-start">
                            {/* Prévisualisation de l'image */}
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 relative group">
                              {newAnnex.image_url ? (
                                <>
                                  <img src={newAnnex.image_url} alt="Aperçu" className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => setNewAnnex({ ...newAnnex, image_url: '' })}
                                    className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Supprimer l'image"
                                  >
                                    <Trash2 className="w-5 h-5 text-red-300" />
                                  </button>
                                </>
                              ) : (
                                <ImageIcon className="w-8 h-8 text-slate-300" />
                              )}
                            </div>

                            {/* Options d'upload et URL */}
                            <div className="flex-1 space-y-2 w-full">
                              <div className="flex items-center gap-3">
                                <label className="inline-flex items-center gap-2 px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold rounded-lg text-xs cursor-pointer transition-colors">
                                  {isUploadingAnnexImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                  <span>Uploader une Image (WebP auto)</span>
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={(e) => {
                                      const file = e.target.files[0];
                                      if (file) handleAnnexImageUpload(file, true);
                                      e.target.value = '';
                                    }} 
                                    disabled={isUploadingAnnexImage} 
                                  />
                                </label>
                                <span className="text-xs text-slate-400 font-semibold">OU</span>
                              </div>

                              <input
                                type="url"
                                placeholder="Coller l'URL d'une image web (https://...)"
                                value={newAnnex.image_url}
                                onChange={(e) => setNewAnnex({ ...newAnnex, image_url: e.target.value })}
                                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Ligne 4 : Galerie d'Images Additionnelles */}
                        <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-xs">
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider">
                              📸 Galerie d'Images Complémentaires ({newAnnex.gallery?.length || 0})
                            </label>
                            <button
                              type="button"
                              onClick={() => setNewAnnex({ ...newAnnex, gallery: [...(newAnnex.gallery || []), ''] })}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs rounded-lg transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" /> Ajouter une Image
                            </button>
                          </div>

                          {newAnnex.gallery && newAnnex.gallery.length > 0 && (
                            <div className="space-y-3 mt-3">
                              {newAnnex.gallery.map((imgUrl, gIdx) => (
                                <div key={gIdx} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-200">
                                  <div className="w-12 h-12 rounded bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                    {imgUrl ? (
                                      <img src={imgUrl} alt={`Galerie ${gIdx + 1}`} className="w-full h-full object-cover" />
                                    ) : (
                                      <ImageIcon className="w-5 h-5 text-slate-400" />
                                    )}
                                  </div>

                                  <input
                                    type="url"
                                    placeholder="URL de l'image de galerie..."
                                    value={imgUrl}
                                    onChange={(e) => {
                                      const updated = [...newAnnex.gallery];
                                      updated[gIdx] = e.target.value;
                                      setNewAnnex({ ...newAnnex, gallery: updated });
                                    }}
                                    className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono focus:outline-none"
                                  />

                                  <label className="p-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded cursor-pointer shrink-0" title="Uploader pour cette case">
                                    <Upload className="w-3.5 h-3.5" />
                                    <input 
                                      type="file" 
                                      accept="image/*" 
                                      className="hidden" 
                                      onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) handleAnnexImageUpload(file, false, gIdx);
                                        e.target.value = '';
                                      }}
                                      disabled={isUploadingAnnexImage}
                                    />
                                  </label>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = newAnnex.gallery.filter((_, i) => i !== gIdx);
                                      setNewAnnex({ ...newAnnex, gallery: updated });
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-red-600 rounded shrink-0"
                                    title="Retirer cette image"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Ligne 5 : Description / Analyse historique */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Description et analyse historique (HTML ou texte)
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Présentation de l'œuvre, lieu de découverte, datation, signification..."
                            value={newAnnex.content}
                            onChange={(e) => setNewAnnex({ ...newAnnex, content: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          />
                        </div>

                        {/* Bouton de validation formulaire */}
                        <div className="flex justify-end pt-2 gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              if (!newAnnex.title.trim()) return;
                              if (editingAnnexIdx !== null) {
                                const updated = [...annexes];
                                updated[editingAnnexIdx] = { ...newAnnex };
                                setAnnexes(updated);
                                setEditingAnnexIdx(null);
                              } else {
                                setAnnexes([...annexes, { ...newAnnex }]);
                              }
                              setNewAnnex({ title: '', type: 'Fossile', century: '', content: '', image_url: '', gallery: [] });
                            }}
                            className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-sm shadow-sm transition-all"
                          >
                            {editingAnnexIdx !== null ? "💾 Mettre à jour cette relique" : "+ Ajouter cette relique"}
                          </button>
                        </div>

                      </div>
                    </div>

                    {/* Liste des reliques existantes */}
                    <div className="space-y-4">
                      <h3 className="font-bold text-slate-800 text-base">
                        Reliques et Œuvres d'Art ({annexes.length})
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {annexes.map((a, idx) => (
                          <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
                            <div>
                              {/* En-tête avec titre, type, et badge de période */}
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <span className="font-bold text-historia-blue text-sm flex-1">
                                  {idx + 1}. {a.title}
                                </span>
                                <span className="text-xs bg-purple-100 text-purple-800 font-bold px-2.5 py-0.5 rounded-full shrink-0">
                                  {a.type || 'Art'}
                                </span>
                              </div>

                              {/* Aperçu image & détails */}
                              <div className="flex gap-3 items-start my-2">
                                {a.image_url ? (
                                  <img src={a.image_url} alt={a.title} className="w-16 h-16 object-cover rounded-lg border border-slate-200 shrink-0" />
                                ) : (
                                  <div className="w-16 h-16 rounded-lg bg-slate-200/70 flex items-center justify-center shrink-0">
                                    <ImageIcon className="w-6 h-6 text-slate-400" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  {a.century && <p className="text-xs font-bold text-amber-700 mb-0.5">{a.century}</p>}
                                  <div 
                                    className="text-xs text-slate-600 line-clamp-2" 
                                    dangerouslySetInnerHTML={{ __html: a.content || '' }} 
                                  />
                                  {Array.isArray(a.gallery) && a.gallery.length > 0 && (
                                    <p className="text-[11px] text-purple-700 font-semibold mt-1">
                                      + {a.gallery.length} image{a.gallery.length > 1 ? 's' : ''} en galerie
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Boutons d'actions avec réordonnancement */}
                            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 mt-auto">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => moveItem(annexes, setAnnexes, idx, 'up')}
                                  disabled={idx === 0}
                                  className="p-1.5 text-slate-500 hover:text-purple-800 hover:bg-purple-100 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                  title="Monter cette relique"
                                >
                                  <ArrowUp className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveItem(annexes, setAnnexes, idx, 'down')}
                                  disabled={idx === annexes.length - 1}
                                  className="p-1.5 text-slate-500 hover:text-purple-800 hover:bg-purple-100 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                  title="Descendre cette relique"
                                >
                                  <ArrowDown className="w-4 h-4" />
                                </button>
                                <span className="text-[11px] text-slate-400 font-semibold ml-0.5">#{idx + 1}</span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingAnnexIdx(idx);
                                    setNewAnnex({ 
                                      title: a.title || '',
                                      type: a.type || 'Fossile',
                                      century: a.century || '',
                                      image_url: a.image_url || '',
                                      content: a.content || '',
                                      gallery: a.gallery || []
                                    });
                                    window.scrollTo({ top: 400, behavior: 'smooth' });
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-lg text-xs font-bold transition-colors"
                                  title="Modifier cette œuvre"
                                >
                                  <Edit2 className="w-3.5 h-3.5" /> Modifier
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (editingAnnexIdx === idx) {
                                      setEditingAnnexIdx(null);
                                      setNewAnnex({ title: '', type: 'Fossile', century: '', content: '', image_url: '', gallery: [] });
                                    }
                                    setAnnexes(annexes.filter((_, i) => i !== idx));
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold transition-colors"
                                  title="Supprimer cette relique"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Supprimer
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {annexes.length === 0 && (
                        <p className="text-center py-8 text-slate-400 text-sm">
                          Aucune relique enregistrée pour ce chapitre.
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="button"
                        onClick={handleSaveAnnexes}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-historia-blue hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                      >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 text-historia-gold" />}
                        Enregistrer la Galerie d'Art
                      </button>
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* ONGLET 5 : ÉDITEUR DE VIDÉOS YOUTUBE                      */}
                {/* ========================================================= */}
                {activeTab === 'video' && (
                  <div className="space-y-6">
                    {/* Formulaire ajout / modification vidéo */}
                    <div className={`p-5 rounded-2xl border transition-all ${editingVideoIdx !== null ? 'bg-green-50 border-green-400 shadow-sm' : 'bg-green-50/40 border-green-200'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-green-900 text-sm uppercase tracking-wider flex items-center gap-2">
                          {editingVideoIdx !== null ? (
                            <>
                              <Edit2 className="w-4 h-4 text-green-700" />
                              <span>Modifier la Vidéo #{editingVideoIdx + 1}</span>
                            </>
                          ) : (
                            <>
                              <Video className="w-4 h-4 text-green-600" />
                              <span>Ajouter une Vidéo YouTube</span>
                            </>
                          )}
                        </h3>
                        {editingVideoIdx !== null && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingVideoIdx(null);
                              setNewVideo({ title: '', url: '', description: '' });
                            }}
                            className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" /> Annuler la modification
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Titre de la vidéo
                            </label>
                            <input
                              type="text"
                              placeholder="Ex: Documentaire Arte sur Sapiens"
                              value={newVideo.title}
                              onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-green-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Lien YouTube (URL)
                            </label>
                            <input
                              type="url"
                              placeholder="https://www.youtube.com/watch?v=..."
                              value={newVideo.url}
                              onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Description (Optionnel)
                          </label>
                          <input
                            type="text"
                            placeholder="Brève description de la vidéo..."
                            value={newVideo.description}
                            onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                          />
                        </div>

                        {/* Aperçu YouTube en direct */}
                        {getYouTubeEmbedUrl(newVideo.url) && (
                          <div className="aspect-video w-full max-w-md mx-auto rounded-xl overflow-hidden shadow-sm mt-3 border border-slate-200">
                            <iframe
                              src={getYouTubeEmbedUrl(newVideo.url)}
                              title="Aperçu YouTube"
                              className="w-full h-full"
                              allowFullScreen
                            />
                          </div>
                        )}

                        <div className="flex justify-end pt-2 gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              if (!newVideo.title.trim() || !newVideo.url.trim()) return;
                              if (editingVideoIdx !== null) {
                                const updated = [...videos];
                                updated[editingVideoIdx] = { ...newVideo };
                                setVideos(updated);
                                setEditingVideoIdx(null);
                              } else {
                                setVideos([...videos, { ...newVideo }]);
                              }
                              setNewVideo({ title: '', url: '', description: '' });
                            }}
                            className="px-6 py-2.5 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl text-sm shadow-sm transition-all"
                          >
                            {editingVideoIdx !== null ? "💾 Mettre à jour cette vidéo" : "+ Ajouter cette vidéo"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Liste des vidéos */}
                    <div className="space-y-4">
                      <h3 className="font-bold text-slate-800 text-base">
                        Vidéos associées ({videos.length})
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {videos.map((v, idx) => (
                          <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
                            <div>
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <span className="font-bold text-historia-blue text-sm">
                                  {idx + 1}. {v.title}
                                </span>
                              </div>
                              {getYouTubeEmbedUrl(v.url) && (
                                <div className="aspect-video w-full rounded-lg overflow-hidden my-2 shadow-xs">
                                  <iframe
                                    src={getYouTubeEmbedUrl(v.url)}
                                    title={v.title}
                                    className="w-full h-full"
                                    allowFullScreen
                                  />
                                </div>
                              )}
                              {v.description && (
                                <p className="text-xs text-slate-500 italic mt-1">{v.description}</p>
                              )}
                            </div>

                            {/* Boutons d'actions avec réordonnancement */}
                            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 mt-2">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => moveItem(videos, setVideos, idx, 'up')}
                                  disabled={idx === 0}
                                  className="p-1.5 text-slate-500 hover:text-green-800 hover:bg-green-100 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                  title="Monter cette vidéo"
                                >
                                  <ArrowUp className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveItem(videos, setVideos, idx, 'down')}
                                  disabled={idx === videos.length - 1}
                                  className="p-1.5 text-slate-500 hover:text-green-800 hover:bg-green-100 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                  title="Descendre cette vidéo"
                                >
                                  <ArrowDown className="w-4 h-4" />
                                </button>
                                <span className="text-[11px] text-slate-400 font-semibold ml-0.5">#{idx + 1}</span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingVideoIdx(idx);
                                    setNewVideo({ ...v });
                                    window.scrollTo({ top: 400, behavior: 'smooth' });
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 hover:bg-green-200 text-green-900 rounded-lg text-xs font-bold transition-colors"
                                  title="Modifier cette vidéo"
                                >
                                  <Edit2 className="w-3.5 h-3.5" /> Modifier
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (editingVideoIdx === idx) {
                                      setEditingVideoIdx(null);
                                      setNewVideo({ title: '', url: '', description: '' });
                                    }
                                    setVideos(videos.filter((_, i) => i !== idx));
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold transition-colors"
                                  title="Supprimer cette vidéo"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Supprimer
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {videos.length === 0 && (
                        <p className="text-center py-8 text-slate-400 text-sm">
                          Aucune vidéo YouTube enregistrée pour ce chapitre.
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="button"
                        onClick={handleSaveVideos}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-historia-blue hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                      >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 text-historia-gold" />}
                        Enregistrer les Vidéos
                      </button>
                    </div>
                  </div>
                )}

              </div>

            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-historia-blue mb-1">Sélectionnez un Chapitre</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
                Veuillez choisir une époque et un chapitre dans les listes déroulantes ci-dessus pour afficher et modifier ses contenus.
              </p>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
