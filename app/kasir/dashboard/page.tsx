'use client';
import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/NavbarKasir';

export default function CashierDashboardPage(): React.JSX.Element {
  return (
    <main className="bg-[#090705] min-h-screen text-[#f3f1ed] antialiased flex flex-col justify-between">
      <Navbar />

      {/* Main Content */}
      <div className="flex-grow flex flex-col justify-center items-center px-6 text-center pt-20">
        <div className="space-y-4 max-w-xl">
          <div className="text-xs tracking-[0.2em] text-brand-goldDim uppercase font-medium">
            Maison d'Or Internal Portal
          </div>

          <h1 className="font-serif text-4xl md:text-5xl font-light tracking-wide text-[#f3f1ed]">
            Selamat Datang di <span className="text-brand-gold italic">Dashboard Kasir</span>
          </h1>

          <p className="text-xs text-brand-muted font-light leading-relaxed max-w-sm mx-auto pt-2">
            Silakan pilih aktivitas operasional Anda hari ini melalui tombol akses cepat di bawah ini.
          </p>

          <hr className="w-12 border-brand-goldDim/30 mx-auto my-8" />

          {/* Tombol Navigasi Sederhana */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
            <Link
              href="/kasir/transaksi"
              className="w-full sm:w-auto border border-white/10 text-brand-muted hover:text-white hover:border-brand-goldDim font-medium text-xs tracking-widest uppercase px-8 py-4 transition duration-300"
            >
              🛒 Mulai Transaksi
            </Link>

            <Link
              href="/kasir/transaksi"
              className="border border-white/10 text-brand-muted hover:text-white hover:border-brand-goldDim font-medium text-xs tracking-widest uppercase px-6 py-4 transition duration-300 text-center"
            >
              💳 Kelola Transaksi
            </Link>
          </div>
        </div>
      </div>

      {/* Identitas Kaki Ringan */}
      <div className="py-8 text-center text-[10px] text-gray-600 tracking-wider font-light">
        Maison d'Or Resto System · Cashier Mode
      </div>
    </main>
  );
}