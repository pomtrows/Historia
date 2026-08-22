import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Save, Trash2, Edit2, X } from 'lucide-react';

export default function AnnexEditor() {
  const [chapters, setChapters] = useState([]);
  const [epochs, setEpochs] = useState([]);
  const [filterEpochId, setFilterEpochId] = useState('');
  const [selectedChapterId, setSelectedChapterId] = useState('');
  
  const [annexes, setAnnexes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [newAnnex, setNewAnnex] = useState({
    title: '',
    description: '',
    image_url: '',
    century: '',
    gallery: []
  });
  
  const [isUploading, setIsUploading] = useState(false);

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          // Conserver la resolution d'origine (ou limiter si trop grand)
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          
          // Compression en webp a 80% de qualite
          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/webp', 0.8);
        };
        img.onerror = error => reject(error);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFileUpload = async (e, isMainImage, idx = null) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setMessage('Compression et envoi de l\'image en cours...');
    try {
      const compressedBlob = await compressImage(file);
      
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.webp`;
      const filePath = `annexes/uploads/${fileName}`;

      const { data, error } = await supabase.storage
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

      if (isMainImage) {
        setNewAnnex(prev => ({ ...prev, image_url: uploadedUrl }));
      } else {
        updateGalleryImage(idx, uploadedUrl);
      }
      
      setMessage('Image compressée et envoyée avec succès !');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage(`Erreur d'envoi : ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleBulkGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setIsUploading(true);
    setMessage(`Compression et envoi de ${files.length} image(s)...`);
    
    try {
      const uploadedUrls = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setMessage(`Envoi de l'image ${i + 1}/${files.length}...`);
        
        const compressedBlob = await compressImage(file);
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.webp`;
        const filePath = `annexes/uploads/${fileName}`;

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

        uploadedUrls.push(publicUrlData.publicUrl);
      }

      setNewAnnex(prev => ({ 
        ...prev, 
        gallery: [...(prev.gallery || []), ...uploadedUrls] 
      }));
      
      setMessage(`${files.length} image(s) ajoutée(s) à la galerie avec succès !`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage(`Erreur lors de l'envoi : ${err.message}`);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  useEffect(() => {
    fetchChapters();
    fetchEpochs();
  }, []);

  useEffect(() => {
    if (selectedChapterId) {
      fetchAnnexes(selectedChapterId);
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

  async function fetchAnnexes(chapterId) {
    setLoading(true);
    setAnnexes([]);
    try {
      const { data, error } = await supabase
        .from('annexes')
        .select('*')
        .eq('chapter_id', chapterId)
        .order('id');
        
      if (error && error.code !== '42P01') throw error;
      const formatted = (data || []).map(a => ({
        id: a.id,
        title: a.title,
        description: a.content,
        image_url: a.artworks?.image_url,
        century: a.artworks?.century,
        gallery: a.artworks?.gallery || []
      }));
      setAnnexes(formatted);
    } catch (err) {
      console.error("Erreur chargement annexes:", err);
    } finally {
      setLoading(false);
    }
  }

  const [editingAnnexId, setEditingAnnexId] = useState(null);

  const handleEditClick = (annex) => {
    setEditingAnnexId(annex.id);
    setNewAnnex({
      title: annex.title || '',
      description: annex.description || '',
      image_url: annex.image_url || '',
      century: annex.century || '',
      gallery: annex.gallery || []
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingAnnexId(null);
    setNewAnnex({ title: '', description: '', image_url: '', century: '', gallery: [] });
  };

  const addGalleryImage = (e) => {
    e.preventDefault();
    setNewAnnex({ ...newAnnex, gallery: [...newAnnex.gallery, ''] });
  };

  const updateGalleryImage = (index, value) => {
    const updatedGallery = [...newAnnex.gallery];
    updatedGallery[index] = value;
    setNewAnnex({ ...newAnnex, gallery: updatedGallery });
  };

  const removeGalleryImage = (index) => {
    const updatedGallery = newAnnex.gallery.filter((_, i) => i !== index);
    setNewAnnex({ ...newAnnex, gallery: updatedGallery });
  };

  const handleSaveAnnex = async (e) => {
    e.preventDefault();
    if (!selectedChapterId) return;

    try {
      // Nettoyer la galerie pour enlever les URL vides
      const cleanGallery = newAnnex.gallery.filter(url => url.trim() !== '');

      if (editingAnnexId) {
        // Mode Édition
        const { error } = await supabase
          .from('annexes')
          .update({
            title: newAnnex.title,
            content: newAnnex.description,
            artworks: { image_url: newAnnex.image_url, century: newAnnex.century, gallery: cleanGallery }
          })
          .eq('id', editingAnnexId);

        if (error) throw error;

        setAnnexes(annexes.map(a => a.id === editingAnnexId ? {
          ...a,
          title: newAnnex.title,
          description: newAnnex.description,
          image_url: newAnnex.image_url,
          century: newAnnex.century,
          gallery: cleanGallery
        } : a));
        setMessage("Annexe modifiée avec succès !");
      } else {
        // Mode Ajout
        const { data, error } = await supabase
          .from('annexes')
          .insert([{
            chapter_id: selectedChapterId,
            title: newAnnex.title,
            content: newAnnex.description,
            artworks: { image_url: newAnnex.image_url, century: newAnnex.century, gallery: cleanGallery }
          }])
          .select()
          .single();

        if (error) throw error;

        const newFormatted = {
          id: data.id,
          title: data.title,
          description: data.content,
          image_url: data.artworks?.image_url,
          century: data.artworks?.century,
          gallery: data.artworks?.gallery || []
        };

        setAnnexes([...annexes, newFormatted]);
        setMessage("Annexe ajoutée avec succès !");
      }
      
      handleCancelEdit();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error("Erreur sauvegarde annexe:", err);
      setMessage("Erreur lors de la sauvegarde.");
    }
  };

  const handleDeleteAnnex = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette annexe ?")) return;
    try {
      const { error } = await supabase.from('annexes').delete().eq('id', id);
      if (error) throw error;
      setAnnexes(annexes.filter(a => a.id !== id));
      if (editingAnnexId === id) handleCancelEdit();
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif font-bold text-historia-blue mb-8">Éditeur d'Art</h1>

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
            <h2 className="text-xl font-bold text-historia-blue mb-4">Œuvres Actuelles ({annexes.length})</h2>
            
            {annexes.length === 0 && <p className="text-slate-500 italic">Aucune œuvre pour ce chapitre.</p>}
            
            {annexes.map((a) => (
              <div key={a.id} className="bg-white p-4 rounded-lg shadow border border-slate-200 flex gap-4 relative group">
                <img src={a.image_url} alt={a.title} className="w-24 h-24 object-cover rounded" />
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800">{a.title}</h3>
                  <span className="text-xs text-historia-gold font-bold">{a.century}</span>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-2">{a.description}</p>
                </div>
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEditClick(a)}
                    className="p-2 bg-blue-100 text-blue-500 rounded-full hover:bg-blue-200"
                    title="Modifier"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteAnnex(a.id)}
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
                {editingAnnexId ? <Edit2 className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                {editingAnnexId ? "Modifier l'œuvre" : "Ajouter une Œuvre"}
              </h2>
              {editingAnnexId && (
                <button onClick={handleCancelEdit} className="text-slate-500 hover:text-slate-800" title="Annuler la modification">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
            {message && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-sm">{message}</div>}

            <form onSubmit={handleSaveAnnex} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Titre de l'œuvre</label>
                <input required type="text" className="w-full p-2 border rounded text-sm"
                  value={newAnnex.title} onChange={e => setNewAnnex({...newAnnex, title: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Période / Siècle (ex: "Vers 17 000 av. J.-C.")</label>
                <input type="text" className="w-full p-2 border rounded text-sm"
                  value={newAnnex.century} onChange={e => setNewAnnex({...newAnnex, century: e.target.value})} />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Image Principale</label>
                <div className="flex gap-2 items-start flex-col">
                  <input 
                    type="file" accept="image/*" 
                    onChange={(e) => handleFileUpload(e, true)} 
                    disabled={isUploading} 
                    className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer" 
                  />
                  <span className="text-xs text-slate-500 italic w-full text-center">- OU coller une URL -</span>
                  <input required type="url" placeholder="URL de l'image" className="w-full p-2 border rounded text-sm"
                    value={newAnnex.image_url} onChange={e => setNewAnnex({...newAnnex, image_url: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description et histoire (texte riche autorisé, sauts de ligne possibles)</label>
                <textarea 
                  required rows="5" className="w-full p-2 border rounded text-sm"
                  value={newAnnex.description} onChange={e => setNewAnnex({...newAnnex, description: e.target.value})}
                />
              </div>
              
              {newAnnex.gallery && newAnnex.gallery.length > 0 && (
                <div className="space-y-2 mt-4 pt-4 border-t border-slate-200">
                  <label className="block text-xs font-bold text-slate-700">Galerie d'images (Optionnelle)</label>
                  {newAnnex.gallery.map((imgUrl, idx) => (
                    <div key={idx} className="flex flex-col gap-2 p-3 bg-white border border-slate-200 rounded">
                      <div className="flex gap-2 items-center">
                        {imgUrl && <img src={imgUrl} alt="Aperçu" className="w-12 h-12 object-cover rounded bg-slate-200 shadow-sm" referrerPolicy="no-referrer" />}
                        <div className="flex-1">
                          <input 
                            type="file" accept="image/*" 
                            onChange={(e) => handleFileUpload(e, false, idx)} 
                            disabled={isUploading} 
                            className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer mb-2" 
                          />
                          <input 
                            type="url" 
                            placeholder="URL de l'image" 
                            className="w-full p-2 border rounded text-sm"
                            value={imgUrl} 
                            onChange={(e) => updateGalleryImage(idx, e.target.value)} 
                          />
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeGalleryImage(idx)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded"
                          title="Supprimer cette image"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex gap-6 mt-4">
                <button 
                  type="button" 
                  onClick={addGalleryImage}
                  className="text-sm font-bold text-historia-gold hover:text-yellow-600 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" /> Ajouter une URL (vide)
                </button>

                <label className="text-sm font-bold text-historia-blue hover:text-blue-700 flex items-center cursor-pointer">
                  <Plus className="w-4 h-4 mr-1" /> Uploader plusieurs images d'un coup
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={handleBulkGalleryUpload} 
                    disabled={isUploading} 
                    className="hidden" 
                  />
                </label>
              </div>

              <button type="submit" className="w-full mt-6 bg-historia-gold hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded transition-colors flex items-center justify-center">
                <Save className="w-5 h-5 mr-2" /> {editingAnnexId ? "Mettre à jour l'œuvre" : "Ajouter l'œuvre"}
              </button>
            </form>
          </div>

        </div>
      )}
    </div>
  );
}
