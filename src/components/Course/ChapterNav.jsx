import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Clock, FileText, Sparkles, Video } from 'lucide-react';

export default function ChapterNav({ chapterId }) {
  const location = useLocation();
  const path = location.pathname;

  const isQuiz = path.includes('/quiz');
  const isArt = path.includes('/annex');
  const isVideo = path.includes('/video');
  const isTimeline = path.includes('/frise');
  const isLesson = !isQuiz && !isArt && !isTimeline && !isVideo;

  return (
    <div className="flex border-b border-slate-200 mb-10 overflow-x-auto hide-scrollbar justify-between sm:justify-start">
      <Link 
        to={`/lesson/${chapterId}`}
        className={`flex flex-col sm:flex-row items-center justify-center flex-1 sm:flex-none px-2 py-3 sm:px-5 sm:py-4 font-bold whitespace-nowrap transition-colors text-xs sm:text-base ${
          isLesson 
            ? 'bg-yellow-50 text-historia-gold border-b-4 border-historia-gold' 
            : 'text-slate-500 hover:text-historia-gold hover:bg-slate-50 border-b-4 border-transparent'
        }`}
      >
        <BookOpen className="w-5 h-5 mb-1 sm:mb-0 sm:mr-2" /> Leçon
      </Link>
      
      <Link 
        to={`/lesson/${chapterId}/frise`}
        className={`flex flex-col sm:flex-row items-center justify-center flex-1 sm:flex-none px-2 py-3 sm:px-5 sm:py-4 font-bold whitespace-nowrap transition-colors text-xs sm:text-base ${
          isTimeline 
            ? 'bg-yellow-50 text-historia-gold border-b-4 border-historia-gold' 
            : 'text-slate-500 hover:text-historia-gold hover:bg-slate-50 border-b-4 border-transparent'
        }`}
      >
        <Clock className="w-5 h-5 mb-1 sm:mb-0 sm:mr-2" /> Frise
      </Link>
      
      <Link 
        to={`/lesson/${chapterId}/quiz`}
        className={`flex flex-col sm:flex-row items-center justify-center flex-1 sm:flex-none px-2 py-3 sm:px-5 sm:py-4 font-bold whitespace-nowrap transition-colors text-xs sm:text-base ${
          isQuiz 
            ? 'bg-yellow-50 text-historia-gold border-b-4 border-historia-gold' 
            : 'text-slate-500 hover:text-historia-gold hover:bg-slate-50 border-b-4 border-transparent'
        }`}
      >
        <FileText className="w-5 h-5 mb-1 sm:mb-0 sm:mr-2" /> Quiz
      </Link>

      <Link 
        to={`/lesson/${chapterId}/annex`}
        className={`flex flex-col sm:flex-row items-center justify-center flex-1 sm:flex-none px-2 py-3 sm:px-5 sm:py-4 font-bold whitespace-nowrap transition-colors text-xs sm:text-base ${
          isArt 
            ? 'bg-yellow-50 text-historia-gold border-b-4 border-historia-gold' 
            : 'text-slate-500 hover:text-historia-gold hover:bg-slate-50 border-b-4 border-transparent'
        }`}
      >
        <Sparkles className="w-5 h-5 mb-1 sm:mb-0 sm:mr-2" /> Art
      </Link>

      <Link 
        to={`/lesson/${chapterId}/video`}
        className={`flex flex-col sm:flex-row items-center justify-center flex-1 sm:flex-none px-2 py-3 sm:px-5 sm:py-4 font-bold whitespace-nowrap transition-colors text-xs sm:text-base ${
          isVideo 
            ? 'bg-yellow-50 text-historia-gold border-b-4 border-historia-gold' 
            : 'text-slate-500 hover:text-historia-gold hover:bg-slate-50 border-b-4 border-transparent'
        }`}
      >
        <Video className="w-5 h-5 mb-1 sm:mb-0 sm:mr-2" /> Vidéo
      </Link>
    </div>
  );
}
