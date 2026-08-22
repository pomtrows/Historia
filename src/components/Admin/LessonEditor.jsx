import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Save, Image as ImageIcon, Heading1, Heading2, Bold, Italic, List, Quote, Plus, Trash2, ImagePlus, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const MenuBar = ({ editor, onImageUpload, isUploadingImage }) => {
  if (!editor) return null;

  const addImageFromUrl = () => {
    const url = window.prompt('URL de l\'image:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onImageUpload(file);
    }
    e.target.value = ''; // Reset input
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4 p-2 bg-slate-100 rounded-lg border border-slate-200 sticky top-0 z-10">
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('bold') ? 'bg-slate-200 font-bold' : ''}`} title="Gras">
        <Bold className="w-5 h-5" />
      </button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('italic') ? 'bg-slate-200' : ''}`} title="Italique">
        <Italic className="w-5 h-5" />
      </button>
      <div className="w-px h-8 bg-slate-300 mx-1"></div>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('heading', { level: 1 }) ? 'bg-slate-200' : ''}`} title="Titre 1">
        <Heading1 className="w-5 h-5" />
      </button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-200' : ''}`} title="Titre 2">
        <Heading2 className="w-5 h-5" />
      </button>
      <div className="w-px h-8 bg-slate-300 mx-1"></div>
      <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('blockquote') ? 'bg-slate-200' : ''}`} title="Anecdote (Citation)">
        <Quote className="w-5 h-5" />
      </button>
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('bulletList') ? 'bg-slate-200' : ''}`} title="Liste">
        <List className="w-5 h-5" />
      </button>
      <div className="w-px h-8 bg-slate-300 mx-1"></div>
      <button onClick={addImageFromUrl} className="p-2 rounded hover:bg-slate-200 text-historia-blue" title="Ajouter une image depuis une URL">
        <ImageIcon className="w-5 h-5" />
      </button>
      <label className="p-2 rounded hover:bg-slate-200 text-historia-gold cursor-pointer flex items-center justify-center" title="Uploader une image">
        {isUploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={isUploadingImage} />
      </label>
    </div>
  );
};

export default function LessonEditor() {
  const [chapters, setChapters] = useState([]);
  const [epochs, setEpochs] = useState([]);
  const [filterEpochId, setFilterEpochId] = useState('');
  const [selectedChapterId, setSelectedChapterId] = useState('');
  
  const [title, setTitle] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [epochId, setEpochId] = useState('');
  const [order, setOrder] = useState(1);
  const [timelineEvents, setTimelineEvents] = useState([]);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [message, setMessage] = useState('');

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
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Erreur lors de la compression de l'image"));
          }
        }, 'image/webp', 0.8);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Le fichier fourni n'est pas une image valide"));
      };
      
      img.src = objectUrl;
    });
  };

  const handleImageUpload = async (file) => {
    setIsUploadingImage(true);
    setMessage('Compression et envoi de l\'image en cours...');
    try {
      const compressedBlob = await compressImage(file);
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.webp`;
      const filePath = `lessons/uploads/${fileName}`;

      const { error } = await supabase.storage
        .from('historia-images')
        .upload(filePath, compressedBlob, {
          contentType: 'image/webp',
          upsert: false
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('historia-images')
        .getPublicUrl(filePath);

      const uploadedUrl = publicUrlData.publicUrl;
      editor.chain().focus().setImage({ src: uploadedUrl }).run();
      
      setMessage('Image insérée avec succès !');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage(`Erreur d'envoi de l'image : ${err.message}`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: true, HTMLAttributes: { class: 'rounded-lg shadow-md my-8 max-w-full h-auto' } }),
    ],
    content: '<p>Commencez à rédiger la leçon ici...</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[500px] p-6 bg-white border border-slate-200 rounded-lg shadow-inner prose-headings:font-serif prose-headings:text-historia-blue',
      },
    },
  });

  useEffect(() => {
    fetchChapters();
    fetchEpochs();
  }, []);

  async function fetchEpochs() {
    try {
      const { data, error } = await supabase.from('epochs').select('id, title').order('order');
      if (error && error.code !== '42P01') throw error;
      if (data) setEpochs(data);
    } catch (err) {
      console.error("Erreur chargement époques:", err);
    }
  }

  async function fetchChapters() {
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('id, title, epoch_id, order, map_url, content, timeline_data')
        .order('order');
      if (error && error.code !== '42P01') throw error;
      if (data) setChapters(data);
    } catch (err) {
      console.error("Erreur chargement chapitres:", err);
    }
  }

  const handleSelectChapter = (e) => {
    const id = e.target.value;
    setSelectedChapterId(id);
    if (id === '') {
      handleNewChapter();
    } else {
      const chapter = chapters.find(c => c.id === id);
      if (chapter) {
        setTitle(chapter.title);
        setMapUrl(chapter.map_url || '');
        setEpochId(chapter.epoch_id || '');
        setOrder(chapter.order || 1);
        setTimelineEvents((chapter.timeline_data || []).map(ev => ({
          ...ev,
          id: ev.id || Math.random().toString(36).substring(7)
        })));
        editor.commands.setContent(chapter.content || '');
      }
    }
  };

  const handleNewChapter = () => {
    setSelectedChapterId('');
    setTitle('');
    setMapUrl('');
    setEpochId(filterEpochId || (epochs.length > 0 ? epochs[0].id : ''));
    setOrder(chapters.length + 1);
    setTimelineEvents([]);
    editor.commands.setContent('<p>Commencez à rédiger la leçon ici...</p>');
  };

  const addTimelineEvent = () => {
    setTimelineEvents([...timelineEvents, { id: Date.now().toString(), year_label: '', title: '', description: '' }]);
  };

  const updateTimelineEvent = (id, field, value) => {
    setTimelineEvents(timelineEvents.map(ev => ev.id === id ? { ...ev, [field]: value } : ev));
  };

  const removeTimelineEvent = (id) => {
    setTimelineEvents(timelineEvents.filter(ev => ev.id !== id));
  };

  const handleDeleteChapter = async () => {
    if (!selectedChapterId) return;
    
    if (window.confirm("Êtes-vous sûr de vouloir supprimer définitivement cette leçon ? Cette action est irréversible et supprimera également les quiz et annexes associés.")) {
      setIsSaving(true);
      setMessage('');
      try {
        const { error } = await supabase.from('chapters').delete().eq('id', selectedChapterId);
        if (error) throw error;
        
        setMessage('Leçon supprimée avec succès.');
        handleNewChapter();
        await fetchChapters();
      } catch (err) {
        console.error("Erreur suppression:", err);
        setMessage("Erreur lors de la suppression de la leçon.");
      } finally {
        setIsSaving(false);
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');
    try {
      const htmlContent = editor.getHTML();
      
      let data, error;
      if (selectedChapterId) {
        // Update existing chapter
        const res = await supabase
          .from('chapters')
          .update({ 
            title: title || 'Chapitre sans titre', 
            content: htmlContent, 
            map_url: mapUrl,
            epoch_id: epochId || null,
            order: parseInt(order) || 1,
            timeline_data: timelineEvents
          })
          .eq('id', selectedChapterId)
          .select();
        data = res.data;
        error = res.error;
      } else {
        // Insert new chapter
        const res = await supabase
          .from('chapters')
          .insert([{ 
            title: title || 'Nouveau Chapitre', 
            content: htmlContent, 
            map_url: mapUrl, 
            epoch_id: epochId || null, 
            order: parseInt(order) || chapters.length + 1,
            timeline_data: timelineEvents
          }])
          .select();
        data = res.data;
        error = res.error;
      }

      if (error) throw error;
      
      setMessage('Leçon sauvegardée avec succès dans Supabase !');
      await fetchChapters(); // Rafraîchir la liste
      if (!selectedChapterId && data && data.length > 0) {
        setSelectedChapterId(data[0].id);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setMessage('Erreur lors de la sauvegarde: ' + (error.message || 'La colonne timeline_data manque-t-elle ?'));
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-bold text-historia-blue">Éditeur de Leçon</h1>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-historia-gold hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded flex items-center transition-colors disabled:opacity-50 shadow"
        >
          <Save className="w-5 h-5 mr-2" />
          {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100 mb-8 flex gap-4 items-end">
        <div className="flex-1 flex gap-4">
          <div className="w-1/2">
            <label className="block text-sm font-bold text-slate-700 mb-2">Filtrer par époque</label>
            <select 
              className="w-full p-3 border border-slate-300 rounded outline-none focus:ring-2 focus:ring-historia-gold"
              value={filterEpochId}
              onChange={(e) => {
                setFilterEpochId(e.target.value);
                setSelectedChapterId(''); // Reset chapter when changing epoch filter
              }}
            >
              <option value="">-- Toutes les époques --</option>
              {epochs.map(e => (
                <option key={e.id} value={e.id}>{e.title}</option>
              ))}
            </select>
          </div>
          
          <div className="w-1/2">
            <label className="block text-sm font-bold text-slate-700 mb-2">Sélectionner une leçon</label>
            <select 
              className="w-full p-3 border border-slate-300 rounded outline-none focus:ring-2 focus:ring-historia-gold"
              value={selectedChapterId}
              onChange={handleSelectChapter}
            >
              <option value="">-- Créer une nouvelle leçon --</option>
              {chapters
                .filter(c => filterEpochId ? c.epoch_id === filterEpochId : true)
                .sort((a, b) => a.order - b.order)
                .map(c => {
                  const hasContent = c.content && c.content.length > 100 && c.content !== '<p>Commencez à rédiger la leçon ici...</p>';
                  return (
                    <option key={c.id} value={c.id}>
                      {hasContent ? '✅ ' : '📝 '} {c.title} {hasContent ? '' : '(Vide)'}
                    </option>
                  );
                })}
            </select>
          </div>
        </div>
        {selectedChapterId && (
          <div className="flex gap-2">
            <button onClick={handleNewChapter} className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold flex items-center transition-colors" title="Créer une nouvelle leçon vierge">
              <Plus className="w-5 h-5 mr-1" /> Créer
            </button>
            <button onClick={handleDeleteChapter} disabled={isSaving} className="p-3 bg-red-100 hover:bg-red-200 text-red-600 rounded font-bold flex items-center transition-colors disabled:opacity-50" title="Supprimer la leçon courante">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {message && (
        <div className={`p-4 mb-6 rounded font-bold ${message.includes('Erreur') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
            <h3 className="font-bold text-historia-blue border-b pb-2 mb-4">Informations</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Époque</label>
                <select 
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-historia-gold outline-none bg-slate-50 text-sm"
                  value={epochId}
                  onChange={(e) => setEpochId(e.target.value)}
                >
                  <option value="">-- Sans époque --</option>
                  {epochs.map(e => (
                    <option key={e.id} value={e.id}>{e.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Numéro du Chapitre</label>
                <input 
                  type="number" min="1"
                  value={order} onChange={(e) => setOrder(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-historia-gold outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Titre du chapitre</label>
                <input 
                  type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-historia-gold outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">URL de la Carte (Haut de page)</label>
                <input 
                  type="text" value={mapUrl} onChange={(e) => setMapUrl(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-historia-gold outline-none text-sm"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h3 className="font-bold text-historia-blue">Frise Chronologique</h3>
              <button onClick={addTimelineEvent} className="text-historia-gold hover:text-yellow-600" title="Ajouter un événement">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            {timelineEvents.length === 0 && <p className="text-xs text-slate-500 italic">Aucun événement dans la frise.</p>}
            
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {timelineEvents.map((ev, i) => (
                <div key={ev.id || `timeline-event-${i}`} className="p-3 bg-slate-50 border border-slate-200 rounded relative group">
                  <button onClick={() => removeTimelineEvent(ev.id)} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <input 
                    type="text" placeholder="Date (ex: ~400 000 ans)" 
                    value={ev.year_label} onChange={e => updateTimelineEvent(ev.id, 'year_label', e.target.value)}
                    className="w-full mb-2 p-1 text-xs border rounded outline-none font-bold text-historia-gold"
                  />
                  <input 
                    type="text" placeholder="Titre" 
                    value={ev.title} onChange={e => updateTimelineEvent(ev.id, 'title', e.target.value)}
                    className="w-full mb-2 p-1 text-sm border rounded outline-none font-bold text-historia-blue"
                  />
                  <textarea 
                    placeholder="Description" rows="2"
                    value={ev.description} onChange={e => updateTimelineEvent(ev.id, 'description', e.target.value)}
                    className="w-full p-1 text-xs border rounded outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <MenuBar editor={editor} onImageUpload={handleImageUpload} isUploadingImage={isUploadingImage} />
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
