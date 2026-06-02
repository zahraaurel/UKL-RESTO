'use client';
import React, { useState } from 'react';

export default function Reservasi() {
  const [nama, setNama] = useState('');
  const [telepon, setTelepon] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [waktu, setWaktu] = useState('18:00');
  const [tamu, setTamu] = useState('1 orang');
  const [meja, setMeja] = useState('');
  const [catatan, setCatatan] = useState('');

  const handleReservation = (e) => {
    e.preventDefault();
    alert(`Reservasi berhasil dikirim atas nama ${nama}! Kami akan segera menghubungi Anda.`);
  };

  return (
    <section id="reservasi" className="min-h-screen bg-[#090705] text-[#f3f1ed] px-8 md:px-20 py-28 border-t border-white/[0.03]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Kolom Kiri: Informasi Kontak */}
        <div className="lg:col-span-5 space-y-8">
          <div className="text-xs tracking-[0.3em] text-brand-goldDim uppercase font-medium">
            Reservasi
          </div>
          
          <h2 className="font-serif text-5xl font-light leading-tight tracking-wide">
            Pesan <span className="text-brand-gold italic">meja Anda</span>
          </h2>
          
          <hr className="w-16 border-brand-goldDim/40" />

          <p className="text-xs text-brand-muted font-light leading-relaxed max-w-sm">
            Kami merekomendasikan reservasi setidaknya 48 jam sebelumnya, terutama untuk akhir pekan dan momen spesial. Tim kami akan memastikan setiap detail pengalaman Anda sempurna.
          </p>

          <div className="space-y-6 pt-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 border border-white/[0.05] flex items-center justify-center text-brand-gold text-xs">📞</div>
              <div>
                <div className="text-[9px] tracking-widest text-brand-goldDim uppercase font-medium">Telepon</div>
                <div className="text-xs font-light text-[#f3f1ed] mt-0.5">+62 21 5500 9988</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 border border-white/[0.05] flex items-center justify-center text-brand-gold text-xs">@</div>
              <div>
                <div className="text-[9px] tracking-widest text-brand-goldDim uppercase font-medium">Email</div>
                <div className="text-xs font-light text-[#f3f1ed] mt-0.5">reservasi@maisondor.id</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 border border-white/[0.05] flex items-center justify-center text-brand-gold text-xs">⚲</div>
              <div>
                <div className="text-[9px] tracking-widest text-brand-goldDim uppercase font-medium">Alamat</div>
                <div className="text-xs font-light text-[#f3f1ed] mt-0.5">Jl. Sudirman Kav. 52, Jakarta Selatan</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 border border-white/[0.05] flex items-center justify-center text-brand-gold text-xs">🕒</div>
              <div>
                <div className="text-[9px] tracking-widest text-brand-goldDim uppercase font-medium">Jam Buka</div>
                <div className="text-xs font-light text-[#f3f1ed] mt-0.5">Selasa—Minggu · 18.00—23.00</div>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Form Pemesanan */}
        <div className="lg:col-span-7">
          <form onSubmit={handleReservation} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <label className="block text-[9px] tracking-widest text-brand-goldDim uppercase font-medium">Nama Lengkap</label>
              <input 
                type="text" placeholder="Jean Dupont" value={nama} onChange={(e) => setNama(e.target.value)} required
                className="w-full bg-black/20 border border-white/[0.05] text-xs font-light px-4 py-3.5 outline-none focus:border-brand-gold text-[#f3f1ed] rounded-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[9px] tracking-widest text-brand-goldDim uppercase font-medium">Nomor Telepon</label>
              <input 
                type="tel" placeholder="+62 812 0000 0000" value={telepon} onChange={(e) => setTelepon(e.target.value)} required
                className="w-full bg-black/20 border border-white/[0.05] text-xs font-light px-4 py-3.5 outline-none focus:border-brand-gold text-[#f3f1ed] rounded-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[9px] tracking-widest text-brand-goldDim uppercase font-medium">Tanggal</label>
              <input 
                type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} required
                className="w-full bg-black/20 border border-white/[0.05] text-xs font-light px-4 py-3.5 outline-none focus:border-brand-gold text-[#f3f1ed] rounded-none invert-calendar-icon"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[9px] tracking-widest text-brand-goldDim uppercase font-medium">Waktu</label>
              <select value={waktu} onChange={(e) => setWaktu(e.target.value)} className="w-full bg-[#120f0b] border border-white/[0.05] text-xs font-light px-4 py-3.5 outline-none focus:border-brand-gold text-[#f3f1ed] rounded-none appearance-none cursor-pointer">
                <option value="18:00">18:00</option>
                <option value="19:00">19:00</option>
                <option value="20:00">20:00</option>
                <option value="21:00">21:00</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-[9px] tracking-widest text-brand-goldDim uppercase font-medium">Jumlah Tamu</label>
              <select value={tamu} onChange={(e) => setTamu(e.target.value)} className="w-full bg-[#120f0b] border border-white/[0.05] text-xs font-light px-4 py-3.5 outline-none focus:border-brand-gold text-[#f3f1ed] rounded-none appearance-none cursor-pointer">
                <option value="1 orang">1 orang</option>
                <option value="2 orang">2 orang</option>
                <option value="4 orang">4 orang</option>
                <option value="6 orang">6 orang</option>
                <option value="&gt; 6 orang">Lebih dari 6 orang</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-[9px] tracking-widest text-brand-goldDim uppercase font-medium">Nomor Meja (Opsional)</label>
              <select value={meja} onChange={(e) => setMeja(e.target.value)} className="w-full bg-[#120f0b] border border-white/[0.05] text-xs font-light px-4 py-3.5 outline-none focus:border-brand-gold text-[#f3f1ed] rounded-none appearance-none cursor-pointer">
                <option value="">— Pilih Meja —</option>
                <option value="Meja Utama VVIP">Meja Utama VVIP</option>
                <option value="Area Dekat Jendela">Area Dekat Jendela</option>
                <option value="Balkon Atas">Balkon Atas</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-[9px] tracking-widest text-brand-goldDim uppercase font-medium">Permintaan Khusus</label>
              <textarea rows={4} placeholder="Alergi makanan, dekorasi ulang tahun, wine pairing..." value={catatan} onChange={(e) => setCatatan(e.target.value)} className="w-full bg-black/20 border border-white/[0.05] text-xs font-light px-4 py-3.5 outline-none focus:border-brand-gold text-[#f3f1ed] rounded-none resize-none" />
            </div>

            <div className="md:col-span-2 pt-2">
              <button type="submit" className="bg-brand-gold text-[#090705] text-xs tracking-[0.25em] font-semibold uppercase px-10 py-4 hover:bg-brand-gold/90 transition duration-300 cursor-pointer">
                Konfirmasi Reservasi
              </button>
            </div>

          </form>
        </div>

      </div>
    </section>
  );
}