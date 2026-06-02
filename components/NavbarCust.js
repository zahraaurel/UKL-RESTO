import React from 'react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-brand-dark/80 backdrop-blur-md px-8 py-6 flex justify-between items-center border-b border-white/5">
      {/* Logo */}
      <div className="text-xl font-serif italic text-brand-gold tracking-wide cursor-pointer">
        Maison d'Or
      </div>
      
      {/* Menu Navigasi */}
      <div className="text-center hidden md:flex flex-1 justify-center space-x-8 text-xs tracking-[0.2em] text-gray-400 uppercase">
        <a href="#about" className="hover:text-brand-gold transition">About</a>
        <a href="#menu" className="hover:text-brand-gold transition">Menu</a>
      </div>

      {/* Tombol Masuk Portal */}
      <a href="/login" className="border border-brand-gold px-4 py-2 text-xs tracking-widest text-brand-gold hover:bg-brand-gold hover:text-black transition duration-300" aria-label="Login">
        Login
      </a>
    </nav>
  );
}