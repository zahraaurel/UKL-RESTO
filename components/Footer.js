import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-brand-dark text-white border-t border-white/5 pt-20 pb-10 px-8 md:px-20 font-light">
      {/* Grid Utama */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16">
        
        {/* Kolom Brand / Deskripsi */}
        <div className="lg:col-span-5 space-y-4">
          <div className="text-xl font-serif italic text-brand-gold tracking-wide">
            Maison d'Or
          </div>
          <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
            Pengalaman fine dining tak tertandingi di jantung Jakarta. 
            Setiap momen bersama kami adalah karya yang akan Anda kenang.
          </p>
        </div>

        {/* Kolom Navigasi */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="text-[11px] tracking-[0.25em] text-brand-gold font-medium uppercase">
            Navigasi
          </h4>
          <ul className="space-y-3 text-xs text-gray-400">
            <li><a href="#" className="hover:text-brand-gold transition">Beranda</a></li>
            <li><a href="#about" className="hover:text-brand-gold transition">Tentang</a></li>
            <li><a href="#menu" className="hover:text-brand-gold transition">Menu</a></li>
            <li><a href="#reservasi" className="hover:text-brand-gold transition">Reservasi</a></li>
          </ul>
        </div>

        {/* Kolom Sosial */}
        <div className="lg:col-span-3 space-y-4">
          <h4 className="text-[11px] tracking-[0.25em] text-brand-gold font-medium uppercase">
            Sosial
          </h4>
          <ul className="space-y-3 text-xs text-gray-400">
            <li><a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-brand-gold transition">Instagram</a></li>
            <li><a href="https://tripadvisor.com" target="_blank" rel="noreferrer" className="hover:text-brand-gold transition">TripAdvisor</a></li>
            <li><a href="https://maps.google.com" target="_blank" rel="noreferrer" className="hover:text-brand-gold transition">Google Maps</a></li>
          </ul>
        </div>

      </div>

      {/* Hak Cipta (Copyright) */}
      <div className="border-t border-white/5 pt-8 text-center">
        <p className="text-[11px] tracking-widest text-gray-500 font-light">
          © 2025 Maison d'Or · All rights reserved · Jakarta, Indonesia
        </p>
      </div>
    </footer>
  );
}