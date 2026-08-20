import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Clock, FileText, Sparkles } from 'lucide-react';

export default function ChapterNav({ chapterId }) {
  const location = useLocation();
  const path = location.pathname;

  const isQuiz = path.includes('/quiz');
  const isArt = path.includes('/annex');
  const isTimeline = path.includes('/frise');
  const isLesson = !isQuiz && !isArt && !isTimeline;

  return (
    <div className="flex border-b border-slate-200 mb-10 overflow-x-auto hide-scrollbar">
      <Link 
        to={`/lesson/${chapterId}`}
        className={`flex items-center px-4 py-3 sm:px-5 sm:py-4 font-bold whitespace-nowrap transition-colors ${
          isLesson 
            ? 'bg-yellow-50 text-historia-gold border-b-4 border-historia-gold' 
            : 'text-slate-500 hover:text-historia-gold hover:bg-slate-50 border-b-4 border-transparent'
        }`}
      >
        <BookOpen className="w-5 h-5 mr-2" /> Leçon
      </Link>
      
      <Link 
        to={`/lesson/${chapterId}/frise`}
        className={`flex items-center px-4 py-3 sm:px-5 sm:py-4 font-bold whitespace-nowrap transition-colors ${
          isTimeline 
            ? 'bg-yellow-50 text-historia-gold border-b-4 border-historia-gold' 
            : 'text-slate-500 hover:text-historia-gold hover:bg-slate-50 border-b-4 border-transparent'
        }`}
      >
        <Clock className="w-5 h-5 mr-2" /> Frise
      </Link>
      
      <Link 
        to={`/lesson/${chapterId}/quiz`}
        className={`flex items-center px-4 py-3 sm:px-5 sm:py-4 font-bold whitespace-nowrap transition-colors ${
          isQuiz 
            ? 'bg-yellow-50 text-historia-gold border-b-4 border-historia-gold' 
            : 'text-slate-500 hover:text-historia-gold hover:bg-slate-50 border-b-4 border-transparent'
        }`}
      >
        <FileText className="w-5 h-5 mr-2" /> Quiz
      </Link>

      <Link 
        to={`/lesson/${chapterId}/annex`}
        className={`flex items-center px-4 py-3 sm:px-5 sm:py-4 font-bold whitespace-nowrap transition-colors ${
          isArt 
            ? 'bg-yellow-50 text-historia-gold border-b-4 border-historia-gold' 
            : 'text-slate-500 hover:text-historia-gold hover:bg-slate-50 border-b-4 border-transparent'
        }`}
      >
        <Sparkles className="w-5 h-5 mr-2" /> Art
      </Link>
    </div>
  );
}
