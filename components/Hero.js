import React from 'react';

export default function Hero() {
  return (
    <section className="relative h-screen flex flex-col justify-center items-center bg-brand-dark text-center px-4 pt-20">
      <div className="text-xs tracking-[0.3em] text-brand-goldDim uppercase mb-4">
        Jakarta · Est. 2018 · Michelin Recommended
      </div>
      
      <h1 className="font-serif text-6xl md:text-8xl text-white font-light leading-tight mb-2">
        Maison
      </h1>
      <h2 className="font-serif text-5xl md:text-7xl text-brand-gold italic font-light mb-8">
        d'Or
      </h2>

      <p className="text-sm tracking-wide text-gray-400 max-w-xl font-light mb-12">
        Pengalaman kuliner yang melampaui waktu — di jantung kota Jakarta
      </p>

      {/* Call to Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-16">
        <a href="#menu" className="border border-white/20 text-white px-8 py-3 text-xs tracking-[0.2em] font-medium uppercase hover:border-brand-gold hover:text-brand-gold transition duration-300 flex items-center justify-center">
          Jelajahi Menu
        </a>
      </div>

      {/* Indikator Scroll */}
      <div className="absolute bottom-8 flex flex-col items-center gap-2">
        <span className="text-[10px] tracking-[0.4em] text-brand-goldDim uppercase">Scroll</span>
        <div className="w-[1px] h-10 bg-brand-goldDim/40"></div>
      </div>
    </section>
  );
}