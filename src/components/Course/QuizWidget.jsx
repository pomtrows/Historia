import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ChapterNav from './ChapterNav';

// Mock data pour la démo au cas où il n'y aurait pas de quiz en BD
const mockQuestions = [
  {
    id: 1,
    question_text: "Quel est le surnom donné à Sahelanthropus tchadensis ?",
    options: ["Lucy", "Toumaï", "Abel", "Cro-Magnon"],
    correctAnswer: 1, // Index of "Toumaï"
    explanation: "Toumaï signifie 'espoir de vie' en langue gorane."
  },
  {
    id: 2,
    question_text: "Dans quel pays actuel a été découverte Lucy ?",
    options: ["Kenya", "Afrique du Sud", "Tchad", "Éthiopie"],
    correctAnswer: 3,
    explanation: "Lucy a été découverte en 1974 dans la dépression de l'Afar, en Éthiopie."
  },
  {
    id: 3,
    question_text: "Quel a été le premier hominidé à domestiquer le feu ?",
    options: ["Homo habilis", "Homo erectus", "Homo sapiens", "Australopithecus"],
    correctAnswer: 1,
    explanation: "C'est Homo erectus qui, le premier, a su domestiquer et utiliser le feu il y a environ 400 000 ans."
  }
];

export default function QuizWidget() {
  const { id: chapterId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quizDetails, setQuizDetails] = useState(null);
  const [chapterInfo, setChapterInfo] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
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

        const { data: quizData, error: quizError } = await supabase
          .from('quizzes')
          .select('id, title')
          .eq('chapter_id', chapterId)
          .single();

        if (quizError && quizError.code !== 'PGRST116' && quizError.code !== '22P02') throw quizError;

        if (quizData) {
          setQuizDetails(quizData);
          const { data: qData, error: qError } = await supabase
            .from('questions')
            .select('*')
            .eq('quiz_id', quizData.id);
            
          if (qError) throw qError;

          if (qData && qData.length > 0) {
            const formatted = qData.map(q => {
              const options = [q.option_a, q.option_b, q.option_c, q.option_d];
              const correctIndex = q.correct_option.charCodeAt(0) - 65; 
              return {
                id: q.id,
                question_text: q.question_text,
                options,
                correctAnswer: correctIndex,
                explanation: q.explanation
              };
            });
            setQuestions(formatted);
          } else {
            if (chapterId === "1") {
              setQuestions(mockQuestions);
              setQuizDetails({ title: "Quiz : L'Aube de l'Humanité" });
            } else {
              setQuestions([]);
            }
          }
        } else {
          if (chapterId === "1") {
            setQuestions(mockQuestions);
            setQuizDetails({ title: "Quiz : L'Aube de l'Humanité" });
          } else {
            setQuestions([]);
          }
        }
      } catch (err) {
        console.error("Erreur lors du chargement du quiz:", err);
        if (chapterId === "1") {
          setQuestions(mockQuestions);
          setQuizDetails({ title: "Quiz : L'Aube de l'Humanité" });
        } else {
          setQuestions([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [chapterId]);

  const handleAnswerClick = (index) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);

    if (index === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizFinished(true);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-historia-blue">
        <Loader2 className="w-10 h-10 animate-spin mr-3" />
        <span className="font-serif text-xl">Préparation du Quiz...</span>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-4 md:py-12">
         <div className="mb-6">
           <Link to={`/courses#epoch-${chapterInfo?.epoch_id || '1'}`} className="inline-flex items-center text-slate-500 hover:text-historia-blue font-bold transition-colors">
             <ArrowLeft className="w-5 h-5 mr-2" /> Retour aux époques
           </Link>
         </div>
         <header className="mb-8 text-center">
           <h1 className="text-4xl md:text-5xl font-serif font-bold text-historia-blue mb-4">{chapterInfo?.title || "Quiz"}</h1>
           <p className="text-lg text-slate-500 italic font-serif">Testez votre maîtrise de cet épisode</p>
         </header>
         <ChapterNav chapterId={chapterId} />
         <div className="text-xl text-slate-500 italic mt-10 text-center">Aucun quiz disponible pour ce chapitre.</div>
         <div className="text-center mt-6">
           <Link to={`/lesson/${chapterId}`} className="inline-block text-historia-gold hover:underline font-bold">Retour à la leçon</Link>
         </div>
      </div>
    );
  }

  if (quizFinished) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-4 md:py-12">
        <div className="mb-6">
          <Link to={`/courses#epoch-${chapterInfo?.epoch_id || '1'}`} className="inline-flex items-center text-slate-500 hover:text-historia-blue font-bold transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" /> Retour aux époques
          </Link>
        </div>
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-historia-blue mb-4">{chapterInfo?.title || "Quiz"}</h1>
        </header>
        <ChapterNav chapterId={chapterId} />
        <div className="max-w-3xl mx-auto mt-6 p-6 md:p-8 bg-white rounded-2xl shadow-xl border-t-8 border-historia-gold text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-historia-blue mb-3">Quiz Terminé !</h2>
          <p className="text-xl mb-6">Votre score : <span className="font-bold text-historia-gold">{score} / {questions.length}</span></p>
          <p className="text-slate-600 mb-8 text-base">Ce quiz aide à ancrer les connaissances à long terme. N'hésitez pas à relire la leçon si nécessaire.</p>
          <Link to={`/lesson/${chapterId}`} className="bg-historia-blue text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors inline-block font-bold">
            Retour à la leçon
          </Link>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 md:py-12">
      <div className="mb-6">
        <Link to={`/courses#epoch-${chapterInfo?.epoch_id || '1'}`} className="inline-flex items-center text-slate-500 hover:text-historia-blue font-bold transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" /> Retour aux époques
        </Link>
      </div>
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-historia-blue mb-4">
          {chapterInfo?.title || quizDetails?.title || "Quiz"}
        </h1>
        <p className="text-lg text-slate-500 italic font-serif">Validez vos connaissances du chapitre ({questions.length} questions)</p>
      </header>

      <ChapterNav chapterId={chapterId} />

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-100">
        <div className="bg-historia-blue p-3 md:p-4 text-white flex justify-between items-center">
          <h2 className="font-serif text-lg md:text-xl font-bold">Quiz de mémorisation</h2>
          <span className="bg-historia-gold/20 text-historia-gold px-3 py-1 rounded-full font-bold text-xs md:text-sm">
            Question {currentQuestion + 1} / {questions.length}
          </span>
        </div>

        <div className="p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-serif text-slate-800 mb-4 leading-relaxed">
            {question.question_text}
          </h3>

          <div className="space-y-2">
            {question.options.map((option, index) => {
              let buttonStyle = "border-slate-200 hover:border-historia-gold hover:bg-yellow-50 text-slate-700";
              let icon = null;

              if (showResult) {
                if (index === question.correctAnswer) {
                  buttonStyle = "border-green-500 bg-green-50 text-green-800 font-bold";
                  icon = <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />;
                } else if (index === selectedAnswer) {
                  buttonStyle = "border-red-500 bg-red-50 text-red-800";
                  icon = <XCircle className="w-5 h-5 text-red-500 ml-auto" />;
                } else {
                  buttonStyle = "border-slate-200 opacity-50";
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerClick(index)}
                  disabled={showResult}
                  className={`w-full text-left p-2 md:p-3 border-2 rounded-lg text-sm md:text-base transition-all flex items-center ${buttonStyle}`}
                >
                  <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center mr-3 text-xs font-bold text-slate-500 shrink-0">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{option}</span>
                  {icon}
                </button>
              );
            })}
          </div>

          {showResult && (
            <div className="mt-4 p-3 md:p-4 bg-slate-50 border-l-4 border-historia-blue rounded-r-lg animate-fade-in">
              <h4 className="font-bold text-historia-blue text-sm md:text-base mb-1">Explication :</h4>
              <p className="text-slate-600 text-sm">{question.explanation}</p>
              
              <button 
                onClick={nextQuestion}
                className="mt-3 bg-historia-gold text-historia-blue font-bold px-5 py-2 rounded-lg hover:bg-yellow-500 transition-colors float-right text-sm"
              >
                {currentQuestion + 1 === questions.length ? "Voir les résultats" : "Question Suivante"}
              </button>
              <div className="clear-both"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
