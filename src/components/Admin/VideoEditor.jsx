import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Save, Trash2, Edit2, X, Video } from 'lucide-react';

export default function VideoEditor() {
  const [chapters, setChapters] = useState([]);
  const [epochs, setEpochs] = useState([]);
  const [filterEpochId, setFilterEpochId] = useState('');
  const [selectedChapterId, setSelectedChapterId] = useState('');
  
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [newVideo, setNewVideo] = useState({
    title: '',
    url: '',
    description: ''
  });
  
  const [editingVideoId, setEditingVideoId] = useState(null);

  useEffect(() => {
    fetchChapters();
    fetchEpochs();
  }, []);

  useEffect(() => {
    if (selectedChapterId) {
      fetchVideos(selectedChapterId);
    }
  }, [selectedChapterId]);

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
      const { data, error } = await supabase.from('chapters').select('id, title, epoch_id, order').order('order');
      if (error && error.code !== '42P01') throw error;
      if (data) setChapters(data);
    } catch (err) {
      console.error("Erreur chargement chapitres:", err);
    }
  }

  async function fetchVideos(chapterId) {
    setLoading(true);
    setVideos([]);
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('chapter_id', chapterId)
        .order('id');
        
      if (error) {
        if (error.code === '42P01') {
          setMessage("Attention: La table 'videos' n'existe pas dans Supabase.");
        }
        throw error;
      }
      setVideos(data || []);
    } catch (err) {
      console.error("Erreur chargement vidéos:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleEditClick = (video) => {
    setEditingVideoId(video.id);
    setNewVideo({
      title: video.title || '',
      url: video.url || '',
      description: video.description || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingVideoId(null);
    setNewVideo({ title: '', url: '', description: '' });
  };

  const handleSaveVideo = async (e) => {
    e.preventDefault();
    if (!selectedChapterId) return;

    try {
      if (editingVideoId) {
        // Mode Édition
        const { error } = await supabase
          .from('videos')
          .update({
            title: newVideo.title,
            url: newVideo.url,
            description: newVideo.description
          })
          .eq('id', editingVideoId);

        if (error) throw error;

        setVideos(videos.map(v => v.id === editingVideoId ? {
          ...v,
          title: newVideo.title,
          url: newVideo.url,
          description: newVideo.description
        } : v));
        setMessage("Vidéo modifiée avec succès !");
      } else {
        // Mode Ajout
        const { data, error } = await supabase
          .from('videos')
          .insert([{
            chapter_id: selectedChapterId,
            title: newVideo.title,
            url: newVideo.url,
            description: newVideo.description
          }])
          .select()
          .single();

        if (error) throw error;

        setVideos([...videos, data]);
        setMessage("Vidéo ajoutée avec succès !");
      }
      
      handleCancelEdit();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error("Erreur sauvegarde vidéo:", err);
      if (err.code === '42P01') {
        setMessage("Erreur : La table 'videos' n'existe pas dans Supabase. Veuillez la créer.");
      } else {
        setMessage("Erreur lors de la sauvegarde.");
      }
    }
  };

  const handleDeleteVideo = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette vidéo ?")) return;
    try {
      const { error } = await supabase.from('videos').delete().eq('id', id);
      if (error) throw error;
      setVideos(videos.filter(v => v.id !== id));
      if (editingVideoId === id) handleCancelEdit();
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif font-bold text-historia-blue mb-8">Éditeur de Vidéos</h1>

      <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100 mb-8 flex gap-4">
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
          <label className="block text-sm font-bold text-slate-700 mb-2">Sélectionner un chapitre</label>
          <select 
            className="w-full p-3 border border-slate-300 rounded outline-none focus:ring-2 focus:ring-historia-gold"
            value={selectedChapterId}
            onChange={(e) => setSelectedChapterId(e.target.value)}
          >
            <option value="">-- Choisir un chapitre --</option>
            {chapters
              .filter(c => filterEpochId ? c.epoch_id === filterEpochId : true)
              .sort((a, b) => a.order - b.order)
              .map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
          </select>
        </div>
      </div>

      {loading && <div className="text-historia-blue">Chargement...</div>}

      {selectedChapterId && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-historia-blue mb-4">Vidéos Actuelles ({videos.length})</h2>
            
            {videos.length === 0 && <p className="text-slate-500 italic">Aucune vidéo pour ce chapitre.</p>}
            
            {videos.map((v) => (
              <div key={v.id} className="bg-white p-4 rounded-lg shadow border border-slate-200 flex gap-4 relative group">
                <div className="w-24 h-24 bg-slate-100 flex items-center justify-center rounded">
                  <Video className="w-8 h-8 text-red-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800">{v.title}</h3>
                  <a href={v.url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 underline truncate block w-48 mb-1">
                    {v.url}
                  </a>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-2">{v.description}</p>
                </div>
                <div className="absolute top-2 right-2 flex gap-2">
                  <button 
                    onClick={() => handleEditClick(v)}
                    className="p-2 bg-blue-100 text-blue-500 rounded-full hover:bg-blue-200"
                    title="Modifier"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteVideo(v.id)}
                    className="p-2 bg-red-100 text-red-500 rounded-full hover:bg-red-200"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 h-fit sticky top-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-historia-blue flex items-center">
                {editingVideoId ? <Edit2 className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                {editingVideoId ? "Modifier la vidéo" : "Ajouter une Vidéo"}
              </h2>
              {editingVideoId && (
                <button onClick={handleCancelEdit} className="text-slate-500 hover:text-slate-800" title="Annuler la modification">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
            {message && <div className={`mb-4 p-3 rounded text-sm ${message.includes('Erreur') || message.includes('Attention') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message}</div>}

            <form onSubmit={handleSaveVideo} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Titre de la vidéo</label>
                <input required type="text" className="w-full p-2 border rounded text-sm"
                  value={newVideo.title} onChange={e => setNewVideo({...newVideo, title: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lien de la vidéo (YouTube, etc.)</label>
                <input required type="url" placeholder="https://www.youtube.com/watch?v=..." className="w-full p-2 border rounded text-sm"
                  value={newVideo.url} onChange={e => setNewVideo({...newVideo, url: e.target.value})} />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea 
                  rows="4" className="w-full p-2 border rounded text-sm"
                  value={newVideo.description} onChange={e => setNewVideo({...newVideo, description: e.target.value})}
                />
              </div>

              <button type="submit" className="w-full mt-6 bg-historia-gold hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded transition-colors flex items-center justify-center">
                <Save className="w-5 h-5 mr-2" /> {editingVideoId ? "Mettre à jour la vidéo" : "Ajouter la vidéo"}
              </button>
            </form>
          </div>

        </div>
      )}
    </div>
  );
}
