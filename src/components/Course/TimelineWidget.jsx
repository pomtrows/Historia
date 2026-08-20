import React from 'react';
import { ArrowUp } from 'lucide-react';

export default function TimelineWidget({ events = [] }) {
  if (!events || events.length === 0) return null;

  return (
    <section className="my-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-end mb-8 gap-6 relative">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="sm:absolute sm:right-0 flex items-center text-slate-500 hover:text-historia-gold transition-colors text-sm font-bold bg-white border border-slate-200 hover:border-historia-gold hover:bg-yellow-50 shadow-sm px-4 py-2 rounded-full z-10"
          title="Retourner en haut de la page"
        >
          <ArrowUp className="w-4 h-4 mr-2" /> Haut
        </button>
      </div>
      <div className="relative border-l-4 border-historia-gold ml-4 md:ml-12 space-y-8 pb-8">
        
        {events.map((event, index) => (
          <div key={event.id || index} className="relative pl-8 group">
            {/* Le point sur la ligne */}
            <div className="absolute w-6 h-6 bg-historia-gold rounded-full -left-[14.5px] top-1 border-4 border-white shadow-sm group-hover:scale-125 transition-transform"></div>
            
            {/* Le contenu de l'événement */}
            <div className="bg-white p-5 rounded-lg shadow-md border border-slate-100 hover:shadow-lg transition-shadow">
              <span className="text-historia-gold font-bold text-sm tracking-wider uppercase">{event.year_label}</span>
              <h4 className="font-serif text-xl font-bold text-historia-blue mt-1 mb-2">{event.title}</h4>
              <p className="text-slate-600">{event.description}</p>
            </div>
          </div>
        ))}
        
      </div>
    </section>
  );
}
