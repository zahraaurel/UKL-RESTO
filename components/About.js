import React from 'react';

export default function About() {
  return (
    <section id="about" className="min-h-screen bg-brand-dark text-white px-8 md:px-20 py-24 flex flex-col justify-center border-t border-white/5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Kolom Teks */}
        <div className="lg:col-span-7 space-y-8">
          <div className="text-xs tracking-[0.3em] text-brand-goldDim uppercase">Tentang Kami</div>
          
          <h2 className="font-serif text-4xl md:text-5xl font-light leading-tight">
            Seni di <span className="text-brand-gold italic">setiap sajian</span>
          </h2>
          
          <hr className="w-16 border-brand-goldDim/40" />

          <div className="space-y-6 text-sm text-gray-400 font-light leading-relaxed max-w-xl">
            <p>
              Maison d'Or lahir dari keyakinan bahwa makan malam bukan sekadar aktivitas — melainkan sebuah <span className="text-white font-normal">ritual keindahan</span>. Setiap hidangan kami adalah karya yang terinspirasi dari tradisi kuliner Prancis klasik yang dipadukan dengan cita rasa Nusantara.
            </p>
            <p>
              Chef Armand Bertrand, bersama tim kami yang terdidik di sekolah masak terkemuka Eropa, menghadirkan perpaduan rasa yang tak terduga namun harmonis — menjadikan setiap kunjungan sebagai kenangan yang tak terlupakan.
            </p>
          </div>

          {/* Statistik */}
          <div className="grid grid-cols-3 gap-4 pt-8 max-w-md">
            <div>
              <div className="font-serif text-3xl text-brand-gold">12</div>
              <div className="text-[10px] tracking-wider text-brand-goldDim uppercase mt-1">Tahun Berdiri</div>
            </div>
            <div>
              <div className="font-serif text-3xl text-brand-gold">3</div>
              <div className="text-[10px] tracking-wider text-brand-goldDim uppercase mt-1">Penghargaan</div>
            </div>
            <div>
              <div className="font-serif text-3xl text-brand-gold">48</div>
              <div className="text-[10px] tracking-wider text-brand-goldDim uppercase mt-1">Kursi Premium</div>
            </div>
          </div>
        </div>

        {/* Kolom Gambar */}
        <div className="lg:col-span-5 flex justify-center items-center h-80 lg:h-[450px] border border-white/5 bg-[#12110E]/40 relative overflow-hidden rounded-3xl">
          <img
            src="https://decode.uai.ac.id/wp-content/uploads/2022/03/restaurant.jpg-1500x1000.webp"
            alt="Suasana restoran"
            className="object-cover w-full h-full"
          />
        </div>

      </div>
    </section>
  );
}