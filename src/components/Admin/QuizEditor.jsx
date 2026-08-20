import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Save, Trash2, CheckCircle } from 'lucide-react';

export default function QuizEditor() {
  const [chapters, setChapters] = useState([]);
  const [epochs, setEpochs] = useState([]);
  const [filterEpochId, setFilterEpochId] = useState('');
  const [selectedChapterId, setSelectedChapterId] = useState('');
  const [quizId, setQuizId] = useState(null);
  
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Formulaire nouvelle question
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A',
    explanation: ''
  });

  useEffect(() => {
    fetchChapters();
    fetchEpochs();
  }, []);

  useEffect(() => {
    if (selectedChapterId) {
      fetchQuiz(selectedChapterId);
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

  async function fetchQuiz(chapterId) {
    setLoading(true);
    setQuestions([]);
    setQuizId(null);
    try {
      // 1. Chercher si un quiz existe
      let { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('id')
        .eq('chapter_id', chapterId)
        .single();

      if (quizError && quizError.code === 'PGRST116') {
        // Pas de quiz, on le crée
        const { data: newQuiz, error: insertError } = await supabase
          .from('quizzes')
          .insert([{ chapter_id: chapterId, title: "Quiz du chapitre" }])
          .select()
          .single();
        if (insertError) throw insertError;
        quizData = newQuiz;
      } else if (quizError && quizError.code !== '42P01') {
        throw quizError;
      }

      if (quizData) {
        setQuizId(quizData.id);
        // 2. Charger les questions
        const { data: qData, error: qError } = await supabase
          .from('questions')
          .select('*')
          .eq('quiz_id', quizData.id)
          .order('id');
        if (qError) throw qError;
        setQuestions(qData || []);
      }
    } catch (err) {
      console.error("Erreur chargement/création quiz:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!quizId) return;

    try {
      const { data, error } = await supabase
        .from('questions')
        .insert([{
          quiz_id: quizId,
          ...newQuestion
        }])
        .select()
        .single();

      if (error) throw error;

      setQuestions([...questions, data]);
      setMessage("Question ajoutée avec succès !");
      
      // Reset form
      setNewQuestion({
        question_text: '',
        option_a: '', option_b: '', option_c: '', option_d: '',
        correct_option: 'A', explanation: ''
      });
      
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error("Erreur ajout question:", err);
      setMessage("Erreur lors de l'ajout de la question.");
    }
  };

  const handleDeleteQuestion = async (id) => {
    try {
      const { error } = await supabase.from('questions').delete().eq('id', id);
      if (error) throw error;
      setQuestions(questions.filter(q => q.id !== id));
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif font-bold text-historia-blue mb-8">Éditeur de Quiz</h1>

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

      {loading && <div className="text-historia-blue">Chargement des questions...</div>}

      {selectedChapterId && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Liste des questions existantes */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-historia-blue mb-4">Questions Actuelles ({questions.length})</h2>
            
            {questions.length === 0 && <p className="text-slate-500 italic">Aucune question pour ce quiz.</p>}
            
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-white p-4 rounded-lg shadow border border-slate-200 relative group">
                <span className="absolute top-2 right-2 text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">Q{idx + 1}</span>
                <h3 className="font-bold text-slate-800 pr-10">{q.question_text}</h3>
                <ul className="mt-2 text-sm text-slate-600 space-y-1">
                  <li className={q.correct_option === 'A' ? 'text-green-600 font-bold' : ''}>A: {q.option_a}</li>
                  <li className={q.correct_option === 'B' ? 'text-green-600 font-bold' : ''}>B: {q.option_b}</li>
                  <li className={q.correct_option === 'C' ? 'text-green-600 font-bold' : ''}>C: {q.option_c}</li>
                  <li className={q.correct_option === 'D' ? 'text-green-600 font-bold' : ''}>D: {q.option_d}</li>
                </ul>
                <button 
                  onClick={() => handleDeleteQuestion(q.id)}
                  className="mt-3 text-red-500 text-sm flex items-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Supprimer
                </button>
              </div>
            ))}
          </div>

          {/* Formulaire d'ajout */}
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 h-fit sticky top-6">
            <h2 className="text-xl font-bold text-historia-blue mb-4 flex items-center">
              <Plus className="w-5 h-5 mr-2" /> Ajouter une question
            </h2>
            
            {message && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-sm">{message}</div>}

            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Question</label>
                <textarea 
                  required
                  rows="2"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-historia-gold outline-none text-sm"
                  value={newQuestion.question_text}
                  onChange={e => setNewQuestion({...newQuestion, question_text: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Option A</label>
                  <input required type="text" className="w-full p-2 border rounded text-sm"
                    value={newQuestion.option_a} onChange={e => setNewQuestion({...newQuestion, option_a: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Option B</label>
                  <input required type="text" className="w-full p-2 border rounded text-sm"
                    value={newQuestion.option_b} onChange={e => setNewQuestion({...newQuestion, option_b: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Option C</label>
                  <input required type="text" className="w-full p-2 border rounded text-sm"
                    value={newQuestion.option_c} onChange={e => setNewQuestion({...newQuestion, option_c: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Option D</label>
                  <input required type="text" className="w-full p-2 border rounded text-sm"
                    value={newQuestion.option_d} onChange={e => setNewQuestion({...newQuestion, option_d: e.target.value})} />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-1/3">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bonne réponse</label>
                  <select 
                    className="w-full p-2 border rounded font-bold text-historia-blue"
                    value={newQuestion.correct_option}
                    onChange={e => setNewQuestion({...newQuestion, correct_option: e.target.value})}
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
                <div className="w-2/3">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Explication (affichée après réponse)</label>
                  <input type="text" required className="w-full p-2 border rounded text-sm"
                    value={newQuestion.explanation} onChange={e => setNewQuestion({...newQuestion, explanation: e.target.value})} />
                </div>
              </div>

              <button type="submit" className="w-full mt-4 bg-historia-gold hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded transition-colors flex items-center justify-center">
                <Save className="w-5 h-5 mr-2" /> Enregistrer la question
              </button>
            </form>
          </div>

        </div>
      )}
    </div>
  );
}
