import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [epochs, setEpochs] = useState([]);

  useEffect(() => {
    async function fetchEpochs() {
      const { data, error } = await supabase.from('epochs').select('*').order('order');
      if (!error && data) {
        setEpochs(data);
      }
    }
    fetchEpochs();
  }, []);

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      {/* Hero Section */}
      <section className="bg-historia-blue text-white py-20 px-4 text-center flex-grow flex flex-col justify-center items-center relative overflow-hidden">
        {/* Placeholder for an epic historical background image */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center"></div>
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-5xl font-serif font-bold mb-6">Plongez dans le récit de l'Humanité</h1>
          <p className="text-xl text-slate-300 mb-8 font-light">
            Historia vous propose 10 grandes époques et 200 chapitres captivants pour découvrir l'histoire comme vous ne l'avez jamais lue.
          </p>
          <Link to="/courses" className="bg-historia-gold hover:bg-yellow-500 text-historia-blue font-bold py-3 px-8 rounded-full text-lg transition-transform hover:scale-105 inline-block">
            Commencer l'Aventure
          </Link>
        </div>
      </section>

      {/* Epochs Preview */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl font-serif font-bold text-center mb-12 text-historia-blue">Les Grandes Époques</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {epochs.map(epoch => (
            <Link to={`/courses#epoch-${epoch.id}`} key={epoch.id} className="bg-white rounded-lg shadow-lg overflow-hidden border border-slate-100 hover:shadow-xl transition-shadow cursor-pointer group flex flex-col">
              <div className="h-48 bg-slate-200 relative flex items-center justify-center overflow-hidden">
                {epoch.image_url ? (
                  <img src={epoch.image_url} alt={epoch.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="absolute inset-0 bg-historia-blue opacity-10"></div>
                )}
              </div>
              <div className="p-6 flex-grow">
                <h3 className="font-serif text-xl font-bold mb-2 text-historia-blue group-hover:text-historia-gold transition-colors">{epoch.title}</h3>
                <p className="text-slate-600 line-clamp-3">{epoch.description || 'Découvrez cette grande époque de notre histoire.'}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
